"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const RootPath = process.cwd();
const index_1 = require("./index");
var Config;
var SCConfig;
try {
    if (process.argv[2])
        Config = require(path_1.default.join(RootPath, process.argv[2]));
    SCConfig = require(path_1.default.join(RootPath, 'scconfig.json'));
}
catch (err) { }
;
Config = Config || {};
async function main() {
    var _a, _b, _c, _d, _e;
    let appServer = new index_1.AppServer({
        http: {
            port: ((_a = Config.router) === null || _a === void 0 ? void 0 : _a.port) || 8080,
        },
        schedule: {}
    });
    if (SCConfig.router)
        appServer.httpServer.addDomainPackage(Config.domain || 'localhost', {
            baseUrl: ((_b = Config.router) === null || _b === void 0 ? void 0 : _b.baseUrl) || SCConfig.router.baseUrl,
            packagePath: path_1.default.resolve(RootPath, './'),
            params: ((_c = Config.router) === null || _c === void 0 ? void 0 : _c.params) || SCConfig.router.params,
            options: {
                plugins: Config.plugins
            }
        });
    if (SCConfig.scheduler)
        appServer.scheduler.addDomainPackage(Config.domain || 'localhost', {
            packagePath: path_1.default.resolve(RootPath, './'),
            params: ((_d = Config.scheduler) === null || _d === void 0 ? void 0 : _d.params) || SCConfig.scheduler.params,
            schedules: ((_e = Config.scheduler) === null || _e === void 0 ? void 0 : _e.schedules) || SCConfig.scheduler.schedules || [],
            options: {
                plugins: Config.plugins
            }
        });
    await appServer.start();
}
;
main();
