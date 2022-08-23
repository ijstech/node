"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginCompiler = void 0;
const tsc_1 = require("@ijstech/tsc");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
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
class PluginCompiler extends tsc_1.Compiler {
    static async instance() {
        let self = new this();
        await self.init();
        return self;
    }
    async init() {
        await this.addPackage('@ijstech/plugin', { version: '*', 'dts': getLib('plugin.d.ts') });
        await this.addPackage('bignumber.js');
    }
    async compile(emitDeclaration) {
        await this.init();
        return super.compile(emitDeclaration);
    }
}
exports.PluginCompiler = PluginCompiler;
;
