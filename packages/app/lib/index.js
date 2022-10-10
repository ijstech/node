"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppServer = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const http_1 = require("@ijstech/http");
const schedule_1 = require("@ijstech/schedule");
const queue_1 = require("@ijstech/queue");
const package_1 = require("@ijstech/package");
const RootPath = process.cwd();
;
;
;
function updateScriptPath(items) {
    if (items) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].scriptPath) {
                if (items[i].scriptPath.endsWith('.ts'))
                    items[i].scriptPath = 'src/' + items[i].scriptPath;
                else if (items[i].scriptPath.endsWith('.js'))
                    items[i].scriptPath = 'lib/' + items[i].scriptPath;
            }
        }
    }
}
class AppServer {
    constructor(options) {
        var _a, _b, _c;
        this.options = options;
        if (this.options.package)
            this._packageManager = new package_1.PackageManager(this.options.package);
        if (this.options.http && (this.options.http.port || this.options.http.securePort)) {
            if (((_a = this.options.http.router) === null || _a === void 0 ? void 0 : _a.module) && !((_b = this.options.http.router) === null || _b === void 0 ? void 0 : _b.routes)) {
                try {
                    let SCConfig = JSON.parse(fs_1.default.readFileSync(path_1.default.join(RootPath, this.options.http.router.module, 'scconfig.json'), 'utf-8'));
                    updateScriptPath(SCConfig.routes);
                    (_c = this.options.http.router) === null || _c === void 0 ? void 0 : _c.routes;
                }
                catch (err) {
                    console.dir(err);
                }
            }
            ;
            this.httpServer = new http_1.HttpServer(this.options.http);
        }
        ;
        if (this.options.schedule) {
            if (this._packageManager && !this.options.schedule.packageManager)
                this.options.schedule.packageManager = this._packageManager;
            if (this.options.schedule.module && !this.options.schedule.jobs) {
                try {
                    let SCConfig = JSON.parse(fs_1.default.readFileSync(path_1.default.join(RootPath, this.options.http.router.module, 'scconfig.json'), 'utf-8'));
                    updateScriptPath(SCConfig.jobs);
                    this.options.schedule.jobs = SCConfig.jobs;
                }
                catch (err) {
                    console.dir(err);
                }
            }
            ;
            this.scheduler = new schedule_1.Scheduler(this.options.schedule);
        }
        ;
        if (this.options.queue) {
            if (this._packageManager && !this.options.queue.packageManager)
                this.options.queue.packageManager = this._packageManager;
            if (this.options.queue.module && !this.options.queue.workers) {
                try {
                    let SCConfig = JSON.parse(fs_1.default.readFileSync(path_1.default.join(RootPath, this.options.http.router.module, 'scconfig.json'), 'utf-8'));
                    updateScriptPath(SCConfig.workers);
                    this.options.queue.workers = SCConfig.workers;
                }
                catch (err) {
                    console.dir(err);
                }
            }
            ;
            this.queue = new queue_1.Queue(this.options.queue);
        }
        ;
    }
    ;
    get packageManager() {
        return this._packageManager;
    }
    ;
    async start() {
        if (this.running)
            return;
        if (this.options.http && (this.options.http.port || this.options.http.securePort))
            this.httpServer.start();
        if (this.options.schedule)
            this.scheduler.start();
        if (this.options.queue)
            this.queue.start();
        this.running = true;
    }
    ;
    async stop() {
        if (!this.running)
            return;
        if (this.httpServer)
            await this.httpServer.stop();
        if (this.scheduler)
            this.scheduler.stop();
        if (this.queue)
            this.queue.stop();
        this.running = false;
    }
}
exports.AppServer = AppServer;
;
