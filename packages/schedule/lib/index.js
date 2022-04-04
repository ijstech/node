"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const plugin_1 = require("@ijstech/plugin");
const cron_parser_1 = __importDefault(require("cron-parser"));
class Scheduler {
    constructor(options) {
        this.jobs = [];
        this.options = options;
        this.options.jobs = this.options.jobs || [];
        for (let i = 0; i < this.options.jobs.length; i++)
            this.addJob(this.options.jobs[i]);
    }
    addJob(job) {
        this.jobs.push(job);
    }
    ;
    start() {
        if (this.started)
            return;
        if (this.jobs.length == 0)
            return;
        this.started = true;
        this.timer = setInterval(() => {
            this.processJobs();
        }, 500);
    }
    async runJob(job) {
        if (!job.next) {
            job.next = cron_parser_1.default.parseExpression(job.cron).next();
            console.log('Next Schedule: ' + job.next.toString() + ' ' + job.scriptPath);
        }
        if (job.next.getTime() < new Date().getTime()) {
            job.processing = true;
            try {
                if (!job.plugin) {
                    job.plugin = new plugin_1.Worker(job);
                    await job.plugin.init(job.params);
                }
                await job.plugin.process(job.params);
                job.next = cron_parser_1.default.parseExpression(job.cron).next();
                console.log('Next Schedule: ' + job.next.toString() + ' ' + job.scriptPath);
            }
            finally {
                job.processing = false;
            }
        }
    }
    processJobs() {
        this.jobs.forEach(async (job) => {
            if (!job.disabled && !job.processing) {
                this.runJob(job);
            }
        });
    }
}
exports.Scheduler = Scheduler;
