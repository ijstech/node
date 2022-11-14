class Worker {
    async process(session, data) {
        let wallet = session.plugins.wallet;
        return await wallet.accounts;
    }
    ;
}
;
export default Worker;
