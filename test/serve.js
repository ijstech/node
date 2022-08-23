const Fs = require('fs');
const Path = require('path');
const {AppServer} = require('../lib')

let SCConfig = JSON.parse(Fs.readFileSync(Path.join(__dirname, 'package/scconfig.json'), 'utf-8'));
let Config = {    
    http: {
        port: 8004,
        router: {
            module: 'test/package/src',
            routes: SCConfig.routes
        }
    },
    schedule: {
        module: "test/package/src",
        jobs: SCConfig.jobs || []
    }
}
let app = new AppServer(Config);
app.start();