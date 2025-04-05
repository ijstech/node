import { ITaskManager, ITaskOptions, ITask, IStepConfig } from '@ijstech/types';

export function step(config?: IStepConfig) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor?.value;
        let stepName = propertyKey.toString()
        descriptor.value = async function (...args: any[]) {
            let taskManager: ITaskManager = global['$$taskManager'];
            const taskId = (this as any).taskId;
            if (taskManager) {                
                if (!taskId) {
                    throw new Error('Task ID is not set.');
                };
                if (taskManager) {
                    let taskdata: any = await taskManager.loadTask(taskId);
                    const task: ITask = JSON.parse(taskdata);
                    if (task?.completedSteps.includes(stepName)) {
                        // console.log(`Skipping ${stepName} as it has already been completed.`);
                        return; // Skip execution if the step is already completed
                    };                    
                };                
            };
            let attempt = 0;
            let delay = config?.delay || 1000;
            let retryOnFailure: boolean;
            let delayMultiplier = config?.delayMultiplier || 2
            if (config?.retryOnFailure !== false && config?.maxAttempts)
                retryOnFailure = true;
            else
                retryOnFailure = config?.retryOnFailure || false;
            let maxAttempts = config?.maxAttempts || 3;    
            while (attempt < maxAttempts) {
                try {
                    let result =await originalMethod.apply(this, args);
                    if (taskManager)
                        await taskManager.completeStep(taskId, stepName);
                    return result; // Exit loop if successful
                } catch (error) {
                    if (!retryOnFailure) {
                        throw error; // Rethrow error if retry is not enabled
                    };
                    attempt++;
                    if (attempt < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                        delay *= delayMultiplier; // Increase delay for next attempt            
                    } else {
                        throw error; // Rethrow error if max attempts reached
                    };
                };
            };
        };
        return descriptor;
    };
};
export function task(options: ITaskOptions) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (taskId?: string) {
            let taskManager: ITaskManager = global.$$taskManager;
            if (taskManager) {
                let task: ITask;
                if (taskId) {
                    let data: any = await taskManager.loadTask(taskId);
                    if (typeof data == 'string')
                        task = JSON.parse(data)
                    else
                        task = data;
                }
                if (!task) {
                    const data: any = await taskManager.startTask(options, taskId);
                    if (typeof data == 'string')
                        task = JSON.parse(data)
                    else
                        task = data;
                    taskId = task.id;
                    (this as any).taskId = task.id;
                }
                else {
                    (this as any).taskId = task.id;
                    await taskManager.resumeTask(task.id);
                };
                try {
                    let result = await originalMethod.apply(this, [taskId]);
                    await taskManager.completeTask((this as any).taskId);
                    return result;
                } catch (error) {
                    throw error;
                }
            }
            else{
                try {
                    let result = await originalMethod.apply(this, [taskId]);
                    return result;
                } catch (error) {
                    throw error;
                }
            }
        };
        return descriptor;
    };
};