"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageManager = exports.Package = void 0;
const tsc_1 = require("@ijstech/tsc");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
;
class Package {
    constructor(manager, packagePath) {
        this.scripts = {};
        this.manager = manager;
        this.packagePath = packagePath;
    }
    ;
    async getFileContent(filePath) {
        if (this.packagePath.indexOf('/') >= 0) {
            return await fs_1.promises.readFile(path_1.default.join(this.packagePath, filePath), 'utf8');
        }
        else {
        }
        return;
    }
    ;
    get name() {
        return this.packageConfig.name || this.packagePath;
    }
    ;
    get path() {
        return this.packagePath;
    }
    get version() {
        return this.packageConfig.version || '*';
    }
    ;
    async init() {
        if (this.packageConfig == undefined) {
            try {
                this.packageConfig = JSON.parse(await this.getFileContent('package.json'));
            }
            catch (err) {
                this.packageConfig = {};
            }
            try {
                this.scconfig = JSON.parse(await this.getFileContent('scconfig.json'));
            }
            catch (err) {
                this.scconfig = {};
            }
        }
    }
    ;
    async fileImporter(fileName, isPackage) {
        if (isPackage) {
            let result = await this.manager.getScript(fileName);
            return {
                fileName: 'index.d.ts',
                script: result.script,
                dts: result.dts
            };
        }
        else
            return {
                fileName: fileName + '.ts',
                script: await this.getFileContent(fileName + '.ts')
            };
    }
    ;
    async getScript(fileName) {
        fileName = fileName || 'index.ts';
        if (!this.scripts[fileName]) {
            await this.init();
            let content = '';
            if (this.scconfig.src) {
                if (this.scconfig.src.endsWith('.ts'))
                    content = await this.getFileContent(this.scconfig.src);
                else if (fileName)
                    content = await this.getFileContent(path_1.default.join(this.scconfig.src, fileName));
                else
                    content = await this.getFileContent(path_1.default.join(this.scconfig.src, 'index.ts'));
            }
            else
                content = await this.getFileContent('src/index.ts');
            if (content) {
                let compiler = new tsc_1.Compiler();
                await compiler.addPackage('@ijstech/plugin');
                await compiler.addPackage('bignumber.js');
                await compiler.addFileContent('index.ts', content, this.name, this.fileImporter.bind(this));
                let result = await compiler.compile(true);
                this.scripts[fileName] = result;
            }
        }
        ;
        return this.scripts[fileName];
    }
    ;
}
exports.Package = Package;
;
class PackageManager {
    constructor(options) {
        this.packagesByPath = {};
        this.packagesByVersion = {};
        this.packagesByName = {};
        this.options = options;
    }
    ;
    async addPackage(packagePath) {
        if (!this.packagesByPath[packagePath]) {
            let result = new Package(this, packagePath);
            await result.init();
            this.packagesByPath[packagePath] = result;
            this.packagesByVersion[`${result.name}@${result.version}`] = result;
            this.packagesByName[result.name] = result;
        }
        ;
        return this.packagesByPath[packagePath];
    }
    ;
    async getScript(packageName, fileName) {
        let pack = await this.getPackage(packageName);
        if (pack)
            return await pack.getScript(fileName);
    }
    ;
    async getPackage(name, version) {
        try {
            let result;
            if (version)
                result = this.packagesByVersion[`${name}@${version}`];
            else
                result = this.packagesByName[`${name}`];
            if (!result && this.packageImporter)
                result = await this.packageImporter(name, version);
            return result;
        }
        catch (err) {
            console.error(err);
        }
    }
    ;
}
exports.PackageManager = PackageManager;
;
