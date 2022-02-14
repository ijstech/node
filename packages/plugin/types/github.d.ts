export declare function post(urlString: string, data: any, headers?: any): Promise<any>;
export declare function get(urlString: string, headers?: any): Promise<any>;
export declare function request(method: string, urlString: string, data: any, headers?: any): Promise<any>;
export declare function getFile(options: {
    org: string;
    repo: string;
    filePath: string;
    token: string;
}): Promise<any>;
declare const _default: {
    getFile: typeof getFile;
};
export default _default;
