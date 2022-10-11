import {AppServer} from '@ijstech/app';
import Path from 'path';

let app = new AppServer({
    schedule: {
        domains: {
            'localhost': [{
                packagePath: Path.resolve(__dirname, '..')
            }]
        }
    }
});
app.start();
