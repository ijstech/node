"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalTaskManager = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class LocalStorage {
    constructor(storageFile = '../local-storage.json') {
        this.storageFile = path.resolve(__dirname, storageFile);
        this.initStorage();
    }
    async initStorage() {
        try {
            if (!(await fs.stat(this.storageFile).catch(() => null))) {
                await fs.writeFile(this.storageFile, '{}');
            }
        }
        catch (err) { }
    }
    ;
    async setItem(key, value) {
        const data = await this.getData();
        data[key] = value;
        await fs.writeFile(this.storageFile, JSON.stringify(data, null, 2), 'utf8');
    }
    async getItem(key) {
        const data = await this.getData();
        return data[key] || null;
    }
    async getData() {
        try {
            const data = await fs.readFile(this.storageFile, 'utf8');
            return JSON.parse(data);
        }
        catch (err) {
            return {};
        }
    }
}
;
class LocalTaskManager {
    constructor() {
        this.storage = new LocalStorage();
        this.storage = new LocalStorage();
    }
    ;
    async generateTaskId() {
        const randomHex = (length) => {
            return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        };
        const segments = [
            randomHex(8),
            randomHex(4),
            '4' + randomHex(3),
            ((Math.floor(Math.random() * 4) + 8).toString(16)) + randomHex(3),
            randomHex(12),
        ];
        return segments.join('-');
    }
    ;
    async startTask(options, id) {
        try {
            if (typeof (options) === 'string')
                options = JSON.parse(options);
            let task;
            if (id)
                task = await this.loadTask(id);
            if (!task) {
                const taskId = id || await this.generateTaskId();
                task = {
                    id: taskId,
                    name: options.name,
                    status: 'pending',
                    lastCompletedStep: '',
                    completedSteps: []
                };
                await this.saveTaskState(taskId, task);
            }
            ;
            return JSON.stringify(task);
        }
        catch (err) {
            console.dir(err);
        }
    }
    ;
    async resumeTask(taskId) {
        const task = await this.loadTask(taskId);
        if (!task) {
            throw new Error(`Task with ID ${taskId} does not exist.`);
        }
        ;
        task.status = 'running';
        await this.saveTaskState(taskId, task);
    }
    ;
    async completeStep(taskId, stepName) {
        const task = await this.loadTask(taskId);
        if (!task) {
            throw new Error(`Task with ID ${taskId} does not exist.`);
        }
        ;
        task.status = 'running';
        task.lastCompletedStep = stepName;
        task.completedSteps.push(stepName);
        await this.saveTaskState(taskId, task);
    }
    ;
    async completeTask(taskId) {
        const task = await this.loadTask(taskId);
        if (!task) {
            throw new Error(`Task with ID ${taskId} does not exist.`);
        }
        ;
        task.status = 'completed';
        await this.saveTaskState(taskId, task);
    }
    ;
    async loadTask(taskId) {
        const task = await this.storage.getItem(taskId);
        if (task) {
            return JSON.parse(task);
        }
        return undefined;
    }
    ;
    async saveTaskState(taskId, task) {
        await this.storage.setItem(taskId, JSON.stringify(task));
    }
    ;
}
exports.LocalTaskManager = LocalTaskManager;
;
