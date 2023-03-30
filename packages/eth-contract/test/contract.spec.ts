import assert from "assert";
import Path from 'path';
import 'mocha';
import {IWorkerPluginOptions, Worker} from '@ijstech/plugin';
import {Wallet, Utils} from "@ijstech/eth-wallet";
import {promises as Fs} from 'fs';
import * as Ganache from "ganache";

let Provider = Ganache.provider({
    logging: {
        logger: {
            log: () => { }
        }
    }
});

let WorkerConfig: IWorkerPluginOptions = {
    script: '',
    plugins: {
        wallet: {
            accounts: null,
            chainId: 5777,
            networks: {
                5777: {
                    chainName: "Ganache",
                    provider: Provider
                }
            }
        }
    },
    dependencies:{
        "bignumber.js": {},
        "@ijstech/eth-contract": {},
        "@demo/sdk": {            
            script: ''
        }
    }
};
async function getFileContent(fileName: string): Promise<string> {
    return await Fs.readFile(fileName, 'utf8')
};
function scriptPath(filePath: string): string {
    return Path.resolve(__dirname, './worker/src', filePath)
};
async function runWorker(filePath: string, data?: any): Promise<any> {
    if (!WorkerConfig.dependencies['@demo/sdk'].script){
        WorkerConfig.dependencies['@demo/sdk'].script = await getFileContent(Path.join(__dirname, 'sdk/dist/index.js'))
        WorkerConfig.dependencies['@demo/sdk'].dts = await getFileContent(Path.join(__dirname, 'sdk/pluginTypes/index.d.ts'))
    };
    WorkerConfig.scriptPath = scriptPath(filePath);
    WorkerConfig.script = null;
    let worker = new Worker(WorkerConfig);
    return await worker.process(data);
}
describe('Worker', function(){
    this.timeout(60000);
    let wallet = new Wallet(Provider);
    let accounts: string[];
    let tokenAddress: string;
    let transactionHash: string;

    before(async function () {
        accounts = await wallet.accounts;
        wallet.defaultAccount = accounts[0];
    });
    it('Accounts', async function () {
        let result = await runWorker('accounts.ts')
        assert.deepStrictEqual(result, accounts);
    });
    it('Deploy ERC20', async function () {
        tokenAddress = await runWorker('deploy.ts');
        assert.strictEqual(typeof(tokenAddress), 'string');
    });
    it('Mint', async function () {
        let result = await runWorker('mint.ts', {contract: tokenAddress, amount: 1000});
        assert.strictEqual(typeof (result.transactionHash), 'string');
    });
    it('Token Balance', async function () {
        let result = await runWorker('tokenBalance.ts', {contract: tokenAddress, account: accounts[0]});
        assert.strictEqual(result, 1000);
    });
});