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
    let appServer = new index_1.AppServer({
        http: {
            port: Config.port || 8080,
        },
        schedule: {}
    });
    if (SCConfig.router)
        appServer.httpServer.addDomainPackage(Config.domain || 'localhost', {
            baseUrl: SCConfig.router.baseUrl,
            packagePath: path_1.default.resolve(RootPath, './'),
            params: SCConfig.router.params,
            options: {
                plugins: Config.plugins
            }
        });
    if (SCConfig.scheduler)
        appServer.scheduler.addDomainPackage(Config.domain || 'localhost', {
            packagePath: path_1.default.resolve(RootPath, './'),
            params: SCConfig.scheduler.params,
            schedules: SCConfig.scheduler.schedules || [],
            options: {
                plugins: Config.plugins
            }
        });
    await appServer.start();
}
;
main();
