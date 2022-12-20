import Path from 'path';
const RootPath = process.cwd();
import {AppServer} from './index'
var Config: any;
var SCConfig: any;
try{
    if (process.argv[2])
        Config = require(Path.join(RootPath, process.argv[2]));
    SCConfig = require(Path.join(RootPath, 'scconfig.json'));
}
catch(err){};
Config = Config || {};
async function main(){
    let appServer = new AppServer({
        http: { 
            port: Config.port || 8080,
        },
        schedule: {
            
        }
    });
    if (SCConfig.router)
        appServer.httpServer.addDomainPackage(Config.domain || 'localhost', {
            baseUrl: SCConfig.router.baseUrl, 
            packagePath: Path.resolve(RootPath, './'),
            params: SCConfig.router.params,
            options: {
                plugins: Config.plugins
            }
        });
    if (SCConfig.scheduler)
        appServer.scheduler.addDomainPackage(Config.domain || 'localhost', {
            packagePath: Path.resolve(RootPath, './'),
            params: SCConfig.scheduler.params,
            schedules: SCConfig.scheduler.schedules || [],
            options: {
                plugins: Config.plugins
            }
        });
    await appServer.start();
};
main();



