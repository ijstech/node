import Path from 'path';
import {Storage} from '@ijstech/storage';
import Config from './data/config.js';

//upload router package to IPFS and get the package CID
async function sync(){
    let storage = new Storage(Config.storage);
    let path = Path.resolve(__dirname, './router');
    let result = await storage.putDir(path, {ipfs: true, s3:true});
    console.dir(result);
}
sync();