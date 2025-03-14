/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { IPluginOptions, IDependencies } from '@ijstech/types';
import TS from "typescript";
export declare function resolveFilePath(rootPaths: string[] | string, filePath: string, allowsOutsideRootPath?: boolean): string;
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
    dependencies?: {
        [index: string]: IPackage;
    };
    dts?: string;
}
export interface IPackage {
    path?: string;
    name?: string;
    version?: string;
    dts?: string;
    script?: string;
    dependencies?: {
        [index: string]: IPackage;
    };
}
export declare function resolveAbsolutePath(baseFilePath: string, relativeFilePath: string): string;
export declare type FileImporter = (fileName: string, isPackage?: boolean) => Promise<{
    fileName: string;
    script: string;
    dts?: string;
} | null>;
export declare class Compiler {
    private scriptOptions;
    private dtsOptions;
    private files;
    private packageFiles;
    private fileNames;
    private packages;
    private dependencies;
    private fileNotExists;
    private resolvedFileName;
    constructor();
    addDirectory(dir: string, parentDir?: string, packName?: string): Promise<{}>;
    addFile(filePath: string, fileName?: string): Promise<void>;
    private importDependencies;
    addFileContent(fileName: string, content: string, packageName?: string, dependenciesImporter?: FileImporter): Promise<string[]>;
    addPackage(packName: string, pack?: IPackage): Promise<IPackage>;
    compile(emitDeclaration?: boolean): Promise<ICompilerResult>;
    fileExists(fileName: string): boolean;
    getSourceFile(fileName: string, languageVersion: TS.ScriptTarget, onError?: (message: string) => void): TS.SourceFile;
    readFile(fileName: string): string | undefined;
    reset(): void;
    resolveModuleNames(moduleNames: string[], containingFile: string): TS.ResolvedModule[];
}
export declare class PluginCompiler extends Compiler {
    static instance(): Promise<PluginCompiler>;
    init(): Promise<void>;
    compile(emitDeclaration?: boolean): Promise<ICompilerResult>;
}
export declare class WalletPluginCompiler extends PluginCompiler {
    static instance(): Promise<WalletPluginCompiler>;
    init(): Promise<void>;
    compile(emitDeclaration?: boolean): Promise<ICompilerResult>;
}
export declare function PluginScript(plugin: IPluginOptions): Promise<{
    script: string;
    dependencies: IDependencies;
}>;
