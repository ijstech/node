export declare const ITERATIONS = 200000;
export declare const HMAC_KEY_SIZE = 32;
export declare const DIGEST = "sha512";
export declare const PASSWORD_KEY_SIZE = 32;
export interface IHashedData {
    hash: string;
    salt: string;
    digest?: string;
    iterations?: number;
    keylen?: number;
}
export declare function hashPassword(password: string, salt?: string, iterations?: number, keylen?: number, digest?: string): Promise<IHashedData>;
export declare function verifyPassword(password: string, hash: IHashedData): Promise<boolean>;
declare const _default: {
    hashPassword: typeof hashPassword;
    verifyPassword: typeof verifyPassword;
};
export default _default;
