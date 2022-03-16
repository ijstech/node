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
            let erc20 = new erc20_1.ERC20(wallet);
            let address = await erc20.deploy({
                cap: 10000000,
                decimals: 18,
                initialSupply: 10000000,
                name: 'USDT',
                symbol: 'USDT'
            });
            return {
                account: wallet.defaultAccount,
                address: address
            };
        }
        catch (err) {
            console.dir(err);
        }
    }
}
exports.default = Worker;
