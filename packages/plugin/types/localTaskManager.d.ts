import { ITaskManager, ITaskOptions, ITask } from '@ijstech/types';
export declare class LocalTaskManager implements ITaskManager {
    private storage;
    constructor();
    private generateTaskId;
    startTask(options: ITaskOptions | string, id?: string): Promise<ITask>;
    resumeTask(taskId: string): Promise<void>;
    completeStep(taskId: string, stepName: string): Promise<void>;
    completeTask(taskId: string): Promise<void>;
    loadTask(taskId: string): Promise<ITask | undefined>;
    private saveTaskState;
}
