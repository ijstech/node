import {AppServer} from '../src';

let app = new AppServer({
    http: {port:8004}
});
// app.addDomainPackage
app.start();