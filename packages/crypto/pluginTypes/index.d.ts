import Types from '@ijstech/types';
import { hashPassword, randomBytes, randomUUID, verifyPassword } from './crypto';
declare const _default: {
    hashPassword: typeof hashPassword;
    randomBytes: typeof randomBytes;
    randomUUID: typeof randomUUID;
    verifyPassword: typeof verifyPassword;
};
export default _default;
export declare function loadPlugin(worker: Types.IWorker, options: any): any;
