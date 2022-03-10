import TS from "typescript";
interface IError {
    file: string;
    start: number;
    length: number;
    message: string | TS.DiagnosticMessageChain;
    category: number;
    code: number;
}
interface ICompilerResult {
    errors: IError[];
    script: string;
    dts: string;
}
interface IPackage {
    dts: string;
    version: string;
}
export declare class Compiler {
    private scriptOptions;
    private dtsOptions;
    private files;
    private fileNames;
    private packages;
    constructor();
    addDirectory(dir: string, parentDir?: string): Promise<{}>;
    addFile(fileName: string, content: string): void;
    addPackage(packName: string, pack?: IPackage): IPackage;
    compile(emitDeclaration?: boolean): ICompilerResult;
    fileExists(fileName: string): boolean;
    getSourceFile(fileName: string, languageVersion: TS.ScriptTarget, onError?: (message: string) => void): TS.SourceFile;
    readFile(fileName: string): string | undefined;
    resolveModuleNames(moduleNames: string[], containingFile: string): TS.ResolvedModule[];
}
export {};
