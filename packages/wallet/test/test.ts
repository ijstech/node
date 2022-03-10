import {Worker} from '@ijstech/plugin';
import {Compiler} from '@ijstech/tsc';
import Path from 'path';

async function main(){            
    let compiler = new Compiler();    
    await compiler.addDirectory(Path.resolve(__dirname, './plugins/erc20/src'));
    let erc20 = compiler.compile(true);    
    compiler = new Compiler();
    compiler.addPackage('erc20', {
        version: '0.1.0',
        dts: erc20.dts
    });    
    await compiler.addDirectory(Path.resolve(__dirname, './plugins/getBalance/src'));    
    let script = compiler.compile();        
    let worker = new Worker({
        script: script.script,
        plugins: {
            wallet: {
                accounts: [
                    {
                        address: '0x1e28B0b5bD74636e07eFB4Ab7390812082a9bf9A',
                        privateKey: 'e1d06d52fcca262f17c9d70425dcef8dc7275333c1af5785e70170023b816c5c'
                    }
                ],
                chainId: 97,
                networks: {
                    97: {
                        chainName: "BSC Testnet",
                        provider: 'https://data-seed-prebsc-1-s1.binance.org:8545'
                    }
                }
            }
        },
        dependencies:{
            "bignumber.js": "*",
            "@ijstech/eth-contract": "*",
            "erc20": erc20.script
        }
    });
    let result = await worker.process();
    console.dir(result);
};
main();