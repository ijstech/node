const {AppServer} = require('../lib')

let Config = {    
    http: {
        port: 8004,
        router: {
            module: 'test/package'
        }
    },
    schedule: {
        module: "test/package"
    }
}
let app = new AppServer(Config);
app.start();