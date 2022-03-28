import 'mocha';
import {IWorkerPluginOptions, Worker} from '@ijstech/plugin';
import {Compiler, PluginScript, WalletPluginCompiler, ICompilerResult} from '@ijstech/tsc';
import Path from 'path';
import * as Ganache from "ganache";
import * as assert from 'assert';
import {Wallet } from '@ijstech/eth-wallet';
import * as Types from '@ijstech/types';

let Erc20: ICompilerResult;
let Provider = Ganache.provider();
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
        "erc20": {            
            script: ''
        }
    }
};

async function getScript(fileName: string): Promise<string>{
    try{
        if (!Erc20){
            let compiler = new WalletPluginCompiler();    
            await compiler.addDirectory(Path.resolve(__dirname, './plugins/erc20/src'));
            Erc20 = await compiler.compile(true);
            WorkerConfig.dependencies.erc20.script = Erc20.script;
            WorkerConfig.dependencies.erc20.dts = Erc20.dts;
        };
        let compiler = new WalletPluginCompiler();    
        await compiler.addPackage('erc20', {
            version: '0.1.0',
            dts: Erc20.dts
        });    
        await compiler.addFile(Path.resolve(__dirname, './plugins/scripts/src', fileName));    
        let script = await compiler.compile();
        if (script.errors.length > 0)
            console.dir(script.errors)
        return script.script;
    }
    catch(err){
        console.dir(err)
    }
}
function scriptPath(filePath: string): string{
    return Path.resolve(__dirname, './plugins/scripts/src', filePath)
}
async function runWorker(filePath: string, data?: any): Promise<any>{
    if (!Erc20){
        let compiler = new WalletPluginCompiler();    
        await compiler.addDirectory(Path.resolve(__dirname, './plugins/erc20/src'));
        Erc20 = await compiler.compile(true);
        WorkerConfig.dependencies.erc20.script = Erc20.script;
        WorkerConfig.dependencies.erc20.dts = Erc20.dts;
    };
    WorkerConfig.scriptPath = scriptPath(filePath);
    WorkerConfig.script = null;    
    let worker = new Worker(WorkerConfig);
    return await worker.process(data);
}
describe('Wallet', function(){
    this.timeout(60000);    
    let wallet = new Wallet(Provider);
    let accounts: string[];
    let ercAddress: string;    

    before(async function(){
        accounts = await wallet.accounts;
        
    });
    it('Accounts', async function(){
        let result = await runWorker('accounts.ts')
        assert.deepStrictEqual(result, accounts);
    });
    it('Default Account', async function(){
        let result: Types.IWalletAccount = await runWorker('account.ts', {
            account: accounts[0]
        });
        assert.strictEqual(result.address, accounts[0]);
    });
    it('Chain ID', async function(){
        let result = await runWorker('chainId.ts', {account: accounts[0]})
        assert.strictEqual(result, 5777);
    });
    it('Sign Message', async function(){
        let signature = await runWorker('signMessage.ts', {
            account: accounts[0],
            msg: 'hello'
        })
        assert.strictEqual(typeof(signature), 'string')
        let result = await runWorker('recoverSigner.ts', {
            msg: 'hello',
            signature: signature
        })
        assert.strictEqual(result.verified, true)
        assert.strictEqual(result.signer.toLowerCase(), accounts[0].toLowerCase())        
    });
    it('Create Account', async function(){
        let result: Types.IWalletAccount = await runWorker('createAccount.ts', {account: accounts[0]})
        assert.strictEqual(typeof(result.address), 'string');
        assert.strictEqual(typeof(result.privateKey), 'string');
    });
    it('ETH Balance', async function(){
        let result = await runWorker('ethBalance.ts', {account: accounts[0]})
        assert.strictEqual(result.account, accounts[0]);
        assert.strictEqual(result.balance, 1000)
        assert.strictEqual(result.balanceOf, 1000)
    });
    it('Deploy ERC20', async function(){
        let result = await runWorker('deploy.ts', {
            account: accounts[0],
            decimals: 18,
            name: 'USDT Token',
            symbol: 'USDT',
            initialSupply: 100,
            cap: 10000000
        })
        ercAddress = result.address;
        assert.strictEqual(typeof(result.address), 'string');
    });
    it('Token Info', async function(){
        let result = await runWorker('tokenInfo.ts', {            
            contract: ercAddress
        })
        assert.strictEqual(result.name, 'USDT Token');
        assert.strictEqual(result.symbol, 'USDT');
        assert.strictEqual(result.cap, 10000000);
        assert.strictEqual(result.totalSupply, 100);
    });
    it('Mint Token', async function(){
        let result = await runWorker('mint.ts', {            
            contract: ercAddress, 
            account: accounts[0],
            to: accounts[1],
            amount: 99
        })     
        assert.strictEqual(typeof(result.transactionHash), 'string');
        assert.strictEqual(result.blockNumber, 2);
    });
    it('Token Balance', async function(){
        let result = await runWorker('tokenBalance.ts', {            
            contract: ercAddress, 
            account: accounts[1]
        })
        assert.strictEqual(result, 99);
    });
    it('Block Number', async function(){
        let result:number = await runWorker('blockNumber.ts')
        assert.strictEqual(result, 2);
    });
    it('Block Timestamp', async function(){
        let result:number = await runWorker('blockTimestamp.ts')
        assert.strictEqual(typeof(result), 'number');
    });
    it('Token Events', async function(){
        let result: Types.IWalletEvent[] = await runWorker('tokenEvents.ts', {
            contract: ercAddress, 
            fromBlock: 1,
            toBlock: 2,
            events: []
        });
        assert.strictEqual(result.length, 2);
        assert.strictEqual(result[0].name, 'Auth');
        assert.strictEqual(result[1].name, 'Transfer');
    });
    it('Get Block', async function(){
        let result: Types.IWalletBlockTransactionObject = await runWorker('getBlock.ts', {
            block: 2
        });        
        assert.strictEqual(result.transactions.length, 1);
        let trx = result.transactions[0];
        assert.strictEqual(trx.from, accounts[0]);
        assert.strictEqual(trx.to, ercAddress);
    });
    it('Send ETH', async function(){
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

