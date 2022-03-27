import { IPluginOptions } from '@ijstech/types';
import TS from "typescript";
export declare function resolveFilePath(rootPaths: string[], filePath: string, allowsOutsideRootPath?: boolean): string;
export interface ICompilerError {
    file: string;
    start: number;
    length: number;
    message: string | TS.DiagnosticMessageChain;
    category: number;
    code: number;
}
export interface ICompilerResult {
    errors: ICompilerError[];
    script: string;
    dts: {
        [file: string]: string;
    };
}
interface IPackage {
    path?: string;
    dts: {
        [file: string]: string;
    };
    version: string;
}
export declare class Compiler {
    private scriptOptions;
    private dtsOptions;
    private files;
    private packageFiles;
    private fileNames;
    private packages;
    constructor();
    addDirectory(dir: string, parentDir?: string, packName?: string): Promise<{}>;
    addFile(filePath: string, fileName?: string): Promise<void>;
    addFileContent(fileName: string, content: string): void;
    addPackage(packName: string, pack?: IPackage): Promise<IPackage>;
    compile(emitDeclaration?: boolean): Promise<ICompilerResult>;
    fileExists(fileName: string): boolean;
    getSourceFile(fileName: string, languageVersion: TS.ScriptTarget, onError?: (message: string) => void): TS.SourceFile;
    readFile(fileName: string): string | undefined;
    resolveModuleNames(moduleNames: string[], containingFile: string): TS.ResolvedModule[];
}
export declare class PluginCompiler extends Compiler {
    compile(emitDeclaration?: boolean): Promise<ICompilerResult>;
}
export declare class WalletPluginCompiler extends PluginCompiler {
    compile(emitDeclaration?: boolean): Promise<ICompilerResult>;
}
export declare function PluginScript(plugin: IPluginOptions): Promise<string>;
export {};
