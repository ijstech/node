import Types from '@ijstech/types';
import { IHashedData, hashPassword, randomBytes, randomUUID, verifyPassword } from './crypto';
export { IHashedData, hashPassword, randomBytes, randomUUID, verifyPassword };
export declare function loadPlugin(worker: Types.IWorker, options: any): any;
