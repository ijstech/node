import Contracts from '@demo/sdk';
class Worker {
    async process(session, data) {
        let wallet = session.plugins.wallet;
        let erc20 = new Contracts.ERC20(wallet);
        return await erc20.deploy();
    }
    ;
}
;
export default Worker;
