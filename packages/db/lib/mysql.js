"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLClient = void 0;
const MySQL = __importStar(require("mysql"));
class MySQLClient {
    constructor(options) {
        this.options = options;
    }
    ;
    get connection() {
        if (!this._connection)
            this._connection = MySQL.createConnection(this.options);
        return this._connection;
    }
    ;
    end() {
        this._connection.end();
        delete this._connection;
    }
    ;
    beginTransaction() {
        return new Promise((resolve, reject) => {
            this.transaction = true;
            this.connection.beginTransaction(function (err) {
                try {
                    this.end();
                }
                catch (err) { }
                ;
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
    }
    ;
    commit() {
        return new Promise((resolve, reject) => {
            this.transaction = false;
            this.connection.commit(function (err) {
                try {
                    this.end();
                }
                catch (err) { }
                ;
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
    }
    ;
    query(sql, params) {
        return new Promise((resolve, reject) => {
            try {
                this.connection.query(sql, params, function (err, result) {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            }
            finally {
                if (!this.transaction)
                    this.end();
            }
            ;
        });
    }
    ;
    rollback() {
        return new Promise((resolve, reject) => {
            this.transaction = false;
            this.connection.rollback(function (err) {
                try {
                    this.end();
                }
                catch (err) { }
                ;
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
    }
    ;
}
exports.MySQLClient = MySQLClient;
;
