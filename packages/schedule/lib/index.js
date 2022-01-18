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
        this.options = options;
        this.options.jobs = this.options.jobs || [];
    }
    start() {
        if (this.started)
            return;
        this.started = true;
        this.jobs = [];
        this.options.jobs.forEach((job) => {
            if (!job.disabled)
                this.jobs.push(job);
        });
        if (this.jobs.length == 0)
            return;
        this.timer = setInterval(() => {
            this.processJobs();
        }, 500);
    }
    async runJOb(job) {
        if (!job.next) {
            job.next = cron_parser_1.default.parseExpression(job.cron).next();
            console.log('Scheduled: ' + job.next.toString() + ' ' + job.scriptPath);
        }
        if (job.next.getTime() < new Date().getTime()) {
            job.processing = true;
            if (!job.plugin)
                job.plugin = new plugin_1.Worker(job);
            await job.plugin.process();
            job.next = cron_parser_1.default.parseExpression(job.cron).next();
            console.log('Scheduled: ' + job.next.toString() + ' ' + job.scriptPath);
        }
    }
    processJobs() {
        this.jobs.forEach(async (job) => {
            if (!job.disabled && !job.processing) {
                this.runJOb(job);
            }
        });
    }
}
exports.Scheduler = Scheduler;
