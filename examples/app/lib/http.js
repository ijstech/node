"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("@ijstech/app");
const config_js_1 = __importDefault(require("../data/config.js"));
async function main() {
    const Options = {
        http: {
            port: 8088,
            router: {
                routes: [
                    {
                        baseUrl: '/app',
                        isolated: false,
                        methods: ['GET', 'POST'],
                        params: {}
                    },
                    {
                        baseUrl: '/demo1',
                        isolated: false,
                        methods: ['GET'],
                        params: {}
                    },
                    {
                        baseUrl: '/hello',
                        methods: ['GET'],
                        scriptPath: './plugins/hello/index.js',
                        isolated: false,
                        params: {
                            isolated: 'false, running in node.js'
                        },
                        plugins: {
                            cache: {},
                            db: {
                                "db1": {
                                    mysql: config_js_1.default.mysql
                                }
                            },
                            queue: {
                                queues: ['job_queue_1'],
                                connection: {
                                    redis: config_js_1.default.redis
                                }
                            },
                            message: {
                                connection: {
                                    redis: config_js_1.default.redis
                                },
                                publish: ['msg_channel1']
                            }
                        },
                        dependencies: {
                            "@pack/demo": {
                                script: "file:../demoPack"
                            },
                            "bignumber.js": {}
                        }
                    },
                    {
                        baseUrl: '/vm/hello',
                        methods: ['GET'],
                        scriptPath: './plugins/hello/index.js',
                        isolated: true,
                        params: {
                            isolated: 'true, running inside vm'
                        },
                        plugins: {
                            cache: {},
                            db: {
                                "db1": {
                                    mysql: config_js_1.default.mysql
                                }
                            },
                            queue: {
                                queues: ['job_queue_1'],
                                connection: {
                                    redis: config_js_1.default.redis
                                }
                            },
                            message: {
                                connection: {
                                    redis: config_js_1.default.redis
                                },
                                publish: ['msg_channel1']
                            }
                        },
                        dependencies: {
                            "@pack/demo": { script: "file:../demoPack" },
                            "bignumber.js": { version: '*' }
                        }
                    }
                ]
            }
        },
        queue: {
            workers: [
                {
                    connection: {
                        redis: config_js_1.default.redis
                    },
                    jobQueue: 'job_queue_1',
                    isolated: true,
                    scriptPath: './plugins/worker/index.js',
                    plugins: {
                        message: {
                            connection: {
                                redis: config_js_1.default.redis
                            },
                            subscribe: ['msg_channel1']
                        }
                    },
                    dependencies: {
                        "@pack/demo": { script: "file:../demoPack" }
                    }
                }
            ]
        }
    };
    let app2 = new app_1.AppServer({
        http: {
            port: 8004
        }
    });
    app2.httpServer.addDomainRouter('localhost', [
        {
            baseUrl: '',
            script: '',
            methods: ['GET']
        },
        {
            baseUrl: '',
            methods: ['GET'],
            script: ''
        }
    ]);
    app2.start();
    let app = new app_1.AppServer(Options);
    app.start();
}
;
main();
