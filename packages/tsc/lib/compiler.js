"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletPluginCompiler = exports.PluginCompiler = exports.Compiler = void 0;
exports.resolveFilePath = resolveFilePath;
exports.resolveAbsolutePath = resolveAbsolutePath;
exports.PluginScript = PluginScript;
const fs_1 = __importDefault(require("fs"));
const typescript_1 = __importDefault(require("typescript"));
const path_1 = __importDefault(require("path"));
const Libs = {};
const RootPath = process.cwd();
const PackageWhiteList = ['bignumber.js'];
async function getPackageScriptDir(filePath) {
    let path = resolveFilePath([RootPath], filePath, true);
    try {
        let text = await fs_1.default.promises.readFile(path + '/package.json', 'utf8');
        if (text) {
            let pack = JSON.parse(text);
            if (pack.directories.bin)
                return resolveFilePath([path], pack.directories.bin);
        }
    }
    catch (err) { }
    return path;
}
;
function resolveFilePath(rootPaths, filePath, allowsOutsideRootPath) {
    if (!Array.isArray(rootPaths))
        rootPaths = [rootPaths];
    let rootPath = path_1.default.resolve(...rootPaths);
    let result = path_1.default.resolve(rootPath, filePath);
    if (allowsOutsideRootPath)
        return result;
    if (result.startsWith(rootPath))
        return result;
    else
        throw new Error('Invalid file path!');
}
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
;
async function getPackageInfo(packName) {
    try {
        let path = getPackageDir(packName);
        let pack = JSON.parse(await fs_1.default.promises.readFile(path_1.default.join(path, 'package.json'), 'utf8'));
        let script;
        if (packName != '@ijstech/plugin' && packName != '@ijstech/type') {
            if (pack.plugin) {
                if (!pack.plugin.endsWith('.js'))
                    script = await fs_1.default.promises.readFile(path_1.default.join(path, pack.plugin + '.js'), 'utf8');
                else
                    script = await fs_1.default.promises.readFile(path_1.default.join(path, pack.plugin), 'utf8');
            }
            else if (pack.main) {
                if (!pack.main.endsWith('.js'))
                    script = await fs_1.default.promises.readFile(path_1.default.join(path, pack.main + '.js'), 'utf8');
                else
                    script = await fs_1.default.promises.readFile(path_1.default.join(path, pack.main), 'utf8');
            }
            ;
        }
        ;
        let dts = await fs_1.default.promises.readFile(path_1.default.join(path, pack.pluginTypes || pack.types), 'utf8');
        return {
            version: pack.version,
            name: packName,
            path: path_1.default.dirname(path_1.default.join(path, pack.pluginTypes || pack.types)),
            script: script,
            dependencies: pack.dependencies,
            dts: dts
        };
    }
    catch (err) {
        if (!packName.startsWith('@types/'))
            return await getPackageInfo('@types/' + packName);
    }
    ;
    return {
        name: packName,
        version: '*',
        dts: 'declare const m: any; export default m;'
    };
}
;
function resolveAbsolutePath(baseFilePath, relativeFilePath) {
    let basePath = baseFilePath.split('/').slice(0, -1).join('/');
    if (basePath)
        basePath += '/';
    let fullPath = basePath + relativeFilePath;
    return fullPath.split('/')
        .reduce((result, value) => {
        if (value === '.') { }
        else if (value === '..')
            result.pop();
        else
            result.push(value);
        return result;
    }, [])
        .join('/');
}
;
class Compiler {
    constructor() {
        this.scriptOptions = {
            allowJs: false,
            alwaysStrict: true,
            declaration: true,
            experimentalDecorators: true,
            resolveJsonModule: false,
            module: typescript_1.default.ModuleKind.AMD,
            noEmitOnError: true,
            outFile: 'index.js',
            target: typescript_1.default.ScriptTarget.ES2020
        };
        this.dtsOptions = {
            allowJs: false,
            alwaysStrict: true,
            declaration: true,
            emitDeclarationOnly: true,
            experimentalDecorators: true,
            resolveJsonModule: false,
            outFile: 'index.js',
            module: typescript_1.default.ModuleKind.AMD,
            noEmitOnError: true,
            target: typescript_1.default.ScriptTarget.ES2020
        };
        this.reset();
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
    async importDependencies(fileName, content, fileImporter, result) {
        if (!content)
            return;
        let ast = typescript_1.default.createSourceFile(fileName, content, typescript_1.default.ScriptTarget.ES2020, true);
        result = result || [];
        for (let i = 0; i < ast.statements.length; i++) {
            let node = ast.statements[i];
            if (node.kind == typescript_1.default.SyntaxKind.ImportDeclaration || node.kind == typescript_1.default.SyntaxKind.ExportDeclaration) {
                if (node.moduleSpecifier) {
                    let module = node.moduleSpecifier.text;
                    if (module.startsWith('.')) {
                        let filePath = resolveAbsolutePath(fileName, module);
                        if (this.files[filePath] == undefined && this.files[filePath + '.ts'] == undefined && this.files[filePath + '.tsx'] == undefined) {
                            let file = await fileImporter(filePath);
                            if (file) {
                                result.push(file.fileName);
                                this.files[file.fileName] = file.script;
                                this.fileNames.push(file.fileName);
                                await this.importDependencies(file.fileName, file.script, fileImporter, result);
                            }
                        }
                    }
                    else {
                        if (!this.packages[module]) {
                            let file = await fileImporter(module, true);
                            if (file) {
                                result.push(module);
                                let pack = {
                                    script: file.script,
                                    dts: file.dts,
                                    version: ''
                                };
                                this.addPackage(module, pack);
                            }
                            ;
                        }
                        this.dependencies[module] = this.packages[module];
                    }
                    ;
                }
            }
        }
        ;
        return result;
    }
    async addFileContent(fileName, content, packageName, dependenciesImporter) {
        if (packageName)
            this.files[fileName] = `///<amd-module name='${packageName}'/> \n` + content;
        else
            this.files[fileName] = content;
        this.fileNames.push(fileName);
        if (dependenciesImporter)
            return await this.importDependencies(fileName, content, dependenciesImporter);
        else
            return this.fileNames;
    }
    ;
    async addPackage(packName, pack) {
        if (this.packages[packName])
            return this.packages[packName];
        if (!pack) {
            pack = this.packages[packName];
            if (!pack) {
                pack = await getPackageInfo(packName);
                this.packages[packName] = pack;
                if (pack.dependencies) {
                    for (let n in pack.dependencies) {
                        if (!this.packages[n] && (n.startsWith('@ijstech') || n.startsWith('@scom')))
                            await this.addPackage(n);
                    }
                }
            }
            ;
        }
        else
            this.packages[packName] = pack;
        if (pack.path)
            await this.addDirectory(pack.path, '', packName);
        this.packageFiles[packName + '/index.d.ts'] = pack.dts;
        return this.packages[packName];
    }
    ;
    async compile(emitDeclaration) {
        let result = {
            errors: [],
            script: null,
            dependencies: this.dependencies,
            dts: '',
        };
        const host = {
            getSourceFile: this.getSourceFile.bind(this),
            getDefaultLibFileName: () => "lib.d.ts",
            writeFile: (fileName, content) => {
                if (fileName.endsWith('d.ts'))
                    result.dts = content;
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
        try {
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
        }
        catch (err) {
            if (this.fileNotExists)
                console.dir('File not exists: ' + this.fileNotExists);
            else
                console.trace(err);
        }
        ;
        return result;
    }
    ;
    fileExists(fileName) {
        let result = this.fileNames.indexOf(fileName) > -1 || this.packageFiles[fileName] != undefined;
        if (!result && fileName.endsWith('/index.d.ts')) {
            let packName = fileName.split('/').slice(0, -1).join('/');
            result = this.packages[packName] != undefined;
        }
        ;
        if (!result && fileName.endsWith('.ts'))
            result = this.packages[fileName.slice(0, -3)] != undefined;
        this.resolvedFileName = '';
        if (!result && this.fileNames.indexOf(fileName.slice(0, -3) + '/index.ts') > -1) {
            result = true;
            this.resolvedFileName = fileName.slice(0, -3) + '/index.ts';
        }
        else if (!result && this.fileNames.indexOf(fileName.slice(0, -3) + '/index.d.ts') > -1) {
            result = true;
            this.resolvedFileName = fileName.slice(0, -3) + '/index.d.ts';
        }
        ;
        if (!result)
            this.fileNotExists = fileName;
        else
            this.fileNotExists = '';
        return result;
    }
    ;
    getSourceFile(fileName, languageVersion, onError) {
        if (fileName == 'lib.d.ts') {
            let lib = getLib('lib.d.ts');
            return typescript_1.default.createSourceFile(fileName, lib, languageVersion);
        }
        let content = this.packageFiles[fileName] || this.files[fileName] || this.files[fileName.slice(0, -3) + '/index.ts'] || this.files[fileName.slice(0, -3) + '/index.d.ts'];
        if (!content)
            console.error(`Failed to get source file: ${fileName}`);
        return typescript_1.default.createSourceFile(fileName, content, languageVersion);
    }
    ;
    readFile(fileName) {
        return;
    }
    ;
    reset() {
        this.files = {};
        this.packageFiles = {};
        this.fileNames = [];
        this.packages = {};
        this.dependencies = {};
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
                if (!moduleName.startsWith('.')) {
                    resolvedModules.push({
                        resolvedFileName: moduleName + '/index.d.ts',
                        extension: '.ts',
                        isExternalLibraryImport: true
                    });
                }
                else {
                    if (this.resolvedFileName) {
                        resolvedModules.push({
                            resolvedFileName: this.resolvedFileName,
                            extension: '.ts',
                            isExternalLibraryImport: false
                        });
                    }
                    else
                        resolvedModules.push(result.resolvedModule);
                }
                ;
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
    static async instance() {
        let self = new this();
        await self.init();
        return self;
    }
    async init() {
        await this.addPackage('@ijstech/plugin');
        await this.addPackage('@ijstech/types');
        await this.addPackage('bignumber.js');
    }
    async compile(emitDeclaration) {
        await this.init();
        return super.compile(emitDeclaration);
    }
}
exports.PluginCompiler = PluginCompiler;
;
class WalletPluginCompiler extends PluginCompiler {
    static async instance() {
        let self = new this();
        await self.init();
        return self;
    }
    ;
    async init() {
        await super.init();
        await this.addPackage('@ijstech/eth-contract');
        await this.addPackage('@ijstech/wallet');
    }
    ;
    async compile(emitDeclaration) {
        await this.init();
        return super.compile(emitDeclaration);
    }
    ;
}
exports.WalletPluginCompiler = WalletPluginCompiler;
;
async function PluginScript(plugin) {
    if (plugin.script)
        return {
            script: plugin.script,
            dependencies: plugin.dependencies
        };
    let compiler = new PluginCompiler();
    if (plugin.plugins) {
        if (plugin.plugins.db)
            await compiler.addPackage('@ijstech/pdm');
        if (plugin.plugins.wallet) {
            await compiler.addPackage('@ijstech/wallet');
            await compiler.addPackage('@ijstech/eth-contract');
        }
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
        if (plugin.modulePath || plugin.scriptPath.startsWith('/')) {
            let fileName;
            let pathName;
            if (plugin.modulePath) {
                pathName = plugin.modulePath;
                fileName = plugin.scriptPath;
            }
            else {
                pathName = path_1.default.dirname(plugin.scriptPath);
                fileName = path_1.default.basename(plugin.scriptPath);
            }
            ;
            let content = await fs_1.default.promises.readFile(resolveFilePath(pathName, fileName), 'utf8');
            await compiler.addFileContent(fileName, content, '', async (name, isPackage) => {
                if (isPackage) {
                    let pack = await compiler.addPackage(name);
                    return {
                        fileName: 'index.d.ts',
                        script: pack.script,
                        dts: pack.dts
                    };
                }
                else {
                    if (fs_1.default.existsSync(resolveFilePath(pathName, name + '.ts')))
                        return {
                            fileName: name + '.ts',
                            script: await fs_1.default.promises.readFile(resolveFilePath(pathName, name + '.ts'), 'utf-8')
                        };
                    else if (fs_1.default.existsSync(resolveFilePath(pathName, name + '.d.ts'))) {
                        return {
                            fileName: name + '.d.ts',
                            script: '',
                            dts: await fs_1.default.promises.readFile(resolveFilePath(pathName, name + '.d.ts'), 'utf-8')
                        };
                    }
                }
                ;
                return {
                    fileName: '',
                    script: ''
                };
            });
        }
        else if (plugin.modulePath)
            await compiler.addFile(resolveFilePath([RootPath, plugin.modulePath], plugin.scriptPath, true));
        else
            await compiler.addFile(resolveFilePath([RootPath], plugin.scriptPath, true));
    }
    else {
        let path = '';
        if (plugin.scriptPath.startsWith('/'))
            path = plugin.scriptPath;
        else
            path = await getPackageScriptDir(plugin.scriptPath);
        if (path)
            await compiler.addDirectory(path);
        else
            await compiler.addDirectory(plugin.scriptPath);
    }
    ;
    let result = await compiler.compile(true);
    if (result.errors.length > 0)
        throw new Error(JSON.stringify(result.errors, null, 4));
    return {
        script: result.script,
        dependencies: result.dependencies
    };
}
;
