var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("crypto", ["require", "exports", "crypto"], function (require, exports, crypto_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.verifyPassword = exports.hashPassword = exports.randomBytes = exports.PASSWORD_KEY_SIZE = exports.DIGEST = exports.HMAC_KEY_SIZE = exports.ITERATIONS = void 0;
    crypto_1 = __importDefault(crypto_1);
    exports.ITERATIONS = 20000;
    exports.HMAC_KEY_SIZE = 32;
    exports.DIGEST = 'sha512';
    exports.PASSWORD_KEY_SIZE = 32;
    ;
    async function randomBytes(length, encoding) {
        return crypto_1.default.randomBytes(length || 16).toString(encoding || 'hex');
    }
    exports.randomBytes = randomBytes;
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
    exports.hashPassword = hashPassword;
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
    exports.verifyPassword = verifyPassword;
    ;
    exports.default = {
        hashPassword,
        verifyPassword
    };
});
define("plugin", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.randomBytes = exports.verifyPassword = exports.hashPassword = void 0;
    async function hashPassword(password, salt, iterations, keylen, digest) {
        const Crypto = global['$$crypto_plugin'];
        let result = await Crypto.hashPassword(password, salt, iterations, keylen, digest);
        return JSON.parse(result);
    }
    exports.hashPassword = hashPassword;
    ;
    async function verifyPassword(password, hash) {
        const Crypto = global['$$crypto_plugin'];
        return await Crypto.verifyPassword(password, hash);
    }
    exports.verifyPassword = verifyPassword;
    ;
    async function randomBytes(length, encoding) {
        const Crypto = global['$$crypto_plugin'];
        return await Crypto.randomBytes(length, encoding);
    }
    exports.randomBytes = randomBytes;
    ;
    exports.default = {
        hashPassword,
        randomBytes,
        verifyPassword
    };
});
