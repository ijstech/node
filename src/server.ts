import Path from 'path';
import Fs from 'fs';
const RootPath = process.cwd();
import {AppServer} from './index'
var Config: any;
var SCConfig: any;
try{
    SCConfig = require(Path.join(RootPath, 'scconfig.json'));
    let configPath: string = process.argv[2] || SCConfig.config;
    if (configPath){
        configPath = Path.resolve(RootPath, configPath);
        if (configPath.startsWith(RootPath)){
            if (configPath && configPath.endsWith('.js'))
                Config = require(configPath)
            else if (configPath && configPath.endsWith('.json')){
                let content = Fs.readFileSync(configPath, 'utf8');
                Config = JSON.parse(content);
            };
        };
    };
}
catch(err){};
Config = Config || {};
async function main(){
    let appServer = new AppServer({
        http: { 
            port: Config.router?.port || 8080,
            cors: Config.router?.cors || false
        },
        schedule: {
            
        }
    });
    if (SCConfig.router)
        appServer.httpServer.addDomainPackage(Config.domain || 'localhost', {
            baseUrl: Config.router?.baseUrl || SCConfig.router.baseUrl, 
            packagePath: Path.resolve(RootPath, './'),
            params: Config.router?.params || SCConfig.router.params,
            options: {
                plugins: Config.plugins
            }
        });
    if (SCConfig.scheduler)
        appServer.scheduler.addDomainPackage(Config.domain || 'localhost', {
            packagePath: Path.resolve(RootPath, './'),
            params: Config.scheduler?.params || SCConfig.scheduler.params,
            schedules: Config.scheduler?.schedules || SCConfig.scheduler.schedules || [],
            options: {
                plugins: Config.plugins
            }
        });
    await appServer.start();
};
main();



