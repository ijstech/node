"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobQueue = exports.JobQueue = void 0;
const bee_queue_1 = __importDefault(require("bee-queue"));
;
let Queues = {};
;
class JobQueue {
    constructor(options) {
        this._options = options;
        this._queue = new bee_queue_1.default(options.jobQueue, { redis: options.connection.redis });
    }
    ;
    async createJob(data, waitForResult, timeout, retries) {
        return new Promise(async (resolve) => {
            let job = this._queue.createJob(data).retries(retries || 5);
            let result = await job.save();
            if (waitForResult) {
                job.on('succeeded', (result) => {
                    resolve({
                        id: job.id,
                        progress: 100,
                        status: 'succeeded',
                        result: result
                    });
                });
                job.on('failed', (err) => {
                    resolve({
                        id: result.id,
                        progress: result.progress,
                        status: 'failed'
                    });
                });
            }
            else
                resolve({
                    id: result.id,
                    progress: result.progress,
                    status: result.status
                });
        });
    }
    ;
    processJob(handler) {
        this._queue.process(handler);
    }
    ;
}
exports.JobQueue = JobQueue;
;
function getJobQueue(options) {
    let id = options.connection.redis.host + ':' + (options.connection.redis.db || 0) + ':' + options.jobQueue;
    if (!Queues[id])
        Queues[id] = new JobQueue(options);
    return Queues[id];
}
exports.getJobQueue = getJobQueue;
;
