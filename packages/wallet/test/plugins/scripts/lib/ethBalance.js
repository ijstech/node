"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Worker {
    constructor() {
        this.count = 0;
    }
    async process(session, data) {
        try {
            let wallet = session.plugins.wallet;
            wallet.defaultAccount = data.account;
            let balance = await wallet.balance;
            return {
                account: wallet.account,
                balance: balance.toNumber()
            };
        }
        catch (err) {
            console.dir(err);
        }
    }
}
exports.default = Worker;
