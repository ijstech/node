import {Compiler, ICompilerResult} from '@ijstech/tsc';
import Path from 'path';
import Fs from 'fs';

const Libs = {};
function getLib(fileName: string): string {
    if (!Libs[fileName]){
        let filePath = Path.join(__dirname, 'lib', fileName);
        Libs[fileName] = Fs.readFileSync(filePath, 'utf8');
    };
    return Libs[fileName];
};

export class PluginCompiler extends Compiler{
    static async instance(){
        let self = new this();
        await self.init();
        return self;
    }
    async init(){
        await this.addPackage('@ijstech/plugin', {version:'*','dts': getLib('plugin.d.ts')});
        // await this.addPackage('@ijstech/types');
        await this.addPackage('bignumber.js')
    }
    async compile(emitDeclaration?: boolean): Promise<ICompilerResult>{        
        await this.init();
        return super.compile(emitDeclaration);
    }
};