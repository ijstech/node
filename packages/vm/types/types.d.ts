export interface IVM {
    logging?: boolean;
    injectGlobalObject?: (name: string, obj: any, script?: string) => void;
    injectGlobalFunction?: (funcName: string, func: any) => void;
    injectGlobalScript?: (script: string) => void;
}
