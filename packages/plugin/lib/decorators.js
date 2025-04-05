"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.step = step;
exports.task = task;
function step(config) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor?.value;
        let stepName = propertyKey.toString();
        descriptor.value = async function (...args) {
            let taskManager = global['$$taskManager'];
            const taskId = this.taskId;
            if (taskManager) {
                if (!taskId) {
                    throw new Error('Task ID is not set.');
                }
                ;
                if (taskManager) {
                    let taskdata = await taskManager.loadTask(taskId);
                    const task = JSON.parse(taskdata);
                    if (task?.completedSteps.includes(stepName)) {
                        return;
                    }
                    ;
                }
                ;
            }
            ;
            let attempt = 0;
            let delay = config?.delay || 1000;
            let retryOnFailure;
            let delayMultiplier = config?.delayMultiplier || 2;
            if (config?.retryOnFailure !== false && config?.maxAttempts)
                retryOnFailure = true;
            else
                retryOnFailure = config?.retryOnFailure || false;
            let maxAttempts = config?.maxAttempts || 3;
            while (attempt < maxAttempts) {
                try {
                    let result = await originalMethod.apply(this, args);
                    if (taskManager)
                        await taskManager.completeStep(taskId, stepName);
                    return result;
                }
                catch (error) {
                    if (!retryOnFailure) {
                        throw error;
                    }
                    ;
                    attempt++;
                    if (attempt < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                        delay *= delayMultiplier;
                    }
                    else {
                        throw error;
                    }
                    ;
                }
                ;
            }
            ;
        };
        return descriptor;
    };
}
;
function task(options) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (taskId) {
            let taskManager = global.$$taskManager;
            if (taskManager) {
                let task;
                if (taskId) {
                    let data = await taskManager.loadTask(taskId);
                    if (typeof data == 'string')
                        task = JSON.parse(data);
                    else
                        task = data;
                }
                if (!task) {
                    const data = await taskManager.startTask(options, taskId);
                    if (typeof data == 'string')
                        task = JSON.parse(data);
                    else
                        task = data;
                    taskId = task.id;
                    this.taskId = task.id;
                }
                else {
                    this.taskId = task.id;
                    await taskManager.resumeTask(task.id);
                }
                ;
                try {
                    let result = await originalMethod.apply(this, [taskId]);
                    await taskManager.completeTask(this.taskId);
                    return result;
                }
                catch (error) {
                    throw error;
                }
            }
            else {
                try {
                    let result = await originalMethod.apply(this, [taskId]);
                    return result;
                }
                catch (error) {
                    throw error;
                }
            }
        };
        return descriptor;
    };
}
;
