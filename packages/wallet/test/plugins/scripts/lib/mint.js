"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const erc20_1 = require("erc20");
class Worker {
    constructor() {
        this.count = 0;
    }
    async process(session, data) {
        try {
            let wallet = session.plugins.wallet;
            wallet.defaultAccount = data.account;
            let erc20 = new erc20_1.ERC20(wallet, data.address);
            let result = erc20.mint({
                account: data.address,
                value: data.amount
            });
            return {
                account: wallet.defaultAccount,
                address: data.address,
                amount: data.amount
            };
        }
        catch (err) {
            console.dir(err);
        }
    }
}
exports.default = Worker;
