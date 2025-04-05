import * as fs from 'fs/promises';
import * as path from 'path';
import {ITaskManager, ITaskOptions, ITask} from '@ijstech/types';

class LocalStorage {
    private storageFile: string;

    constructor(storageFile = '../local-storage.json') {
        this.storageFile = path.resolve(__dirname, storageFile);
        this.initStorage();
    }
    private async initStorage(): Promise<void> {
        try{
            if (!(await fs.stat(this.storageFile).catch(() => null))) {
                await fs.writeFile(this.storageFile, '{}');
            }    
        }
        catch(err){}
    };
    public async setItem(key: string, value: string): Promise<void> {
        const data = await this.getData();
        data[key] = value;
        await fs.writeFile(this.storageFile, JSON.stringify(data, null, 2), 'utf8');
    }
    public async getItem(key: string): Promise<string | null> {
        const data = await this.getData();
        return data[key] || null;
    }
    private async getData(): Promise<{ [key: string]: any }> {
        try {
            const data = await fs.readFile(this.storageFile, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            return {};
        }
    }
};
export class LocalTaskManager implements ITaskManager {
    private storage: LocalStorage = new LocalStorage();
    constructor(){
        this.storage = new LocalStorage();
    };
    private async generateTaskId(): Promise<string>{
        // Helper function to generate a random hex string of specified length
        const randomHex = (length: number): string => {
            return Array.from({ length }, () => 
            Math.floor(Math.random() * 16).toString(16)
            ).join('');
        };
        // Generate segments of the UUID
        const segments = [
            randomHex(8),    // 8 characters
            randomHex(4),    // 4 characters
            '4' + randomHex(3), // 4xxx (version 4)
            // For the 'y' segment, ensure it starts with 8, 9, a, or b (per UUID v4 spec)
            ((Math.floor(Math.random() * 4) + 8).toString(16)) + randomHex(3), // yxxx
            randomHex(12),   // 12 characters
        ];
        // Join with hyphens
        return segments.join('-');
    };
    async startTask(options: ITaskOptions | string, id?: string): Promise<ITask>{
        try{
            if (typeof(options) === 'string')
                options = JSON.parse(options) as ITaskOptions;
            let task: ITask | undefined;
            if (id)
                task= await this.loadTask(id);
            
            if (!task){
                const taskId = id || await this.generateTaskId();
                task = {
                    id: taskId,
                    name: options.name,
                    status: 'pending',
                    lastCompletedStep: '',
                    completedSteps: []
                };
                await this.saveTaskState(taskId, task);
            };
            return JSON.stringify(task) as any;
        }
        catch(err){
            console.dir(err)
        }
    };
    async resumeTask(taskId: string): Promise<void>{
        const task = await this.loadTask(taskId);
        if (!task) {
        throw new Error(`Task with ID ${taskId} does not exist.`);
        };
        task.status = 'running';
        await this.saveTaskState(taskId, task);
    };
    async completeStep(taskId: string, stepName: string): Promise<void>{
        const task = await this.loadTask(taskId);
        if (!task) {
        throw new Error(`Task with ID ${taskId} does not exist.`);
        };
        task.status = 'running';
        task.lastCompletedStep = stepName;
        task.completedSteps.push(stepName);
        await this.saveTaskState(taskId, task);
    };
    async completeTask(taskId: string): Promise<void>{
        const task = await this.loadTask(taskId);
        if (!task) {
        throw new Error(`Task with ID ${taskId} does not exist.`);
        };
        task.status = 'completed';
        await this.saveTaskState(taskId, task);
    };
    async loadTask(taskId: string): Promise<ITask | undefined>{
        const task = await this.storage.getItem(taskId);
        if (task) {
            return JSON.parse(task) as ITask;
        }
        return undefined;
    };
    private async saveTaskState(taskId: string, task: ITask): Promise<void> {
        await this.storage.setItem(taskId, JSON.stringify(task));
    };
};