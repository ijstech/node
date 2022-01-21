define("index", ["require", "exports", "@pack/demo"], function (require, exports, demo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Worker {
        async process(session, data) {
            console.dir('Message from schedule job');
            console.dir(session.params);
            try {
                let demo = new demo_1.Demo();
                console.dir('demo.hello: ' + demo.hello());
            }
            catch (err) {
                console.dir(err.message);
            }
            return;
        }
        message(session, channel, msg) {
            console.dir('message received inside job: ' + channel + ' ' + msg);
        }
    }
    exports.default = Worker;
});
