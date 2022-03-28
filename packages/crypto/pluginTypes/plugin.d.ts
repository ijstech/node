import { IHashedData } from './crypto';
export declare function hashPassword(password: string, salt?: string, iterations?: number, keylen?: number, digest?: string): Promise<IHashedData>;
export declare function verifyPassword(password: string, hash?: IHashedData): Promise<boolean>;
export declare function randomBytes(length?: number, encoding?: 'hex' | 'base64'): Promise<string>;
declare const _default: {
    hashPassword: typeof hashPassword;
    randomBytes: typeof randomBytes;
    verifyPassword: typeof verifyPassword;
};
export default _default;
