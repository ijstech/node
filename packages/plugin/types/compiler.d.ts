import { Compiler, ICompilerResult } from '@ijstech/tsc';
export declare class PluginCompiler extends Compiler {
    static instance(): Promise<PluginCompiler>;
    init(): Promise<void>;
    compile(emitDeclaration?: boolean): Promise<ICompilerResult>;
}
