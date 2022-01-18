define("index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Worker {
        constructor() {
            this.count = 0;
        }
        async process(session, data) {
            this.count++;
            console.dir('message from worker');
            return {
                msg: 'hello from worker',
                data: data,
                count: this.count
            };
        }
        message(session, channel, msg) {
            console.dir('message received inside worker: ' + channel + ' ' + msg);
        }
        ;
    }
    exports.default = Worker;
});
