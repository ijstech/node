"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobQueue = void 0;
exports.getJobQueue = getJobQueue;
const bee_queue_1 = __importDefault(require("./bee-queue"));
;
let Queues = {};
;
class JobQueue {
    constructor(options) {
        this._options = options;
        this._queue = new bee_queue_1.default(options.jobQueue, {
            redis: options.connection.redis,
            removeOnSuccess: true,
            removeOnFailure: true
        });
    }
    ;
    async createJob(data, waitForResult, options) {
        return new Promise(async (resolve) => {
            let job = this._queue.createJob(data).retries(options?.retries || 5);
            job.on('succeeded', (result) => {
                if (waitForResult)
                    resolve({
                        id: job.id,
                        progress: 100,
                        status: 'succeeded',
                        result: result
                    });
            });
            job.on('failed', (err) => {
                if (waitForResult)
                    resolve({
                        id: result.id,
                        progress: result.progress,
                        status: 'failed'
                    });
            });
            if (options?.id)
                job.setId(options.id);
            let result = await job.save();
            if (!waitForResult)
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
    async stop() {
        Queues = {};
        return new Promise((resolve) => {
            this._queue.close(() => {
                resolve(null);
            });
        });
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
;
