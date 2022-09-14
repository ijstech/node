import {Compiler, ICompilerResult, IPackage} from '@ijstech/tsc';
import {Storage} from '@ijstech/storage';
import {promises as Fs} from 'fs';
import Path from 'path';
import { IRouterPluginMethod } from '@ijstech/types';
export {IPackage};

export interface ISCConfig {
    src?: string;   
    router?: {
        routes: {
            methods: IRouterPluginMethod[],
            url: string,
            module: string,
            moduleScript?: string,
            params?: any,
            plugins?: { 
                cache?: boolean, 
                db?: boolean
            },
            dependencies?: {
                [packageName: string]: string
            }
        }[]
    };
};
export class Package{
    private manager: PackageManager;
    private packagePath: string;
    private scripts: {[name: string]: ICompilerResult} = {};    
    private packageConfig: any;    
    public scconfig: ISCConfig;
    
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
export type PackageImporter = (packageName: string, version?: string) => Promise<Package>;
export interface IPackageScript {
    script?: string;
    dts?: string;
    dependencies?: {[name: string]: IPackage}
}
export class PackageManager{
    private options: IOptions;
    private packagesByPath: {[path: string]: Package} = {};
    private packagesByVersion: {[version: string]: Package} = {};
    private packagesByName: {[name: string]: Package} = {};
    public packageImporter?: PackageImporter;

    constructor(options?: IOptions){
        this.options = options;
    };
    async addPackage(packagePath: string): Promise<Package>{
        if (!this.packagesByPath[packagePath]){
            let result = new Package(this, packagePath);
            await result.init();
            this.packagesByPath[packagePath] = result;
            this.packagesByVersion[`${result.name}@${result.version}`] = result;            
            this.packagesByName[result.name] = result;
        };
        return this.packagesByPath[packagePath];
    };
    async getScript(packageName: string, fileName?: string): Promise<IPackageScript>{
        let pack = await this.getPackage(packageName);
        if (pack)
            return await pack.getScript(fileName)
    };
    async getPackage(name: string, version?: string): Promise<Package>{        
        try{
            let result: Package;
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