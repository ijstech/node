"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@ijstech/node");
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
                        message: {
                            connection: {
                                redis: config_js_1.default.redis
                            },
                            subscribe: ['msg_channel1']
                        }
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
                        message: {
                            connection: {
                                redis: config_js_1.default.redis
                            },
                            publish: ['msg_channel1']
                        }
                    }
                }
            ]
        }
    };
    let app = new node_1.AppServer(Options);
    app.start();
}
;
main();
