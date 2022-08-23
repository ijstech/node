import * as Types from '@ijstech/types';

export function loadPlugin(worker: Types.IWorker, options: any): any{    
    const plugin = {
        async get(url: string): Promise<any>{
            return;
        },
        async post(url: string, data: any): Promise<any>{

        }
    };
    if (worker.vm){
        worker.vm.injectGlobalObject('$$fetch_plugin', plugin);
    }
    else
        global['$$fetch_plugin'] = plugin;
};