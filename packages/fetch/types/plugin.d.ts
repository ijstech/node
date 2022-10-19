export interface IFetchGetData {
    headers?: {
        [field: string]: string;
    };
}
export interface IFetchPostData {
    headers?: {
        [field: string]: string;
    };
    body?: any;
}
export interface IFetchPluginObject {
    get(url: string, data: IFetchGetData): Promise<string>;
    post(url: string, data: IFetchPostData): Promise<string>;
}
export interface IFetchResult {
    status: number;
    body: string;
}
export declare const Plugin: {
    get(url: string, data?: IFetchGetData): Promise<IFetchResult>;
    post(url: string, data: IFetchPostData): Promise<IFetchResult>;
};
export default Plugin;
