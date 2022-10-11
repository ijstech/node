import assert from "assert";
import {AppServer} from '@ijstech/node';
import Path from 'path';

describe('HTTP Server', async function(){
    this.timeout(6000);
    before(async function(){
        let app = new AppServer({
            http: {
                port: 8080,
                domains: {
                    "localhost": [{
                        packagePath: Path.resolve(__dirname, '../'),
                        baseUrl: '/api/v0'
                    }]
                }
            }
        });
        await app.start();
    });
    it('GET /hello', async function(){
        let result = await (await fetch('http://localhost:8080/api/v0/hello/world?q=v1')).json();        
        console.dir(result)
        assert.strictEqual(result.method, 'GET');
        assert.deepEqual(result.session, {"param1": "default session params"});
        assert.strictEqual(result.params.name, 'world');
        assert.strictEqual(result.query.q, 'v1')
        assert.strictEqual(result.hello, true);
    })
    it('POST /hello/world', async function(){
        let result = await (await fetch("http://localhost:8080/api/v0/hello/world", {
            method: 'POST',            
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({postData: 'post data value'})
        })).json();       
        console.dir(result) 
        assert.strictEqual(result.method, 'POST');
        assert.strictEqual(result.hello, true);
        assert.deepEqual(result.session, {"param1": "default session params"});
        assert.strictEqual(result.params.name, 'world');
        assert.deepStrictEqual(result.body, {postData: 'post data value'});
    })
})