// const TS = require("./lib/typescriptServices.js");
import Fs from 'fs';
import TS from "typescript";
import Path from 'path';
const Libs = {};

function getLib(fileName: string): string {
    if (!Libs[fileName]){
        let filePath = Path.join(__dirname, 'lib', fileName);
        Libs[fileName] = Fs.readFileSync(filePath, 'utf8');
    };
    return Libs[fileName];
};
interface IError {
    file: string;
    start: number;
    length: number;
    message: string | TS.DiagnosticMessageChain;
    category: number;
    code: number;
};
interface ICompilerResult {
    errors: IError[];
    script: string;
    dts: string;
};
interface IPackage{
    dts: string,
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
function getPackageInfo(packName: string): IPackage{
    try{
        let path = getPackageDir(packName);
        let pack = JSON.parse(Fs.readFileSync(Path.join(path, 'package.json'), 'utf8'));
        let dts = Fs.readFileSync(Path.join(path, pack.types), 'utf8');
        return {
            version: pack.version,
            dts: dts
        };
    }
    catch(err){
        if (!packName.startsWith('@types/'))
            return getPackageInfo('@types/' + packName);
    };
    return {
        version: '*',
        dts: 'declare const m: any; export default m;'
    };
}
export class Compiler {
    private scriptOptions: TS.CompilerOptions;
    private dtsOptions: TS.CompilerOptions;
    private files: { [name: string]: string };
    private fileNames: string[];
    private packages: {[index: string]: IPackage} = {};

    constructor() {
        this.scriptOptions = {            
            allowJs: false,
            alwaysStrict: true,
            declaration: false,            
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
            resolveJsonModule: false,
            module: TS.ModuleKind.CommonJS,
            emitDeclarationOnly: true,
            noEmitOnError: true,

            target: TS.ScriptTarget.ES2017
        };
        this.files = {};
        this.fileNames = [];
    };
    async addDirectory(dir: string, parentDir?: string){  
        parentDir = parentDir || '';
        let result = {};
        let files = await Fs.promises.readdir(dir);
        for (let i = 0; i < files.length; i ++){
            let file = files[i]
            let fullPath = Path.join(dir,file);
            let filePath = Path.join(parentDir, file);
            let stat = await Fs.promises.stat(fullPath);
            if (stat.isDirectory()){
                Object.assign(result, await this.addDirectory(fullPath, filePath)); 
            }
            else{
                if (file.endsWith('.ts')){                    
                    let content = await Fs.promises.readFile(fullPath, 'utf8');
                    result[filePath] = content;
                    this.addFile(filePath, content);
                }
            }
        };
        return result;
    }; 
    addFile(fileName: string, content: string) {
        this.files[fileName] = content;
        this.fileNames.push(fileName);
    };   
    addPackage(packName: string, pack?: IPackage) {  
        let moduleName = '$package/' + packName + '.d.ts';
        if (!pack){                        
            pack = this.packages[moduleName];
            if (!pack){
                pack = getPackageInfo(packName);
                this.packages[moduleName] = pack
            };   
        }
        else
            this.packages[moduleName] = pack;
        return this.packages[moduleName];
    };
    compile(emitDeclaration?: boolean): ICompilerResult {
        let result: ICompilerResult = {
            errors: [],
            script: null,
            dts: null,
        }
        const host = {
            getSourceFile: this.getSourceFile.bind(this),
            getDefaultLibFileName: () => "lib.d.ts",
            writeFile: (fileName: string, content: string) => {
                if (fileName.endsWith('d.ts'))
                    result.dts = content
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
        return true;
        // return this.fileNames.indexOf(fileName) > -1;
    };
    getSourceFile(fileName: string, languageVersion: TS.ScriptTarget, onError?: (message: string) => void) {
        if (fileName == 'lib.d.ts') {
            let lib = getLib('lib.es5.d.ts');
            return TS.createSourceFile(fileName, lib, languageVersion);
        }
        else if (fileName.startsWith('$package/')){
            if (this.packages[fileName])                
                return TS.createSourceFile(fileName, this.packages[fileName].dts, languageVersion)
            else
                return TS.createSourceFile(fileName, 'declare const m: any; export default m;', languageVersion)
        }
        else {
            let content = this.files[fileName];
            return TS.createSourceFile(fileName, content || '', languageVersion);
        };
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
                    let packName = '$package/' + moduleName + '.d.ts';
                    let pack = this.packages[packName];
                    if (!pack){
                        pack = getPackageInfo(moduleName);
                        this.packages[packName] = pack
                    };                    
                    resolvedModules.push(<any>{
                        resolvedFileName: packName,
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