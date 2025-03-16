"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_KEY_SIZE = exports.DIGEST = exports.HMAC_KEY_SIZE = exports.ITERATIONS = void 0;
exports.randomBytes = randomBytes;
exports.randomUUID = randomUUID;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const crypto_1 = __importDefault(require("crypto"));
exports.ITERATIONS = 20000;
exports.HMAC_KEY_SIZE = 32;
exports.DIGEST = 'sha512';
exports.PASSWORD_KEY_SIZE = 32;
;
async function randomBytes(length, encoding) {
    return crypto_1.default.randomBytes(length || 16).toString(encoding || 'hex');
}
;
async function randomUUID() {
    return crypto_1.default.randomUUID();
}
;
function hashPassword(password, salt, iterations, keylen, digest) {
    return new Promise((resolve, reject) => {
        try {
            salt = salt || crypto_1.default.randomBytes(16).toString('hex');
            iterations = iterations || exports.ITERATIONS;
            keylen = keylen || (exports.HMAC_KEY_SIZE + exports.PASSWORD_KEY_SIZE);
            digest = digest || exports.DIGEST;
            crypto_1.default.pbkdf2(password, salt, iterations, keylen, digest, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve({
                        digest: exports.DIGEST,
                        hash: result.toString('base64'),
                        salt: salt,
                        iterations: exports.ITERATIONS,
                        keylen: exports.HMAC_KEY_SIZE + exports.PASSWORD_KEY_SIZE
                    });
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
;
function verifyPassword(password, hash) {
    return new Promise((resolve, reject) => {
        crypto_1.default.pbkdf2(password, hash.salt, hash.iterations || exports.ITERATIONS, hash.keylen || (exports.HMAC_KEY_SIZE + exports.PASSWORD_KEY_SIZE), hash.digest || exports.DIGEST, (err, result) => {
            if (err)
                reject(err);
            else
                resolve(result.toString('base64') === hash.hash);
        });
    });
}
;
exports.default = {
    hashPassword,
    verifyPassword
};
