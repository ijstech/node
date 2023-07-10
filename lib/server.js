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
    let appServer = new index_1.AppServer({
        http: {
            port: Config.router?.port || 8080,
            cors: Config.router?.cors || false
        },
        schedule: {}
    });
    if (SCConfig.router)
        appServer.httpServer.addDomainPackage(Config.domain || 'localhost', {
            baseUrl: Config.router?.baseUrl || SCConfig.router.baseUrl,
            packagePath: path_1.default.resolve(RootPath, './'),
            params: Config.router?.params || SCConfig.router.params,
            options: {
                plugins: Config.plugins
            }
        });
    if (SCConfig.scheduler)
        appServer.scheduler.addDomainPackage(Config.domain || 'localhost', {
            packagePath: path_1.default.resolve(RootPath, './'),
            params: Config.scheduler?.params || SCConfig.scheduler.params,
            schedules: Config.scheduler?.schedules || SCConfig.scheduler.schedules || [],
            options: {
                plugins: Config.plugins
            }
        });
    await appServer.start();
}
;
main();
