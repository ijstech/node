import { IHashedData } from './crypto';
export declare function hashPassword(password: string, salt?: string, iterations?: number, keylen?: number, digest?: string): Promise<IHashedData>;
export declare function verifyPassword(password: string, hash: IHashedData): Promise<boolean>;
declare const _default: {
    hashPassword: typeof hashPassword;
    verifyPassword: typeof verifyPassword;
};
export default _default;
