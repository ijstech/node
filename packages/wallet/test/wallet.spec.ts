import {IWorkerPluginOptions, Worker} from '@ijstech/plugin';
import assert from "assert";
import Fs from 'fs';
import Path from 'path';
import {Compiler} from '../../tsc';

function readFile(filePath: string): string{
    let fullPath = Path.join(__dirname, filePath);
    return Fs.readFileSync(fullPath, 'utf8');
};
const types = readFile('../../types/src/index.d.ts');
function getScript(filePath: string): string{
    console.dir('getScript: ' + filePath);
    let code = readFile(filePath);
    console.dir(code)
    try{
        let compiler = new Compiler();
        compiler.addFile('@ijstech/types', types);
        compiler.addFile('index.ts', code);
        let result = compiler.compile();        
        return result.script;
    }
    catch(err){
        console.dir(err)
    }
}
describe('Worker', function() {
    this.timeout(60000);
    it('Get Balance', async function(){
        let script = getScript('./plugins/erc20/src/index.ts');   
        console.dir(script);
        script = getScript('./plugins/getBalance/src');    
        let worker = new Worker({
            script: script,
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
            }
        });
        await worker.process();
    })
})
