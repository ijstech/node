import Contracts from '@demo/sdk';
class Worker {
    async process(session, data) {
        let wallet = session.plugins.wallet;
        let erc20 = new Contracts.ERC20(wallet, data.contract);
        let result = await erc20.balanceOf(data.account);
        return result.toNumber();
    }
    ;
}
;
export default Worker;
