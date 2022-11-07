import {Compiler, ICompilerResult, IPackage} from '@ijstech/tsc';
import {IStorageOptions, Storage} from '@ijstech/storage';
import {promises as Fs} from 'fs';
import Path from 'path';
import { IRouterPluginMethod, IDomainOptions} from '@ijstech/types';
import {match} from './pathToRegexp';
export {IPackage};

const DefaultPlugins = ['@ijstech/crypto', '@ijstech/fetch', '@ijstech/plugin', '@ijstech/wallet', '@ijstech/eth-contract'];
export interface IRoute{
    methods: IRouterPluginMethod[];
    url: string;
    module: string;
    moduleScript?: ICompilerResult;
    params?: any;
    plugins?: {
        cache?: boolean;
        db?: boolean;
        wallet?: boolean;
        fetch?: boolean;
    };
    dependencies?: {
        [packageName: string]: string;
    };
};
export interface IWorker{
    module: string;
    moduleScript?: ICompilerResult;
    params?: any;
    plugins?: {
        cache?: boolean;
        db?: boolean;
        wallet?: boolean;
        fetch?: boolean;
    };
    dependencies?: {
        [packageName: string]: string;
    };
};
export interface ISCConfig {
    src?: string;   
    router?: {
        routes: IRoute[]
    };
    workers?: {[name: string]: IWorker};
};
export function matchRoute(pack: IDomainRouterPackage, route: IRoute, url: string): any{        
    if (pack.baseUrl + route.url == url)
        return true;
    if (!(<any>route)._match){
        let keys = [];
        (<any>route)._match = match(pack.baseUrl + route.url);        
    }    
    let result = (<any>route)._match(url);
    if (result === false )
        return false
    else
        return Object.assign({}, result.params);
};
export interface IDomainRouterPackage{
    baseUrl: string;
    packagePath: string;
    options?: IDomainOptions
};
export interface IDomainWorkerPackage{
    packagePath: string;
    options?: IDomainOptions
};
export class Package{
    private manager: PackageManager;    
    private scripts: {[name: string]: ICompilerResult} = {};    
    private packageConfig: any;    
    private packageName: string;
    private packageVersion: string;
    public scconfig: ISCConfig;
    private packagePath: string;
        
    constructor(manager: PackageManager, packagePath: string, options?: {
        name?: string;
        version?: string;
    }){
        this.manager = manager;
        this.packagePath = packagePath;
        this.packageName = options?.name;
        this.packageVersion = options?.version;
    };
    async getFileContent(filePath: string): Promise<string>{        
        return this.manager.getFileContent(this.packagePath, filePath);
    };
    get name(): string{
        return this.packageName || this.packageConfig.name || this.packagePath;
    };
    get path(): string{
        return this.packagePath; 
    };
    get version(): string{
        return this.packageVersion || this.packageConfig.version || '*';
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
    private async fileImporter(fileName: string, isPackage?: boolean): Promise<{fileName: string, script: string, dts?: string, dependencies?: {[name: string]: IPackage}}>{
        if (isPackage){ //package
            let result = await this.manager.getScript(fileName);            
            if (result.errors)
                console.dir(result.errors);

            return {
                fileName: 'index.d.ts',
                script: result.script,
                dts: result.dts,
                dependencies: result.dependencies
            }
        }
        else{ 
            return {
                fileName: fileName + '.ts',
                script: await this.getFileContent(fileName + '.ts')
            }
        }
    };    
    async getScript(fileName?: string): Promise<ICompilerResult>{
        fileName = fileName || 'index.ts'; 
        let parentPath = Path.dirname(fileName);
        if (!this.scripts[fileName]){          
            await this.init();
            let content = '';
            let indexFile = 'index.ts';
            try{
                if (this.scconfig.src){
                    if (this.scconfig.src.endsWith('.ts')){
                        content = await this.getFileContent(this.scconfig.src)
                        indexFile = Path.join(Path.join(Path.dirname(this.scconfig.src), parentPath), 'index.ts');
                    }
                    else{                        
                        content = await this.getFileContent(Path.join(this.scconfig.src, fileName));
                        indexFile = Path.join(Path.join(this.scconfig.src, parentPath), indexFile);
                    }
                }
                else{                    
                    content = await this.getFileContent(Path.join('src', fileName))
                    indexFile = 'src/index.ts';
                };                
            }
            catch(err){
                console.error(err);
            };
            if (content){
                let compiler = new Compiler();//new Compiler();
                await compiler.addFileContent(indexFile/*'index.ts'*/, content, this.name, async (fileName: string, isPackage: boolean): Promise<{fileName: string, script: string, dts?: string}>=>{                    
                    if (isPackage && DefaultPlugins.indexOf(fileName) > -1){
                        await compiler.addPackage('bignumber.js');
                        if (fileName == '@ijstech/eth-contract'){                            
                            await compiler.addPackage('@ijstech/wallet') 
                        };
                        if (fileName == '@ijstech/wallet'){
                            await compiler.addPackage('bignumber.js');
                        };
                        await compiler.addPackage(fileName)
                    }
                    else{
                        let result = await this.fileImporter(fileName, isPackage)
                        if (isPackage){
                            await compiler.addPackage(fileName, result)
                            for (let p in result.dependencies){
                                if (p == '@ijstech/eth-contract'){
                                    await compiler.addPackage('bignumber.js');
                                    await compiler.addPackage('@ijstech/wallet');
                                    await compiler.addPackage(p);
                                };
                                if (p == '@ijstech/wallet'){
                                    await compiler.addPackage('bignumber.js');
                                    await compiler.addPackage(p);
                                };
                            };
                        };                        
                        return result;
                    }
                });
                let result = await compiler.compile(true);    
                this.scripts[fileName] = result;
            }
        };
        return this.scripts[fileName];
    };
};
export interface IPackageOptions{
    storage?: IStorageOptions;
    packages?: IPackages;
};
export type PackageImporter = (packageName: string, version?: string) => Promise<Package>;
export interface IPackageScript {
    errors?: any[],
    script?: string;
    dts?: string;
    dependencies?: {[name: string]: IPackage}
}
export interface IPackages {
    [name: string]: {
        version?: string,
        path: string,
    }[]
}
export class PackageManager{
    private options: IPackageOptions;
    private storage: Storage;
    private packagesByPath: {[path: string]: Package} = {};
    private packagesByVersion: {[version: string]: Package} = {};
    private packagesByName: {[name: string]: Package} = {};
    private domainRouterPackages: {[name: string]:IDomainRouterPackage[]} = {};
    private packages: IPackages = {};

    public packageImporter?: PackageImporter;

    constructor(options?: IPackageOptions){
        this.options = options;
        if (this.options?.packages)
            this.register(this.options.packages);
    };
    async addDomainRouter(domain: string, pack:IDomainRouterPackage){
        let packs = this.domainRouterPackages[domain] || [];
        packs.push(pack);
        this.domainRouterPackages[domain] = packs;
    };
    async addPackage(packagePath: string, packageOptions?: {name?: string, version?: string}): Promise<Package>{
        if (!this.packagesByPath[packagePath]){
            let result = new Package(this, packagePath, packageOptions);
            await result.init();
            this.packagesByPath[packagePath] = result;
            this.packagesByVersion[`${result.name}@${result.version}`] = result;            
            this.packagesByName[result.name] = result;
        };
        return this.packagesByPath[packagePath];
    };
    async getDomainRouter(ctx: {
        domain: string,
        method: string,
        url: string
    }): Promise<{pack: Package, route: IRoute, options: IDomainOptions, params: any}>{
        let packs = this.domainRouterPackages[ctx.domain];
        if (packs){
            let method = ctx.method as IRouterPluginMethod;
            for (let i = 0; i < packs.length; i ++){
                let pack = packs[i];
                if (ctx.url.startsWith(pack.baseUrl)){
                    let p = await this.addPackage(pack.packagePath);
                    let url = ctx.url;
                    if (url.indexOf('?') > 0)
                        url = url.split('?')[0];
                    for (let k = 0; k < p.scconfig?.router?.routes.length; k ++){
                        let route = p.scconfig.router.routes[k];                                    
                        if (route.methods.indexOf(method) > -1){
                            let params = matchRoute(pack, route, url);
                            if (params !== false){
                                if (params === true)
                                    params = {}
                                else{
                                    params = params || {};
                                };                                                
                                return {
                                    options: pack.options,
                                    pack: p,
                                    params,
                                    route                                    
                                };
                            };
                        };
                    };
                };
            };
        };
        return <any>{};
    };
    async getFileContent(packagePath: string, filePath: string): Promise<string>{
        if (packagePath.indexOf('/') >=0){ //local package
            let path = Path.resolve(packagePath, filePath);
            if (!path.startsWith(packagePath))                
                return '';
            return await Fs.readFile(path, 'utf8');
        }
        else if (this.options.storage){ //ipfs cid
            if (!this.storage)
                this.storage = new Storage(this.options.storage);
            return await this.storage.getFile(packagePath, filePath);
        };
        return;
    };
    async getPackageWorker(pack: IDomainWorkerPackage, workerName: string): Promise<IWorker>{                
        let p = await this.addPackage(pack.packagePath);        
        let workers = p.scconfig?.workers;
        if (workers){
            let w = workers[workerName];
            if (w){
                if (!w.moduleScript)
                    w.moduleScript = await p.getScript(w.module);
                return w;
            };
        };
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
            if (!result && this.packages[name]){
                let packs = this.packages[name];
                for (let i = 0; i < packs.length; i ++){
                    let pack = packs[i];
                    if (pack.version == '*' || pack.version == version){
                        return await this.addPackage(pack.path, {
                            name: name,
                            version: pack.version
                        });
                    };
                    pack = packs[0];
                    return await this.addPackage(pack.path, {
                        name: name,
                        version: pack.version
                    });
                };
            };
            if (!result && this.packageImporter)
                result  = await this.packageImporter(name, version);
            return result;
        }
        catch(err){
            console.error(err)
        };
    };
    async register(packages: IPackages){
        for (let name in packages){
            let items = packages[name];
            this.packages[name] = items.concat(this.packages[name] || []);
        };
    };
};