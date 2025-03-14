/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import Types from '@ijstech/types';
import {IHashedData, hashPassword, randomBytes, randomUUID, verifyPassword} from './crypto';
export default {hashPassword, randomBytes, randomUUID, verifyPassword};

export function loadPlugin(worker: Types.IWorker, options: any): any{    
    const plugin = {
        async hashPassword(password: string, salt?: string, iterations?: number, keylen?: number, digest?: string): Promise<string>{    
            let result = await hashPassword(password, salt, iterations, keylen, digest);            
            return JSON.stringify(result);
        },
        async verifyPassword(password: string, hash: IHashedData): Promise<boolean>{    
            return await verifyPassword(password, hash);
        },
        async randomBytes(length?: number, encoding?: 'hex'|'base64'): Promise<string>{    
            return await randomBytes(length, encoding);
        },
        async randomUUID(): Promise<string>{    
            return await randomUUID();
        }
    };
    if (worker.vm){
        worker.vm.injectGlobalObject('$$crypto_plugin', plugin);
    }
    else
        global['$$crypto_plugin'] = plugin;
};