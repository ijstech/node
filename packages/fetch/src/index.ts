import * as Types from '@ijstech/types';
import {IFetchPluginObject, IFetchGetData, IFetchPostData, IFetchResult} from './plugin';
export interface IFetch {
    get(url: string, data?: IFetchGetData): Promise<IFetchResult>;
    post(url: string, data?: IFetchPostData): Promise<IFetchResult>;
}
export const Fetch: IFetch = {
    async get(url: string, data?: IFetchGetData): Promise<IFetchResult>{
        let result = await fetch(url, data);
        return {
            status: result.status,
            body: await result.text()
        }
    },
    async post(url: string, data?: IFetchPostData): Promise<IFetchResult>{
        if (data?.body && typeof(data.body) == 'object'){
            if (!data.headers || !data.headers['content-type']){
                data.headers = data.headers || {};
                data.headers['content-type'] = 'application/json'
            };
            data.body = JSON.stringify(data.body);
        };
        let result = await fetch(url, {
            method: 'POST',
            headers: data?data.headers:null,
            body: data?data.body:null
        });
        return {
            status: result.status,
            body: await result.text()
        };
    }
};
const FetchPluginObject: IFetchPluginObject = {
    async get(url: string, data?: IFetchGetData): Promise<string>{
        let result = await fetch(url, data);
        return JSON.stringify({
            status: result.status,
            body: await result.text()
        })
    },
    async post(url: string, data?: IFetchPostData): Promise<string>{
        if (data?.body && typeof(data.body) != 'string')
            data.body = JSON.stringify(data.body);
        let result = await fetch(url, {
            method: 'POST',
            headers: data?data.headers:null,
            body: data?data.body:null
        })
        return JSON.stringify({
            status: result.status,
            body: await result.text()
        });
    }
};
function getPlugin(): IFetch{
    return global.$$fetch_plugin;
}
export default getPlugin();
export function loadPlugin(worker: Types.IWorker, options: any): any{
    if (worker.vm){        
        worker.vm.injectGlobalObject('$$fetch_plugin', FetchPluginObject);
        return '';
    }
    else
        global['$$fetch_plugin'] = Fetch;
};