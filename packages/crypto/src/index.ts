import Types from '@ijstech/types';
import {IHashedData, hashPassword, randomBytes, verifyPassword} from './crypto';
export {IHashedData, hashPassword, randomBytes, verifyPassword};

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
        }
    };
    if (worker.vm){
        worker.vm.injectGlobalObject('$$crypto_plugin', plugin);
    }
    else
        global['$$crypto_plugin'] = plugin;
};