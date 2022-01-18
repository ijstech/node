define("index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Worker {
        async process(session, data) {
            console.dir('Message from schedule job');
            console.dir(session.params);
            return;
        }
        message(session, channel, msg) {
            console.dir('message received inside job: ' + channel + ' ' + msg);
        }
    }
    exports.default = Worker;
});
