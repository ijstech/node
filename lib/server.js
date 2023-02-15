"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const RootPath = process.cwd();
const index_1 = require("./index");
var Config;
var SCConfig;
try {
    SCConfig = require(path_1.default.join(RootPath, 'scconfig.json'));
    let configPath = process.argv[2] || SCConfig.config;
    if (configPath) {
        configPath = path_1.default.resolve(RootPath, configPath);
        if (configPath.startsWith(RootPath)) {
            if (configPath && configPath.endsWith('.js'))
                Config = require(configPath);
            else if (configPath && configPath.endsWith('.json')) {
                let content = fs_1.default.readFileSync(configPath, 'utf8');
                Config = JSON.parse(content);
            }
            ;
        }
        ;
    }
    ;
}
catch (err) { }
;
Config = Config || {};
async function main() {
    var _a, _b, _c, _d, _e, _f;
    let appServer = new index_1.AppServer({
        http: {
            port: ((_a = Config.router) === null || _a === void 0 ? void 0 : _a.port) || 8080,
            cors: ((_b = Config.router) === null || _b === void 0 ? void 0 : _b.cors) || false
        },
        schedule: {}
    });
    if (SCConfig.router)
        appServer.httpServer.addDomainPackage(Config.domain || 'localhost', {
            baseUrl: ((_c = Config.router) === null || _c === void 0 ? void 0 : _c.baseUrl) || SCConfig.router.baseUrl,
            packagePath: path_1.default.resolve(RootPath, './'),
            params: ((_d = Config.router) === null || _d === void 0 ? void 0 : _d.params) || SCConfig.router.params,
            options: {
                plugins: Config.plugins
            }
        });
    if (SCConfig.scheduler)
        appServer.scheduler.addDomainPackage(Config.domain || 'localhost', {
            packagePath: path_1.default.resolve(RootPath, './'),
            params: ((_e = Config.scheduler) === null || _e === void 0 ? void 0 : _e.params) || SCConfig.scheduler.params,
            schedules: ((_f = Config.scheduler) === null || _f === void 0 ? void 0 : _f.schedules) || SCConfig.scheduler.schedules || [],
            options: {
                plugins: Config.plugins
            }
        });
    await appServer.start();
}
;
main();
