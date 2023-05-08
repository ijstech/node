"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBClient = void 0;
class DBClient {
    constructor(options) {
        this._options = options;
    }
    ;
    applyQueries(queries) {
        return new Promise(async (resolve) => {
            var _a;
            let data = await fetch(((_a = this._options) === null || _a === void 0 ? void 0 : _a.url) || '/pdm', {
                method: 'POST',
                body: JSON.stringify(queries),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            let result = await data.json();
            resolve(result);
        });
    }
    ;
    checkTableExists(tableName) {
        return new Promise(resolve => resolve(true));
    }
    ;
    syncTableSchema(tableName, fields) {
        return new Promise(resolve => resolve(true));
    }
    ;
}
exports.DBClient = DBClient;
;
