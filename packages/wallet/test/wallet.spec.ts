import 'mocha';
import { IWorkerPluginOptions, Worker } from '@ijstech/plugin';
import { Compiler, PluginScript, WalletPluginCompiler, ICompilerResult } from '@ijstech/tsc';
import Path from 'path';
import * as Ganache from "ganache";
import * as assert from 'assert';
import { Wallet, BigNumber, Utils} from '@ijstech/eth-wallet';
import * as Types from '@ijstech/types';
import {promises as Fs} from 'fs'

let Erc20: ICompilerResult;
let Provider = Ganache.provider({
    logging: {
        logger: {
            log: () => { } // don't do anything
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
    dependencies: {
        "bignumber.js": {},
        "@ijstech/eth-contract": {},
        "erc20": {
            script: ''
        }
    }
};

async function getFileContent(fileName: string): Promise<string> {
    return await Fs.readFile(fileName, 'utf8')
}
function scriptPath(filePath: string): string {
    return Path.resolve(__dirname, './plugins/scripts/src', filePath)
}
async function runWorker(filePath: string, data?: any): Promise<any> {
    if (!WorkerConfig.dependencies.erc20.script){
        WorkerConfig.dependencies.erc20.script = await getFileContent(Path.join(__dirname, 'plugins/erc20/dist/index.js'))
        WorkerConfig.dependencies.erc20.dts = await getFileContent(Path.join(__dirname, 'plugins/erc20/types/index.d.ts'))
    };
    WorkerConfig.scriptPath = scriptPath(filePath);
    WorkerConfig.script = null;
    let worker = new Worker(WorkerConfig);
    return await worker.process(data);
}
describe('Wallet', function () {
    this.timeout(60000);
    let wallet = new Wallet(Provider);
    let accounts: string[];
    let tokenAddress: string;
    let tokenAbi: any;
    let transactionHash: string;

    before(async function () {
        accounts = await wallet.accounts;
    });
    it('Accounts', async function () {
        let result = await runWorker('accounts.ts')
        assert.deepStrictEqual(result, accounts);
    });
    it('Default Account', async function () {
        let result: Types.IWalletAccount = await runWorker('account.ts', {
            account: accounts[0]
        });
        assert.strictEqual(result.address, accounts[0]);
    });
    it('Chain ID', async function () {
        let result = await runWorker('chainId.ts', { account: accounts[0] })
        assert.strictEqual(result, 5777);
    });
    it('Sign Message', async function () {
        let signature = await runWorker('signMessage.ts', {
            account: accounts[0],
            msg: 'hello'
        })
        assert.strictEqual(typeof (signature), 'string')
        let result = await runWorker('recoverSigner.ts', {
            msg: 'hello',
            signature: signature
        })
        assert.strictEqual(result.verified, true)
        assert.strictEqual(result.signer.toLowerCase(), accounts[0].toLowerCase())
    });
    it('Create Account', async function () {
        let result: Types.IWalletAccount = await runWorker('createAccount.ts', { account: accounts[0] })
        assert.strictEqual(typeof (result.address), 'string');
        assert.strictEqual(typeof (result.privateKey), 'string');
    });
    it('ETH Balance', async function () {
        let result = await runWorker('ethBalance.ts', { account: accounts[0] })
        assert.strictEqual(result.account, accounts[0]);
        assert.strictEqual(result.balance, 1000)
        assert.strictEqual(result.balanceOf, 1000)
    });
    it('ETH Balance Import', async function () {
        let result = await runWorker('ethBalanceImport.ts', { account: accounts[0] })
        assert.strictEqual(result.account, accounts[0]);
        assert.strictEqual(result.balance, 1000)
        assert.strictEqual(result.balanceOf, 1000)
    });
    it('Deploy ERC20', async function () {
        let result = await runWorker('deploy.ts', {
            account: accounts[0],
            decimals: 18,
            name: 'USDT Token',
            symbol: 'USDT',
            initialSupply: Utils.toDecimals(100, 18).toString(10),
            cap: Utils.toDecimals(10000000, 18).toString(10)
        });
        tokenAbi = result.abi;
        tokenAddress = result.address;
        assert.strictEqual(typeof (result.address), 'string');
    });
    it('Token Info', async function () {
        let result: {name: string, symbol: string, decimals: number, totalSupply: string} = await runWorker('tokenInfo.ts', {
            contract: tokenAddress
        });  
        assert.strictEqual(result.name, 'USDT Token');
        assert.strictEqual(result.symbol, 'USDT');
        assert.strictEqual(result.decimals, 18);
        assert.strictEqual(result.totalSupply, Utils.toDecimals(100, 18).toString());
    });
    it('Mint Token', async function () {
        let result = await runWorker('mint.ts', {
            contract: tokenAddress,
            account: accounts[0],
            to: accounts[1],
            amount: 99
        });
        transactionHash = result.transactionHash;
        assert.strictEqual(typeof (result.transactionHash), 'string');
        assert.strictEqual(result.blockNumber, 2);
    });
    it('Get Transaction', async function () {
        let result: Types.IWalletTransaction = await runWorker('getTransaction.ts', {
            hash: transactionHash
        });
        assert.strictEqual(result.from, accounts[0]);
        assert.strictEqual(result.to, tokenAddress);
    });
    it('Token Balance', async function () {
        let result = await runWorker('tokenBalance.ts', {
            contract: tokenAddress,
            account: accounts[1]
        })
        assert.strictEqual(result, 99);
    });
    it('Block Number', async function () {
        let result: number = await runWorker('blockNumber.ts')
        assert.strictEqual(result, 2);
    });
    it('Block Number Import', async function () {
        let result: number = await runWorker('blockNumberImport.ts')
        assert.strictEqual(result, 2);
    });
    it('Scan Events', async function () {
        let result: Types.IWalletEvent[] = await runWorker('scanEvents.ts', { fromBlock: 2, toBlock: 2 })
        assert.strictEqual(typeof (result[0].data), 'string')
    });
    it('Scan Events with ABI', async function () {
        let result: Types.IWalletEvent[] = await runWorker('scanEvents.ts', { fromBlock: 2, toBlock: 2, abi: tokenAbi, address: tokenAddress })
        assert.strictEqual(result[0].data.from, '0x0000000000000000000000000000000000000000')
        assert.strictEqual(result[0].data.to, accounts[1]);
        assert.strictEqual(result[0].data.value, '99');
        assert.strictEqual(result[0].data.handled, true);
    });
    it('Block Timestamp', async function () {
        let result: number = await runWorker('blockTimestamp.ts')
        assert.strictEqual(typeof (result), 'number');
    });
    it('Token Events', async function () {
        let result: Types.IWalletEvent[] = await runWorker('tokenEvents.ts', {
            contract: tokenAddress,
            fromBlock: 1,
            toBlock: 2,
            events: []
        });
        assert.strictEqual(result.length, 2);
        assert.strictEqual(result[0].name, 'Auth');
        assert.strictEqual(result[1].name, 'Transfer');
    });
    it('Get Block', async function () {
        let result: Types.IWalletBlockTransactionObject = await runWorker('getBlock.ts', {
            block: 2
        });
        assert.strictEqual(result.transactions.length, 1);
        let trx = result.transactions[0];
        assert.strictEqual(trx.hash, transactionHash);
        assert.strictEqual(trx.from, accounts[0]);
        assert.strictEqual(trx.to, tokenAddress);
    });
    it('Send ETH', async function () {
        let result: Types.IWalletTransactionReceipt = await runWorker('sendEth.ts', {
            from: accounts[0],
            to: accounts[2],
            amount: 3
        });
        assert.strictEqual(result.from.toLowerCase(), accounts[0].toLowerCase());
        assert.strictEqual(result.to.toLowerCase(), accounts[2].toLowerCase());
        let balance = await runWorker('ethBalance.ts', {
            account: accounts[2]
        })
        assert.strictEqual(balance.balance, 1003);
    });
})

