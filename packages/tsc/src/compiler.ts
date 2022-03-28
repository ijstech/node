// const TS = require("./lib/typescriptServices.js");
import {IPluginOptions} from '@ijstech/types';
import Fs from 'fs';
import TS from "typescript";
import Path, { resolve } from 'path';
const Libs = {};
const RootPath = Path.dirname(require.main.filename);
async function getPackageScriptDir(filePath: string): Promise<any>{
    try{
        let path = resolveFilePath([RootPath], filePath, true);
        let text = await Fs.promises.readFile(path + '/package.json', 'utf8');
        if (text){
            let pack = JSON.parse(text);
            if (pack.directories.bin)
                return resolveFilePath([path], pack.directories.bin);
        }
    }
    catch(err){}
};
export function resolveFilePath(rootPaths: string[], filePath: string, allowsOutsideRootPath?: boolean): string{    
    let rootPath = Path.resolve(...rootPaths);    
    let result = Path.join(rootPath, filePath);
    if (allowsOutsideRootPath)
        return result;
    return result.startsWith(rootPath) ? result : undefined;
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
    dts: {[file: string]: string};
};
interface IPackage{
    path?: string;
    dts: {[file: string]: string},
    version: string,
}
function getPackageDir(pack: string): string{
    if (pack[0] != '/')
    pack = require.resolve(pack);
    let dir = Path.dirname(pack);
    if (Fs.existsSync(Path.resolve(dir, 'package.json')))
        return dir
    else
        return getPackageDir(dir);
}
async function getPackageInfo(packName: string): Promise<IPackage>{
    try{
        let path = getPackageDir(packName);
        let pack = JSON.parse(await Fs.promises.readFile(Path.join(path, 'package.json'), 'utf8'));                
        let content = await Fs.promises.readFile(Path.join(path, pack.pluginTypes || pack.types), 'utf8');
        return {
            version: pack.version,
            path: Path.dirname(Path.join(path, pack.pluginTypes || pack.types)),
            dts: {"index.d.ts": content}
        };
    }
    catch(err){
        if (!packName.startsWith('@types/'))
            return await getPackageInfo('@types/' + packName);
    };
    return {
        version: '*',
        dts: {"index.d.ts": 'declare const m: any; export default m;'}
    };
}
export class Compiler {
    private scriptOptions: TS.CompilerOptions;
    private dtsOptions: TS.CompilerOptions;
    private files: { [name: string]: string };
    private packageFiles: {[name: string]: string};
    private fileNames: string[];
    private packages: {[index: string]: IPackage} = {};

    constructor() {
        this.scriptOptions = {            
            allowJs: false,
            alwaysStrict: true,
            declaration: false,      
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
            module: TS.ModuleKind.CommonJS,
            noEmitOnError: true,
            target: TS.ScriptTarget.ES2017
        };
        this.files = {};
        this.packageFiles = {};
        this.fileNames = [];
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
    addFileContent(fileName: string, content: string) {
        this.files[fileName] = content;
        this.fileNames.push(fileName);
    };   
    async addPackage(packName: string, pack?: IPackage): Promise<IPackage> {
        if (!pack){                        
            pack = this.packages[packName];
            if (!pack){
                pack = await getPackageInfo(packName);
                this.packages[packName] = pack;
            };   
        }
        else
            this.packages[packName] = pack;
        if (pack.path)
            this.addDirectory(pack.path, '', packName);
        for (let n in pack.dts){
            this.packageFiles[packName + '/' + n] = pack.dts[n];
        }
        return this.packages[packName];
    };
    async compile(emitDeclaration?: boolean): Promise<ICompilerResult> {
        let result: ICompilerResult = {
            errors: [],
            script: null,
            dts: {},
        }
        const host = {
            getSourceFile: this.getSourceFile.bind(this),
            getDefaultLibFileName: () => "lib.d.ts",
            writeFile: (fileName: string, content: string) => {
                if (fileName.endsWith('d.ts'))
                    result.dts[fileName] = content;
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
        return result;
    };
    fileExists(fileName: string): boolean {
        let result = this.fileNames.indexOf(fileName) > -1 || this.packageFiles[fileName] != undefined;
        if (!result && fileName.endsWith('.ts'))
            result = this.packages[fileName.slice(0, -3)] != undefined;
        return result
    };
    getSourceFile(fileName: string, languageVersion: TS.ScriptTarget, onError?: (message: string) => void) {
        if (fileName == 'lib.d.ts') {
            let lib = getLib('lib.es5.d.ts');
            return TS.createSourceFile(fileName, lib, languageVersion);
        }
        let content = this.packageFiles[fileName] || this.files[fileName];
        return TS.createSourceFile(fileName, content, languageVersion);
    };
    readFile(fileName: string): string | undefined {
        return;
    };
    resolveModuleNames(moduleNames: string[], containingFile: string): TS.ResolvedModule[] {
        let resolvedModules: TS.ResolvedModule[] = [];
        for (const moduleName of moduleNames) {
            let result = TS.resolveModuleName(moduleName, containingFile, this.scriptOptions, {
                fileExists: this.fileExists.bind(this),
                readFile: this.readFile.bind(this)
            });
            if (result.resolvedModule) {
                if (!moduleName.startsWith('./')){
                    resolvedModules.push(<any>{
                        resolvedFileName: moduleName + '/index.d.ts',
                        extension: '.ts',
                        isExternalLibraryImport: true
                    });
                }
                else
                    resolvedModules.push(result.resolvedModule);
            };
        };
        return resolvedModules;
    };
};
export class PluginCompiler extends Compiler{
    async compile(emitDeclaration?: boolean): Promise<ICompilerResult>{        
        await this.addPackage('@ijstech/plugin');
        await this.addPackage('@ijstech/types');
        await this.addPackage('bignumber.js')
        return super.compile(emitDeclaration);
    }
};
export class WalletPluginCompiler extends PluginCompiler{
    async compile(emitDeclaration?: boolean): Promise<ICompilerResult>{
        await this.addPackage('@ijstech/eth-contract');
        return super.compile(emitDeclaration);
    }
};
export async function PluginScript(plugin: IPluginOptions): Promise<string>{
    if (plugin.script)
        return plugin.script;
    let compiler = new PluginCompiler();    
    if (plugin.plugins){
        if (plugin.plugins.db)
            await compiler.addPackage('@ijstech/pdm');
        if (plugin.plugins.wallet)
            await compiler.addPackage('@ijstech/wallet');
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
        if (plugin.scriptPath.startsWith('/'))
            await compiler.addFile(plugin.scriptPath)
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
            compiler.addDirectory(path);
        else
            compiler.addDirectory(plugin.scriptPath);
    };
    let result = await compiler.compile();
    return result.script;
};