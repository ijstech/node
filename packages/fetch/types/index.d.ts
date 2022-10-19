import * as Types from '@ijstech/types';
import { IFetchGetData, IFetchPostData, IFetchResult } from './plugin';
export interface IFetch {
    get(url: string, data?: IFetchGetData): Promise<IFetchResult>;
    post(url: string, data?: IFetchPostData): Promise<IFetchResult>;
}
export declare const Fetch: IFetch;
declare const _default: IFetch;
export default _default;
export declare function loadPlugin(worker: Types.IWorker, options: any): any;
