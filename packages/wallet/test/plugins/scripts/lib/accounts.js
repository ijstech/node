"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Worker {
    constructor() {
        this.count = 0;
    }
    async process(session, data) {
        try {
            let wallet = session.plugins.wallet;
            return await wallet.accounts;
        }
        catch (err) {
            console.dir(err);
        }
    }
}
exports.default = Worker;
