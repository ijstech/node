/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
export interface IVM {
    logging?: boolean;
    injectGlobalObject?: (name: string, obj: any, script?: string) => void;
    injectGlobalFunction?: (funcName: string, func: any) => void;
    injectGlobalScript?: (script: string) => void;
}
