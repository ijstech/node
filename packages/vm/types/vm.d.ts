import Ivm from 'isolated-vm';
export interface IEventEmitter {
    events: any;
    emit: (event: string, ...args: any) => void;
    on: (event: string, cb: any) => void;
}
export interface IVMOptions {
    memoryLimit?: number;
    timeLimit?: number;
    logging?: boolean;
    token?: string;
    script?: string;
}
export declare type Events = 'reset' | 'error' | 'start' | 'timeout' | 'end';
export declare let DefaultTimeLimit: number;
export declare let DefaultRamLimit: number;
export declare let DefaultLogging: boolean;
export interface ILoadedVM {
    [name: string]: boolean;
}
export declare class VM {
    memoryLimit: number;
    timeLimit: number;
    logging: boolean;
    private isolate;
    private token;
    private events;
    private cpuTime;
    private context;
    private _script;
    private compiledScript;
    private timeLimitTimer;
    private executing;
    loadedPlugins: ILoadedVM;
    constructor(options?: IVMOptions);
    getCpuTime(): number;
    functionToReference(obj: any): Ivm.Reference<(...args: any[]) => any>;
    objectToReference(obj: any): Ivm.Reference<{}>;
    private setupContext;
    injectGlobalObject(name: string, obj: any, script?: string): void;
    injectGlobalValue(name: string, value: any, script?: string): void;
    injectGlobalFunction(funcName: string, func: any): void;
    injectGlobalScript(script: string): void;
    get script(): string;
    set script(value: string);
    private compileScript;
    getGlobalValue(name: string): Promise<any>;
    private emitEvent;
    execute(): Promise<any>;
    eval(script: string): Promise<Ivm.Transferable>;
    on(event: Events, cb: any): void;
    resetContext(): void;
}
export default VM;
