"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
const fs_1 = __importDefault(require("fs"));
const typescript_1 = __importDefault(require("typescript"));
const path_1 = __importDefault(require("path"));
const Libs = {};
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
function getPackageInfo(packName) {
    try {
        let path = getPackageDir(packName);
        let pack = JSON.parse(fs_1.default.readFileSync(path_1.default.join(path, 'package.json'), 'utf8'));
        let dts = fs_1.default.readFileSync(path_1.default.join(path, pack.types), 'utf8');
        return {
            version: pack.version,
            dts: dts
        };
    }
    catch (err) {
        if (!packName.startsWith('@types/'))
            return getPackageInfo('@types/' + packName);
    }
    ;
    return {
        version: '*',
        dts: 'declare const m: any; export default m;'
    };
}
class Compiler {
    constructor() {
        this.packages = {};
        this.scriptOptions = {
            allowJs: false,
            alwaysStrict: true,
            declaration: false,
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
            resolveJsonModule: false,
            module: typescript_1.default.ModuleKind.CommonJS,
            emitDeclarationOnly: true,
            noEmitOnError: true,
            target: typescript_1.default.ScriptTarget.ES2017
        };
        this.files = {};
        this.fileNames = [];
    }
    ;
    async addDirectory(dir, parentDir) {
        parentDir = parentDir || '';
        let result = {};
        let files = await fs_1.default.promises.readdir(dir);
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let fullPath = path_1.default.join(dir, file);
            let filePath = path_1.default.join(parentDir, file);
            let stat = await fs_1.default.promises.stat(fullPath);
            if (stat.isDirectory()) {
                Object.assign(result, await this.addDirectory(fullPath, filePath));
            }
            else {
                if (file.endsWith('.ts')) {
                    let content = await fs_1.default.promises.readFile(fullPath, 'utf8');
                    result[filePath] = content;
                    this.addFile(filePath, content);
                }
            }
        }
        ;
        return result;
    }
    ;
    addFile(fileName, content) {
        this.files[fileName] = content;
        this.fileNames.push(fileName);
    }
    ;
    addPackage(packName, pack) {
        let moduleName = '$package/' + packName + '.d.ts';
        if (!pack) {
            pack = this.packages[moduleName];
            if (!pack) {
                pack = getPackageInfo(packName);
                this.packages[moduleName] = pack;
            }
            ;
        }
        else
            this.packages[moduleName] = pack;
        return this.packages[moduleName];
    }
    ;
    compile(emitDeclaration) {
        let result = {
            errors: [],
            script: null,
            dts: null,
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
        return true;
    }
    ;
    getSourceFile(fileName, languageVersion, onError) {
        if (fileName == 'lib.d.ts') {
            let lib = getLib('lib.es5.d.ts');
            return typescript_1.default.createSourceFile(fileName, lib, languageVersion);
        }
        else if (fileName.startsWith('$package/')) {
            if (this.packages[fileName])
                return typescript_1.default.createSourceFile(fileName, this.packages[fileName].dts, languageVersion);
            else
                return typescript_1.default.createSourceFile(fileName, 'declare const m: any; export default m;', languageVersion);
        }
        else {
            let content = this.files[fileName];
            return typescript_1.default.createSourceFile(fileName, content || '', languageVersion);
        }
        ;
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
                    let packName = '$package/' + moduleName + '.d.ts';
                    let pack = this.packages[packName];
                    if (!pack) {
                        pack = getPackageInfo(moduleName);
                        this.packages[packName] = pack;
                    }
                    ;
                    resolvedModules.push({
                        resolvedFileName: packName,
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
