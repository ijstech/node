"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginScript = exports.WalletPluginCompiler = exports.PluginCompiler = exports.Compiler = exports.resolveFilePath = void 0;
const fs_1 = __importDefault(require("fs"));
const typescript_1 = __importDefault(require("typescript"));
const path_1 = __importDefault(require("path"));
const Libs = {};
const RootPath = path_1.default.dirname(require.main.filename);
async function getPackageScriptDir(filePath) {
    try {
        let path = resolveFilePath([RootPath], filePath, true);
        let text = await fs_1.default.promises.readFile(path + '/package.json', 'utf8');
        if (text) {
            let pack = JSON.parse(text);
            if (pack.directories.bin)
                return resolveFilePath([path], pack.directories.bin);
        }
    }
    catch (err) { }
}
;
function resolveFilePath(rootPaths, filePath, allowsOutsideRootPath) {
    let rootPath = path_1.default.resolve(...rootPaths);
    let result = path_1.default.join(rootPath, filePath);
    if (allowsOutsideRootPath)
        return result;
    return result.startsWith(rootPath) ? result : undefined;
}
exports.resolveFilePath = resolveFilePath;
;
function getLib(fileName) {
    if (!Libs[fileName]) {
        let filePath = path_1.default.join(__dirname, 'lib', fileName);
        Libs[fileName] = fs_1.default.readFileSync(filePath, 'utf8');
    }
    ;
    return Libs[fileName];
}
;
;
;
function getPackageDir(pack) {
    if (pack[0] != '/')
        pack = require.resolve(pack);
    let dir = path_1.default.dirname(pack);
    if (fs_1.default.existsSync(path_1.default.resolve(dir, 'package.json')))
        return dir;
    else
        return getPackageDir(dir);
}
async function getPackageInfo(packName) {
    try {
        let path = getPackageDir(packName);
        let pack = JSON.parse(await fs_1.default.promises.readFile(path_1.default.join(path, 'package.json'), 'utf8'));
        let content = await fs_1.default.promises.readFile(path_1.default.join(path, pack.pluginTypes || pack.types), 'utf8');
        return {
            version: pack.version,
            path: path_1.default.dirname(path_1.default.join(path, pack.pluginTypes || pack.types)),
            dts: { "index.d.ts": content }
        };
    }
    catch (err) {
        if (!packName.startsWith('@types/'))
            return await getPackageInfo('@types/' + packName);
    }
    ;
    return {
        version: '*',
        dts: { "index.d.ts": 'declare const m: any; export default m;' }
    };
}
class Compiler {
    constructor() {
        this.packages = {};
        this.scriptOptions = {
            allowJs: false,
            alwaysStrict: true,
            declaration: false,
            experimentalDecorators: true,
            resolveJsonModule: false,
            module: typescript_1.default.ModuleKind.AMD,
            noEmitOnError: true,
            outFile: 'index.js',
            target: typescript_1.default.ScriptTarget.ES2017
        };
        this.dtsOptions = {
            allowJs: false,
            alwaysStrict: true,
            declaration: true,
            emitDeclarationOnly: true,
            experimentalDecorators: true,
            resolveJsonModule: false,
            module: typescript_1.default.ModuleKind.CommonJS,
            noEmitOnError: true,
            target: typescript_1.default.ScriptTarget.ES2017
        };
        this.files = {};
        this.packageFiles = {};
        this.fileNames = [];
    }
    ;
    async addDirectory(dir, parentDir, packName) {
        packName = packName || '';
        parentDir = parentDir || '';
        let result = {};
        let files = await fs_1.default.promises.readdir(dir);
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let fullPath = path_1.default.join(dir, file);
            let stat = await fs_1.default.promises.stat(fullPath);
            if (stat.isDirectory()) {
                let filePath = path_1.default.join(parentDir, file);
                Object.assign(result, await this.addDirectory(fullPath, filePath, packName));
            }
            else {
                if (file.endsWith('.ts')) {
                    let filePath = path_1.default.join(packName, parentDir, file);
                    let content = await fs_1.default.promises.readFile(fullPath, 'utf8');
                    result[filePath] = content;
                    this.addFileContent(filePath, content);
                }
            }
        }
        ;
        return result;
    }
    ;
    async addFile(filePath, fileName) {
        let content = await fs_1.default.promises.readFile(filePath, 'utf8');
        this.addFileContent(fileName || 'index.ts', content);
    }
    ;
    addFileContent(fileName, content) {
        this.files[fileName] = content;
        this.fileNames.push(fileName);
    }
    ;
    async addPackage(packName, pack) {
        if (!pack) {
            pack = this.packages[packName];
            if (!pack) {
                pack = await getPackageInfo(packName);
                this.packages[packName] = pack;
            }
            ;
        }
        else
            this.packages[packName] = pack;
        if (pack.path)
            this.addDirectory(pack.path, '', packName);
        for (let n in pack.dts) {
            this.packageFiles[packName + '/' + n] = pack.dts[n];
        }
        return this.packages[packName];
    }
    ;
    async compile(emitDeclaration) {
        let result = {
            errors: [],
            script: null,
            dts: {},
        };
        const host = {
            getSourceFile: this.getSourceFile.bind(this),
            getDefaultLibFileName: () => "lib.d.ts",
            writeFile: (fileName, content) => {
                if (fileName.endsWith('d.ts'))
                    result.dts[fileName] = content;
                else
                    result.script = content;
            },
            getCurrentDirectory: () => "",
            getDirectories: (path) => {
                return typescript_1.default.sys.getDirectories(path);
            },
            getCanonicalFileName: (fileName) => typescript_1.default.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
            getNewLine: () => typescript_1.default.sys.newLine,
            useCaseSensitiveFileNames: () => typescript_1.default.sys.useCaseSensitiveFileNames,
            fileExists: () => true,
            readFile: this.readFile.bind(this),
            resolveModuleNames: this.resolveModuleNames.bind(this)
        };
        let program = typescript_1.default.createProgram(this.fileNames, this.scriptOptions, host);
        const emitResult = program.emit();
        emitResult.diagnostics.forEach(item => {
            result.errors.push({
                category: item.category,
                code: item.code,
                file: item.file ? item.file.fileName : null,
                length: item.length,
                message: item.messageText,
                start: item.start
            });
        });
        if (emitDeclaration) {
            program = typescript_1.default.createProgram(this.fileNames, this.dtsOptions, host);
            program.emit();
        }
        ;
        return result;
    }
    ;
    fileExists(fileName) {
        let result = this.fileNames.indexOf(fileName) > -1 || this.packageFiles[fileName] != undefined;
        if (!result && fileName.endsWith('.ts'))
            result = this.packages[fileName.slice(0, -3)] != undefined;
        return result;
    }
    ;
    getSourceFile(fileName, languageVersion, onError) {
        if (fileName == 'lib.d.ts') {
            let lib = getLib('lib.es5.d.ts');
            return typescript_1.default.createSourceFile(fileName, lib, languageVersion);
        }
        let content = this.packageFiles[fileName] || this.files[fileName];
        return typescript_1.default.createSourceFile(fileName, content, languageVersion);
    }
    ;
    readFile(fileName) {
        return;
    }
    ;
    resolveModuleNames(moduleNames, containingFile) {
        let resolvedModules = [];
        for (const moduleName of moduleNames) {
            let result = typescript_1.default.resolveModuleName(moduleName, containingFile, this.scriptOptions, {
                fileExists: this.fileExists.bind(this),
                readFile: this.readFile.bind(this)
            });
            if (result.resolvedModule) {
                if (!moduleName.startsWith('./')) {
                    resolvedModules.push({
                        resolvedFileName: moduleName + '/index.d.ts',
                        extension: '.ts',
                        isExternalLibraryImport: true
                    });
                }
                else
                    resolvedModules.push(result.resolvedModule);
            }
            ;
        }
        ;
        return resolvedModules;
    }
    ;
}
exports.Compiler = Compiler;
;
class PluginCompiler extends Compiler {
    async compile(emitDeclaration) {
        await this.addPackage('@ijstech/plugin');
        await this.addPackage('@ijstech/types');
        await this.addPackage('bignumber.js');
        return super.compile(emitDeclaration);
    }
}
exports.PluginCompiler = PluginCompiler;
;
class WalletPluginCompiler extends PluginCompiler {
    async compile(emitDeclaration) {
        await this.addPackage('@ijstech/eth-contract');
        return super.compile(emitDeclaration);
    }
}
exports.WalletPluginCompiler = WalletPluginCompiler;
;
async function PluginScript(plugin) {
    if (plugin.script)
        return plugin.script;
    let compiler = new PluginCompiler();
    if (plugin.plugins) {
        if (plugin.plugins.db)
            await compiler.addPackage('@ijstech/pdm');
        if (plugin.plugins.wallet)
            await compiler.addPackage('@ijstech/wallet');
    }
    ;
    if (plugin.dependencies) {
        for (let p in plugin.dependencies) {
            if (['bignumber.js', '@ijstech/crypto', '@ijstech/eth-contract'].indexOf(p) > -1)
                await compiler.addPackage(p);
            else if (plugin.dependencies[p].dts)
                await compiler.addPackage(p, { version: '*', dts: plugin.dependencies[p].dts });
        }
    }
    if (plugin.scriptPath.endsWith('.ts')) {
        if (plugin.scriptPath.startsWith('/'))
            await compiler.addFile(plugin.scriptPath);
        else
            await compiler.addFile(resolveFilePath([RootPath], plugin.scriptPath, true));
    }
    else {
        let path = '';
        console.dir(plugin.scriptPath)
        if (plugin.scriptPath.startsWith('/'))
            path = plugin.scriptPath;
        else
            path = await getPackageScriptDir(plugin.scriptPath);
        console.dir(path)
        if (path)
            compiler.addDirectory(path);
        else
            compiler.addDirectory(plugin.scriptPath);
    }
    ;
    let result = await compiler.compile();
    return result.script;
}
exports.PluginScript = PluginScript;
;
