define("index", ["require", "exports", "@pack/demo"], function (require, exports, demo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Worker {
        async init(params) {
            console.dir('job init');
        }
        ;
        async process(session, data) {
            console.dir('Message from schedule job');
            console.dir(session.params);
            if (data && data.channel) {
                console.dir('message received inside job: ' + data.channel + ' ' + data.msg);
            }
            else {
                try {
                    let demo = new demo_1.Demo();
                    console.dir('demo.hello: ' + demo.hello());
                }
                catch (err) {
                    console.dir(err.message);
                }
            }
            return;
        }
    }
    exports.default = Worker;
});
