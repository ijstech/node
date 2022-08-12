/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import Crypto from 'crypto';
export const ITERATIONS = 20000;
export const HMAC_KEY_SIZE = 32;
export const DIGEST = 'sha512';
export const PASSWORD_KEY_SIZE = 32;

export interface IHashedData{
    hash: string,
    salt: string,
    digest?: string,
    iterations?: number,
    keylen?: number
};
export async function randomBytes(length?: number, encoding?: 'hex'|'base64'): Promise<string>{
    return Crypto.randomBytes(length || 16).toString(encoding || 'hex');
};
export async function randomUUID(): Promise<string>{
    return Crypto.randomUUID();
};
export function hashPassword(password: string, salt?: string, iterations?: number, keylen?: number, digest?: string): Promise<IHashedData>{
    return new Promise((resolve, reject)=>{
        try{
            salt = salt || Crypto.randomBytes(16).toString('hex');
            iterations = iterations || ITERATIONS;
            keylen = keylen || (HMAC_KEY_SIZE + PASSWORD_KEY_SIZE);
            digest = digest || DIGEST;
            Crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, result)=>{
                if (err)
                    reject(err)
                else
                    resolve({
                        digest: DIGEST,
                        hash: result.toString('base64'),
                        salt: salt,
                        iterations: ITERATIONS,
                        keylen: HMAC_KEY_SIZE + PASSWORD_KEY_SIZE
                    })
            })
        }
        catch(err){
            reject(err);
        }
    })
};
export function verifyPassword(password: string, hash: IHashedData): Promise<boolean>{    
    return new Promise((resolve, reject) => {
        Crypto.pbkdf2(password, hash.salt, hash.iterations || ITERATIONS,
            hash.keylen || (HMAC_KEY_SIZE + PASSWORD_KEY_SIZE), hash.digest || DIGEST, (err, result)=>{
            if (err)
                reject(err)
            else
                resolve(result.toString('base64') === hash.hash)
        })
    })
};
export default {
    hashPassword,
    verifyPassword
}