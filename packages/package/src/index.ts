import * as IPFSUtils from '@ijstech/ipfs';
import {Compiler, ICompilerResult, IPackage} from '@ijstech/tsc';
import {Storage} from '@ijstech/storage';
import {promises as Fs} from 'fs';
import Path from 'path';
export {IPackage};

export class Package{
    private manager: PackageManager;
    private packagePath: string;
    private scripts: {[name: string]: ICompilerResult} = {};    
    private packageConfig: any;    
    private scconfig: any;
    
    constructor(manager: PackageManager, packagePath: string){
        this.manager = manager;
        this.packagePath = packagePath;
    };

    private async getFileContent(filePath: string): Promise<string>{
        if (this.packagePath.indexOf('/') >=0){ //local package
            return await Fs.readFile(Path.join(this.packagePath, filePath), 'utf8');
        }
        else{ //ipfs cid

        }
        return;
    };
    get name(): string{
        return this.packageConfig.name || this.packagePath;
    };
    get path(): string{
        return this.packagePath;
    }
    get version(): string{
        return this.packageConfig.version || '*';
    };
    async init(){
        if (this.packageConfig == undefined){
            try{
                this.packageConfig = JSON.parse(await this.getFileContent('package.json'));
            }
            catch(err){
                this.packageConfig = {};
            }
            try{            
                this.scconfig = JSON.parse(await this.getFileContent('scconfig.json'));
            }
            catch(err){
                this.scconfig = {};
            }
        }
    };
    private async fileImporter(fileName: string, isPackage?: boolean): Promise<{fileName: string, script: string, dts?: string}>{                        
        if (isPackage){ //package
            let result = await this.manager.getScript(fileName);
            return {
                fileName: 'index.d.ts',
                script: result.script,
                dts: result.dts
            }
        }
        else //file
            return {
                fileName: fileName + '.ts',
                script: await this.getFileContent(fileName + '.ts')
            }
    };    
    async getScript(fileName?: string): Promise<ICompilerResult>{
        fileName = fileName || 'index.ts'; 
        if (!this.scripts[fileName]){          
            await this.init();
            let content = '';
            if (this.scconfig.src){
                if (this.scconfig.src.endsWith('.ts'))
                    content = await this.getFileContent(this.scconfig.src)
                else if (fileName)
                    content = await this.getFileContent(Path.join(this.scconfig.src, fileName))
                else
                    content = await this.getFileContent(Path.join(this.scconfig.src, 'index.ts'))
            }
            else
                content = await this.getFileContent('src/index.ts');
            if (content){
                let compiler = new Compiler();        
                await compiler.addPackage('@ijstech/plugin');
                await compiler.addPackage('bignumber.js');
                await compiler.addFileContent('index.ts', content, this.name, this.fileImporter.bind(this));
                let result = await compiler.compile(true);            
                this.scripts[fileName] = result;
            }
        };
        return this.scripts[fileName];
    };
};
interface IOptions{
    storage?: Storage;    
}
export type PackageImporter = (packageName: string, version?: string) => Promise<IPackage>;
export interface IPackageScript {
    script?: string;
    dts?: string;
    dependencies?: {[name: string]: IPackage}
}
export class PackageManager{
    private options: IOptions;
    private packagesByPath: {[path: string]: IPackage} = {};
    private packagesByVersion: {[version: string]: IPackage} = {};
    private packagesByName: {[name: string]: IPackage} = {};
    public packageImporter?: PackageImporter;

    constructor(options?: IOptions){
        this.options = options;
    };
    async addPackage(pack: string | IPackage): Promise<IPackage>{
        if (typeof(pack) == 'string'){
            if (!this.packagesByPath[pack]){
                let result = new Package(this, pack);
                await result.init();
                await result.getScript();
                this.packagesByPath[pack] = result;
                this.packagesByVersion[`${result.name}@${result.version}`] = result;            
                this.packagesByName[result.name] = result;
            };
            return this.packagesByPath[pack];
        }   
        else {
            if (pack.path && !this.packagesByPath[pack.path])
                this.packagesByPath[pack.path] = pack;
            if (pack.name && !this.packagesByName[pack.name])
                this.packagesByName[pack.name] = pack;
            if (pack.name && pack.version && !this.packagesByVersion[`${pack.name}@${pack.version}`])
                this.packagesByVersion[`${pack.name}@${pack.version}`] = pack;
            return pack
        };
    };
    async getScript(packageName: string, fileName?: string): Promise<IPackageScript>{
        let pack = await this.getPackage(packageName);
        if (pack instanceof Package)
            return await pack.getScript(fileName)
        else
            return {                
                script: pack.script,
                dependencies: pack.dependencies,
                dts: pack.dts
            }
    };
    async getPackage(name: string, version?: string): Promise<IPackage>{        
        try{
            let result: IPackage;
            if (version)
                result = this.packagesByVersion[`${name}@${version}`]
            else
                result = this.packagesByName[`${name}`];
            if (!result && this.packageImporter)
                result  = await this.packageImporter(name, version);
            return result;
        }
        catch(err){
            console.error(err)
        }
    };
};