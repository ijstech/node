define("index", ["require", "exports", "erc20"], function (require, exports, erc20_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Worker {
        constructor() {
            this.count = 0;
        }
        async process(session, data) {
            try {
                let erc20 = new erc20_1.ERC20(session.plugins.wallet);
                let balance = await session.plugins.wallet.balance;
                return balance;
            }
            catch (err) {
                console.dir(err);
            }
        }
    }
    exports.default = Worker;
});
