import {IHashedData, DIGEST, HMAC_KEY_SIZE, ITERATIONS, PASSWORD_KEY_SIZE} from './crypto';

export async function hashPassword(password: string, salt?: string, iterations?: number, keylen?: number, digest?: string): Promise<IHashedData>{
    const Crypto = global['$$crypto_plugin'];
    let result = await Crypto.hashPassword(password, salt, iterations, keylen, digest);
    return JSON.parse(result);
};
export async function verifyPassword(password: string, hash?: IHashedData): Promise<boolean>{    
    const Crypto = global['$$crypto_plugin'];
    return await Crypto.verifyPassword(password, hash);
};
export async function randomBytes(length?: number, encoding?: 'hex'|'base64'): Promise<string>{
    const Crypto = global['$$crypto_plugin'];
    return await Crypto.randomBytes(length, encoding);
};
export async function randomUUID(): Promise<string>{
    const Crypto = global['$$crypto_plugin'];
    return await Crypto.randomUUID();
};
export default {
    hashPassword,
    randomBytes,
    randomUUID,
    verifyPassword
}