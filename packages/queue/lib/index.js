"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = exports.Queue = void 0;
const plugin_1 = require("@ijstech/plugin");
const message_1 = require("@ijstech/message");
const jobQueue_1 = require("./jobQueue");
class Queue {
    constructor(options) {
        this.options = options;
    }
    ;
    runWorker(worker) {
        worker.plugin = new plugin_1.Worker(worker);
        worker.queue = jobQueue_1.getJobQueue(worker);
        if (worker.plugins && worker.plugins.message) {
            worker.message = new message_1.Message(worker.plugin, worker.plugins.message);
        }
        worker.queue.processJob(async (job) => {
            try {
                let result = await worker.plugin.process(job.data);
                return result;
            }
            catch (err) {
                console.trace(err);
            }
        });
    }
    ;
    start() {
        if (this.started)
            return;
        this.started = true;
        for (let i = 0; i < this.options.workers.length; i++) {
            let worker = this.options.workers[i];
            if (!worker.disabled)
                this.runWorker(worker);
        }
        ;
    }
    ;
}
exports.Queue = Queue;
function loadPlugin(plugin, options, vm) {
    return {
        createJob: async function (queue, data, waitForResult, timeout, retries) {
            if (typeof (queue) == 'number')
                queue = options.queues[queue];
            if (queue && options.queues.indexOf(queue) >= 0) {
                let q = jobQueue_1.getJobQueue({
                    jobQueue: queue,
                    connection: options.connection
                });
                let job = await q.createJob(data, waitForResult, timeout, retries);
                if (vm)
                    return JSON.stringify(job);
                else
                    return job;
            }
            ;
        }
    };
}
exports.loadPlugin = loadPlugin;
;
exports.default = loadPlugin;
