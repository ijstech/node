define("hello", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.helloWorld = void 0;
    function helloWorld() {
        return 'Hello World';
    }
    exports.helloWorld = helloWorld;
});
define("index", ["require", "exports", "hello", "bignumber.js", "@pack/demo"], function (require, exports, hello_1, bignumber_js_1, demo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HelloWorld {
        async init(params) {
        }
        ;
        async route(session, request, response) {
            if (request.path == '/job') {
                let job;
                try {
                    job = await session.plugins.queue.createJob('job_queue_1', request.query, true);
                    response.end(JSON.stringify(job, null, 4));
                }
                catch (err) {
                    console.dir(err.message);
                }
            }
            else if (request.path == '/message') {
                session.plugins.message.publish(0, JSON.stringify(request.query));
                response.end(JSON.stringify({
                    action: 'publish_message',
                    channel: 0,
                    msg: request.query
                }, null, 4));
            }
            else if (request.path == '/proxy') {
                let target = {
                    x: 10,
                    y: 20
                };
                let hanler = {
                    get: (obj, prop) => 42
                };
                target = new Proxy(target, hanler);
                response.end('target.x: ' + target.x);
            }
            else if (request.path == '/cache') {
                let key = 'cache_key';
                let data = '';
                try {
                    data = await session.plugins.cache.get(key);
                    await session.plugins.cache.set(key, request.query);
                }
                catch (err) { }
                response.end(JSON.stringify({
                    cachedData: data
                }, null, 4));
            }
            else if (request.path == '/wallet') {
                try {
                    let chainId = session.plugins.wallet.chainId || 1;
                    let balance = await session.plugins.wallet.balance;
                    let address = session.plugins.wallet.address;
                    response.end(JSON.stringify({
                        address: address,
                        balance: balance || 0,
                        chainId: chainId
                    }, null, 4));
                }
                catch (err) {
                    response.end({
                        error: err.message
                    });
                }
            }
            else if (request.path == '/pdm') {
                let demo = new demo_1.Demo();
                let empNo = 1002;
                if (request.query.employeeNumber)
                    empNo = parseInt(request.query.employeeNumber);
                let emp = await demo.employee(empNo);
                response.end(emp);
            }
            else if (request.path == '/db') {
                let con = session.plugins.db.getConnection('db1');
                try {
                    let result = await con.query('select sysdate()');
                    response.end(JSON.stringify({
                        result: result
                    }, null, 4));
                }
                catch (err) {
                    console.dir(err.message);
                }
            }
            else if (request.path == '/bignumber') {
                let num = new bignumber_js_1.BigNumber(123);
                response.end(num.toString());
            }
            else {
                response.end(JSON.stringify({
                    method: request.method,
                    path: request.path,
                    url: request.url,
                    origUrl: request.origUrl,
                    datetime: new Date(),
                    result: hello_1.helloWorld(),
                    query: request.query || '',
                    params: request.params || '',
                    body: request.body || '',
                    session: {
                        params: session.params
                    }
                }, null, 4));
            }
            return true;
        }
    }
    exports.default = HelloWorld;
});
