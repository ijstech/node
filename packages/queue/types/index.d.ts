import { Worker } from '@ijstech/plugin';
import { Message } from '@ijstech/message';
import { VM } from '@ijstech/vm';
import { JobQueue } from './jobQueue';
import * as Types from '@ijstech/types';
export { IQueueOptions } from '@ijstech/types';
interface IQueueWorkerOptions extends Types.IQueuePluginOptions {
    plugin?: Worker;
    queue?: JobQueue;
    message?: Message;
}
export declare class Queue {
    private options;
    private started;
    constructor(options: Types.IQueueOptions);
    runWorker(worker: IQueueWorkerOptions): void;
    start(): void;
}
export declare function loadPlugin(plugin: Worker, options: Types.IQueueRequiredPluginOptions, vm?: VM): Types.IQueuePlugin;
export default loadPlugin;
