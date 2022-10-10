import assert from "assert";
import http from 'http';
import {URL} from 'url';
import Path from 'path';

import {AppServer} from '../src';
import {Queue} from '@ijstech/queue';
import {Scheduler} from "@ijstech/schedule";

import Config from './data/config.js';

async function request(method: string, path: string, data?: any): Promise<{statusCode:number|undefined, contentType:string|undefined, data: any, headers}>{
    return new Promise((resolve, reject)=>{
        let url = new URL(path);
        let error: any;
        let req = http.request({
            method: method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname
        }, (res)=>{            
            const { statusCode } = res;
            const contentType = res.headers['content-type'];            
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { 
                rawData += chunk; });
            res.on('end', () => {
                if (error)
                    reject(error)
                else{
                    resolve({
                        statusCode: statusCode,
                        contentType: contentType,
                        data: contentType?.indexOf('application/json') > -1?JSON.parse(rawData):rawData,
                        headers: res.headers
                    });
                }
            });            
        });
        req.on('error', (err) => {
            error = err;
        });
        req.write(data || '');
        req.end();
    })
}
async function get(url: string): Promise<{statusCode:number|undefined, contentType:string|undefined, data: any, headers: any}>{    
    return request('GET', url);
};
async function post(url: string, data?: any): Promise<{statusCode:number|undefined, contentType:string|undefined, data: any, headers: any}>{
    return request('POST', url, data)
};
async function put(url: string, data?: any): Promise<{statusCode:number|undefined, contentType:string|undefined, data: any, headers: any}>{
    return request('PUT', url, data)
};
describe('HTTP Server', function() {   
    this.timeout(6000);
    let server: AppServer;
    before(async ()=>{
        server = new AppServer({
            http: {
                port:8888,                
                domains: {
                    "localhost": [{
                        baseUrl: '/pack1', 
                        packagePath: Path.resolve(__dirname, 'router'), 
                        options: {
                            plugins: Config.plugins
                        }
                    }]
                }
            }
        });        
        await server.start();
    });
    after(async ()=>{
        server.stop();
    });
    it ('Domain Package Router GET', async function(){
        let result = await get('http://localhost:8888/pack1/hello');
        assert.strictEqual(result.statusCode, 200);
        assert.strictEqual(result.data.msg, 'GET hello');
    });
    it ('Domain Package Router GET 404', async function(){
        let result = await get('http://localhost:8888/pack1/hello1');
        assert.strictEqual(result.statusCode, 404);
    });    
    it ('Domain Package Router POST', async function(){
        let result = await post('http://localhost:8888/pack1/hello/p1/p2');
        assert.strictEqual(result.statusCode, 200);
        assert.strictEqual(result.data.msg, 'POST hello');
        assert.strictEqual(result.data.params.param1, 'p1');
        assert.strictEqual(result.data.params.param2, 'p2');
        assert.strictEqual(result.data.params.param3, 'default param3 value');
    });
    it ('Domain Package Router DB Plugin', async function(){
        let result = await post('http://localhost:8888/pack1/hello/db');        
        assert.strictEqual(typeof(result.data.dbResult[0].sysdate), 'string');
        assert.strictEqual(result.statusCode, 200);
        assert.strictEqual(result.data.msg, 'POST hello');        
    });
    it ('Domain Package Router Cache Plugin', async function(){
        let result = await post('http://localhost:8888/pack1/hello/cache');        
        assert.strictEqual(result.statusCode, 200);
        assert.strictEqual(result.data.msg, 'POST hello');
        assert.strictEqual(result.data.cacheResult, true);
    });
    it ('Domain Package Router PUT', async function(){
        let result = await put('http://localhost:8888/pack1/hello');
        assert.strictEqual(result.statusCode, 404);
    });
});

describe('HTTP Server with Job Queue', function() {   
    this.timeout(6000);
    let server: AppServer;
    let queue: Queue;
    before(async ()=>{
        server = new AppServer({
            http: {
                port: 8888,
                worker: Config.http.worker,
                domains: {
                    "localhost": [{
                        baseUrl: '/pack1', 
                        packagePath: Path.resolve(__dirname, 'router'), 
                        options: {
                            plugins: Config.plugins
                        }
                    }]
                }
            }
        });        
        await server.start();
        queue = new Queue({
            jobQueue: Config.http.worker.jobQueue,
            connection: Config.http.worker.connection,
            domains: {
                "localhost": {
                    routers: [{
                        baseUrl: '/pack1', 
                        packagePath: Path.resolve(__dirname, 'router'), 
                        options: {
                            plugins: Config.plugins
                        }
                    }]
                }
            }
        })
        queue.start();
    });
    after(async ()=>{
        server.stop();
        queue.stop();
    });
    it ('Domain Package Router GET', async function(){
        let result = await get('http://localhost:8888/pack1/hello');
        assert.strictEqual(typeof(result.headers['job-id']), 'string');
        assert.strictEqual(result.statusCode, 200);
        assert.strictEqual(result.data.msg, 'GET hello');
    });
    it ('Domain Package Router GET 404', async function(){
        let result = await get('http://localhost:8888/pack1/hello1');
        assert.strictEqual(typeof(result.headers['job-id']), 'undefined');        
        assert.strictEqual(result.statusCode, 404);
    });    
    it ('Domain Package Router POST', async function(){
        let result = await post('http://localhost:8888/pack1/hello/p1/p2');
        assert.strictEqual(typeof(result.headers['job-id']), 'string');
        assert.strictEqual(result.statusCode, 200);
        assert.strictEqual(result.data.msg, 'POST hello');
        assert.strictEqual(result.data.params.param1, 'p1');
        assert.strictEqual(result.data.params.param2, 'p2');
        assert.strictEqual(result.data.params.param3, 'default param3 value');
    });
    it ('Domain Package Router DB Plugin', async function(){
        let result = await post('http://localhost:8888/pack1/hello/db');      
        assert.strictEqual(typeof(result.headers['job-id']), 'string');  
        assert.strictEqual(typeof(result.data.dbResult[0].sysdate), 'string');        
        assert.strictEqual(result.statusCode, 200);
        assert.strictEqual(result.data.msg, 'POST hello');        
    });
    it ('Domain Package Router Cache Plugin', async function(){
        let result = await post('http://localhost:8888/pack1/hello/cache');    
        assert.strictEqual(typeof(result.headers['job-id']), 'string');    
        assert.strictEqual(result.statusCode, 200);
        assert.strictEqual(result.data.msg, 'POST hello');
        assert.strictEqual(result.data.cacheResult, true);
    });
    it ('Domain Package Router PUT', async function(){
        let result = await put('http://localhost:8888/pack1/hello');
        assert.strictEqual(typeof(result.headers['job-id']), 'undefined');        
        assert.strictEqual(result.statusCode, 404);
    });
});