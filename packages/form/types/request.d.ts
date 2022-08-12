/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
export declare function post(urlString: string, data: any, headers?: any): Promise<any>;
export declare function get(urlString: string, headers?: any): Promise<any>;
export declare function request(method: string, urlString: string, data: any, headers?: any): Promise<any>;
declare const _default: {
    get: typeof get;
    post: typeof post;
};
export default _default;
