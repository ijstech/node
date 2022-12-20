/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

// const TS = require("./lib/typescriptServices.js");
import {IPluginOptions, IDependencies} from '@ijstech/types';
import Fs from 'fs';
import TS from "typescript";
import Path, { resolve } from 'path';
const Libs = {};
const RootPath = process.cwd();
const PackageWhiteList = ['bignumber.js'];

async function getPackageScriptDir(filePath: string): Promise<any>{
    let path = resolveFilePath([RootPath], filePath, true);
    try{        
        let text = await Fs.promises.readFile(path + '/package.json', 'utf8');
        if (text){
            let pack = JSON.parse(text);
            if (pack.directories.bin)
                return resolveFilePath([path], pack.directories.bin);            
        }
    }
    catch(err){}
    return path;
};
export function resolveFilePath(rootPaths: string[] |string, filePath: string, allowsOutsideRootPath?: boolean): string{    
    if (!Array.isArray(rootPaths))
        rootPaths = [rootPaths];
    let rootPath = Path.resolve(...rootPaths);    
    let result = Path.resolve(rootPath, filePath);
    if (allowsOutsideRootPath)
        return result;
    if (result.startsWith(rootPath))
        return result
    else
        throw new Error('Invalid file path!');
};
function getLib(fileName: string): string {
    if (!Libs[fileName]){
        let filePath = Path.join(__dirname, 'lib', fileName);
        Libs[fileName] = Fs.readFileSync(filePath, 'utf8');
    };
    return Libs[fileName];
};
export interface ICompilerError {
    file: string;
    start: number;
    length: number;
    message: string | TS.DiagnosticMessageChain;
    category: number;
    code: number;
};
export interface ICompilerResult {
    errors: ICompilerError[];
    script: string;
    dependencies?: {[index: string]: IPackage};
    dts?: string;//{[file: string]: string};
};
export interface IPackage{
    path?: string;
    name?: string;
    version?: string;    
    dts?: string;//{[file: string]: string},
    script?: string;
    dependencies?: {[index: string]: IPackage};
}
function getPackageDir(pack: string): string{
    if (pack[0] != '/')
    pack = require.resolve(pack);
    let dir = Path.dirname(pack);
    if (Fs.existsSync(Path.resolve(dir, 'package.json')))
        return dir
    else
        return getPackageDir(dir);
};
async function getPackageInfo(packName: string): Promise<IPackage>{
    try{
        let path = getPackageDir(packName);
        let pack = JSON.parse(await Fs.promises.readFile(Path.join(path, 'package.json'), 'utf8'));                
        let script: string;
        if (packName != '@ijstech/plugin' && packName != '@ijstech/type'){
            if (pack.plugin){
                if (!pack.plugin.endsWith('.js'))
                    script = await Fs.promises.readFile(Path.join(path, pack.plugin + '.js'), 'utf8');
                else
                    script = await Fs.promises.readFile(Path.join(path, pack.plugin), 'utf8');
            }
            else if (pack.main){
                if (!pack.main.endsWith('.js'))
                    script = await Fs.promises.readFile(Path.join(path, pack.main + '.js'), 'utf8');
                else
                    script = await Fs.promises.readFile(Path.join(path, pack.main), 'utf8');
            };
        };
        let dts = await Fs.promises.readFile(Path.join(path, pack.pluginTypes || pack.types), 'utf8');
        return {
            version: pack.version,
            name: packName,
            path: Path.dirname(Path.join(path, pack.pluginTypes || pack.types)),
            script: script,
            dependencies: pack.dependencies,
            dts: dts//{"index.d.ts": content}
        };
    }
    catch(err){
        if (!packName.startsWith('@types/'))
            return await getPackageInfo('@types/' + packName);
    };
    return {
        name: packName,
        version: '*',
        dts: 'declare const m: any; export default m;'//{"index.d.ts": 'declare const m: any; export default m;'}
    };
};
export function resolveAbsolutePath(baseFilePath: string, relativeFilePath: string): string{    
    let basePath = baseFilePath.split('/').slice(0,-1).join('/');    
    if (basePath)
        basePath += '/';
    let fullPath = basePath + relativeFilePath;    
    return fullPath.split('/')
        .reduce((result: string[], value: string) => {
            if (value === '.'){}
            else if (value === '..') 
                result.pop()
            else 
                result.push(value);
            return result;
        }, [])
        .join('/');
};
export type FileImporter = (fileName: string, isPackage?: boolean) => Promise<{fileName: string, script: string, dts?: string}|null>;
export class Compiler {
    private scriptOptions: TS.CompilerOptions;
    private dtsOptions: TS.CompilerOptions;
    private files: { [name: string]: string };
    private packageFiles: {[name: string]: string};
    private fileNames: string[];
    private packages: {[index: string]: IPackage};
    private dependencies: {[index: string]: IPackage};
    private fileNotExists: string;
    private resolvedFileName: string;

    constructor() {
        this.scriptOptions = {            
            allowJs: false,
            alwaysStrict: true,
            declaration: true,      
            experimentalDecorators: true,      
            resolveJsonModule: false,
            module: TS.ModuleKind.AMD,
            noEmitOnError: true,
            outFile: 'index.js',
            target: TS.ScriptTarget.ES2017
        };
        this.dtsOptions = {            
            allowJs: false,
            alwaysStrict: true,
            declaration: true,       
            emitDeclarationOnly: true,
            experimentalDecorators: true,     
            resolveJsonModule: false,  
            outFile: 'index.js',
            module: TS.ModuleKind.AMD,
            noEmitOnError: true,
            target: TS.ScriptTarget.ES2017
        };
        this.reset();
    };
    async addDirectory(dir: string, parentDir?: string, packName?: string){  
        packName = packName || '';
        parentDir = parentDir || '';
        let result = {};
        let files = await Fs.promises.readdir(dir);
        for (let i = 0; i < files.length; i ++){
            let file = files[i]
            let fullPath = Path.join(dir,file);            
            let stat = await Fs.promises.stat(fullPath);
            if (stat.isDirectory()){
                let filePath = Path.join(parentDir, file);
                Object.assign(result, await this.addDirectory(fullPath, filePath, packName)); 
            }
            else{
                if (file.endsWith('.ts')){                
                    let filePath = Path.join(packName, parentDir, file);    
                    let content = await Fs.promises.readFile(fullPath, 'utf8');
                    result[filePath] = content;
                    this.addFileContent(filePath, content);
                }
            }
        };
        return result;
    }; 
    async addFile(filePath: string, fileName?: string){
        let content = await Fs.promises.readFile(filePath, 'utf8');        
        this.addFileContent(fileName || 'index.ts', content);
    };
    private async importDependencies(fileName: string, content: string, fileImporter: FileImporter, result?: string[]): Promise<string[]>{
        if (!content)
            return;
        let ast = TS.createSourceFile(
            fileName,
            content,
            TS.ScriptTarget.ES2017,
            true
        );
        result = result || [];
        for (let i = 0; i < ast.statements.length; i ++){
            let node = ast.statements[i];                        
            if (node.kind == TS.SyntaxKind.ImportDeclaration || node.kind == TS.SyntaxKind.ExportDeclaration){
                if ((node as any).moduleSpecifier){
                    let module = (<TS.LiteralLikeNode>(node as any).moduleSpecifier).text;
                    if (module.startsWith('.')){                    
                        let filePath = resolveAbsolutePath(fileName, module);
                        if (this.files[filePath] == undefined && this.files[filePath + '.ts'] == undefined && this.files[filePath + '.tsx'] == undefined){                        
                            let file = await fileImporter(filePath);
                            if (file){
                                result.push(file.fileName);
                                this.files[file.fileName] = file.script;
                                this.fileNames.push(file.fileName);
                                await this.importDependencies(file.fileName, file.script, fileImporter, result);
                            }
                        }
                    }
                    else {
                        if (!this.packages[module]){
                            let file = await fileImporter(module, true);
                            if (file){
                                result.push(module);
                                let pack: IPackage = {
                                    script: file.script,
                                    dts: file.dts,/*{
                                        [file.fileName]: file.content
                                    },*/
                                    version: ''
                                };
                                this.addPackage(module, pack);
                            };
                        }
                        this.dependencies[module] = this.packages[module];
                    }; 
                } 
            }            
        };
        return result;
    }
    async addFileContent(fileName: string, content: string, packageName?: string, dependenciesImporter?: FileImporter): Promise<string[]> {
        if (packageName)
            this.files[fileName] = `///<amd-module name='${packageName}'/> \n` + content
        else
            this.files[fileName] = content;
        this.fileNames.push(fileName);
        if (dependenciesImporter)
            return await this.importDependencies(fileName, content, dependenciesImporter)
        else
            return this.fileNames;
    };   
    async addPackage(packName: string, pack?: IPackage): Promise<IPackage> {
        if (this.packages[packName])
            return this.packages[packName];
            
        if (!pack){                        
            pack = this.packages[packName];
            if (!pack){
                pack = await getPackageInfo(packName);
                this.packages[packName] = pack;
                if (pack.dependencies){
                    for (let n in pack.dependencies){
                        if (!this.packages[n] && (n.startsWith('@ijstech') || n.startsWith('@scom')))
                            await this.addPackage(n);
                    }
                }
            };   
        }
        else
            this.packages[packName] = pack;
        if (pack.path)
            await this.addDirectory(pack.path, '', packName);
        this.packageFiles[packName + '/index.d.ts'] = pack.dts;
        // for (let n in pack.dts){
        //     this.packageFiles[packName + '/' + n] = pack.dts[n];
        // }
        return this.packages[packName];
    };
    async compile(emitDeclaration?: boolean): Promise<ICompilerResult> {
        let result: ICompilerResult = {
            errors: [],
            script: null,
            dependencies: this.dependencies,
            dts: '',
        }
        const host = {
            getSourceFile: this.getSourceFile.bind(this),
            getDefaultLibFileName: () => "lib.d.ts",
            writeFile: (fileName: string, content: string) => {
                if (fileName.endsWith('d.ts'))
                    result.dts = content;
                else
                    result.script = content;
            },
            getCurrentDirectory: () => "",
            getDirectories: (path: string) => {
                return TS.sys.getDirectories(path)
            },
            getCanonicalFileName: (fileName: string) =>
                TS.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
            getNewLine: () => TS.sys.newLine,
            useCaseSensitiveFileNames: () => TS.sys.useCaseSensitiveFileNames,
            fileExists: () => true,
            readFile: this.readFile.bind(this),
            resolveModuleNames: this.resolveModuleNames.bind(this)
        };
        try{
            let program = TS.createProgram(this.fileNames, this.scriptOptions, host);
            const emitResult = program.emit();
            emitResult.diagnostics.forEach(item => {
                result.errors.push({
                    category: item.category,
                    code: item.code,
                    file: item.file?item.file.fileName:null,
                    length: item.length,
                    message: item.messageText,
                    start: item.start
                });
            });
            if (emitDeclaration){
                program = TS.createProgram(this.fileNames, this.dtsOptions, host);
                program.emit();
            };
        }
        catch(err){
            if (this.fileNotExists)
                console.dir('File not exists: ' + this.fileNotExists)
            else
                console.trace(err)
        };
        return result;
    };
    fileExists(fileName: string): boolean {
        let result = this.fileNames.indexOf(fileName) > -1 || this.packageFiles[fileName] != undefined;
        if (!result && fileName.endsWith('/index.d.ts')){
            let packName = fileName.split('/').slice(0, -1).join('/');
            result = this.packages[packName] != undefined;
        }; 
        if (!result && fileName.endsWith('.ts'))
            result = this.packages[fileName.slice(0, -3)] != undefined;
        this.resolvedFileName = '';
        if (!result && this.fileNames.indexOf(fileName.slice(0, -3) + '/index.ts') > -1){
            result = true;
            this.resolvedFileName = fileName.slice(0, -3) + '/index.ts'; 
        };
        if (!result)        
            this.fileNotExists = fileName
        else
            this.fileNotExists = '';
        return result;
    };
    getSourceFile(fileName: string, languageVersion: TS.ScriptTarget, onError?: (message: string) => void) {
        if (fileName == 'lib.d.ts') {
            let lib = getLib('lib.d.ts');
            return TS.createSourceFile(fileName, lib, languageVersion);
        }
        let content = this.packageFiles[fileName] || this.files[fileName] || this.files[fileName.slice(0, -3) + '/index.ts'];
        if (!content)
            console.error(`Failed to get source file: ${fileName}`)
        return TS.createSourceFile(fileName, content, languageVersion);
    };
    readFile(fileName: string): string | undefined {
        return;
    };
    reset(){
        this.files = {};
        this.packageFiles = {};
        this.fileNames = [];
        this.packages = {};
        this.dependencies = {};
    };
    resolveModuleNames(moduleNames: string[], containingFile: string): TS.ResolvedModule[] {
        let resolvedModules: TS.ResolvedModule[] = [];
        for (const moduleName of moduleNames) {
            let result = TS.resolveModuleName(moduleName, containingFile, this.scriptOptions, {
                fileExists: this.fileExists.bind(this),
                readFile: this.readFile.bind(this)
            });
            if (result.resolvedModule) {
                if (!moduleName.startsWith('.')){
                    resolvedModules.push(<any>{
                        resolvedFileName: moduleName + '/index.d.ts',
                        extension: '.ts',
                        isExternalLibraryImport: true
                    });
                }
                else{
                    if (this.resolvedFileName){
                        resolvedModules.push(<any>{
                            resolvedFileName: this.resolvedFileName,
                            extension: '.ts',
                            isExternalLibraryImport: false
                        });
                    }
                    else
                        resolvedModules.push(result.resolvedModule);
                };
            };
        };
        return resolvedModules;
    };
};
export class PluginCompiler extends Compiler{
    static async instance(){
        let self = new this();
        await self.init();
        return self;
    }
    async init(){
        await this.addPackage('@ijstech/plugin');
        await this.addPackage('@ijstech/types');
        await this.addPackage('bignumber.js')
    }
    async compile(emitDeclaration?: boolean): Promise<ICompilerResult>{        
        await this.init();
        return super.compile(emitDeclaration);
    }
};
export class WalletPluginCompiler extends PluginCompiler{
    static async instance(){
        let self = new this();
        await self.init();
        return self;
    };
    async init(){
        await super.init();
        await this.addPackage('@ijstech/eth-contract');
        await this.addPackage('@ijstech/wallet');
    };
    async compile(emitDeclaration?: boolean): Promise<ICompilerResult>{        
        await this.init();
        return super.compile(emitDeclaration);
    };
};
export async function PluginScript(plugin: IPluginOptions): Promise<{script: string,dependencies: IDependencies}>{
    if (plugin.script)
        return {
            script: plugin.script,
            dependencies: plugin.dependencies
        };
    let compiler = new PluginCompiler();    
    if (plugin.plugins){
        if (plugin.plugins.db)
            await compiler.addPackage('@ijstech/pdm');
        if (plugin.plugins.wallet){
            await compiler.addPackage('@ijstech/wallet');
            await compiler.addPackage('@ijstech/eth-contract');
        }
    };
    if (plugin.dependencies){
        for (let p in plugin.dependencies){
            if (['bignumber.js','@ijstech/crypto', '@ijstech/eth-contract'].indexOf(p) > -1)
                await compiler.addPackage(p);
            else if (plugin.dependencies[p].dts)
                await compiler.addPackage(p, {version: '*', dts: plugin.dependencies[p].dts})
        }
    }
    if (plugin.scriptPath.endsWith('.ts')){
        if (plugin.modulePath || plugin.scriptPath.startsWith('/')){
            let fileName: string;
            let pathName: string;
            if (plugin.modulePath){
                pathName = plugin.modulePath;
                fileName = plugin.scriptPath;                
            }
            else{
                pathName = Path.dirname(plugin.scriptPath);
                fileName = Path. basename(plugin.scriptPath);                
            };            
            let content = await Fs.promises.readFile(resolveFilePath(pathName, fileName), 'utf8');
            await compiler.addFileContent(fileName, content, '', async (name: string, isPackage: boolean)=>{
                if (isPackage){
                    let pack = await compiler.addPackage(name);
                    return {
                        fileName: 'index.d.ts',
                        script: pack.script,
                        dts: pack.dts
                    }
                }
                else {
                    if (Fs.existsSync(resolveFilePath(pathName, name +'.ts')))
                        return {
                            fileName: name + '.ts',
                            script: await Fs.promises.readFile(resolveFilePath(pathName, name +'.ts'), 'utf-8')
                        }
                    else if (Fs.existsSync(resolveFilePath(pathName, name +'.d.ts'))){
                        return {
                            fileName: name + '.d.ts',
                            script: '',
                            dts: await Fs.promises.readFile(resolveFilePath(pathName, name +'.d.ts'), 'utf-8')
                        }
                    }
                };
                return {
                    fileName: '',
                    script: ''
                }
            });
        }
        else if (plugin.modulePath)
            await compiler.addFile(resolveFilePath([RootPath, plugin.modulePath], plugin.scriptPath, true));
        else
            await compiler.addFile(resolveFilePath([RootPath], plugin.scriptPath, true));
    }
    else{
        let path = '';        
        if (plugin.scriptPath.startsWith('/'))
            path = plugin.scriptPath;
        else
            path = await getPackageScriptDir(plugin.scriptPath);
        if (path)
            await compiler.addDirectory(path);
        else
            await compiler.addDirectory(plugin.scriptPath);
    };
    let result = await compiler.compile(true);
    if (result.errors.length > 0)
        throw new Error(JSON.stringify(result.errors, null, 4));
    return {
        script: result.script,
        dependencies: result.dependencies
    };
};