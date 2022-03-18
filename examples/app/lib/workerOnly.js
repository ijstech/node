"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("@ijstech/app");
const config_js_1 = __importDefault(require("../data/config.js"));
async function main() {
    const Options = {
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
                        cache: {},
                        db: {
                            "db1": {
                                mysql: config_js_1.default.mysql
                            }
                        },
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
        },
        schedule: {
            jobs: [
                {
                    isolated: true,
                    cron: '*/4 * * * * *',
                    scriptPath: './plugins/job/index.js',
                    params: {
                        msg: 'hello'
                    },
                    plugins: {
                        db: {
                            "db1": {
                                mysql: config_js_1.default.mysql
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
                        "@pack/demo": { script: "file:../demoPack" }
                    }
                }
            ]
        }
    };
    let app = new app_1.AppServer(Options);
    app.start();
}
;
main();
