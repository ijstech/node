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
    async applyQueries(queries) {
        let result = [];
        if (Array.isArray(queries)) {
            await this.beginTransaction();
            try {
                for (let i = 0; i < queries.length; i++) {
                    let query = queries[i];
                    await this.applyQuery(result, query);
                }
                ;
                await this.commit();
            }
            catch (err) {
                this.rollback();
                return [{ error: typeof (err) == 'string' ? err : err.message || '$exception' }];
            }
            finally {
                this.end();
            }
            ;
        }
        ;
        return result;
    }
    ;
    async applyQuery(result, query) {
        let tableName = query.table;
        let fields = query.fields;
        let id = query.id;
        if (Array.isArray(query.queries) && query.queries.length > 0) {
            for (let i = 0; i < query.queries.length; i++) {
                let q = query.queries[i];
                if (q.a == 's') {
                    let r = await this.applySelectQuery(tableName, fields, q.q);
                    result.push({
                        id: id,
                        result: r
                    });
                }
                else if (q.a == 'i') {
                    let r = await this.applyInsertQuery(tableName, fields, q.d);
                    result.push({
                        id: id,
                        result: r
                    });
                }
                else if (q.a == 'd') {
                    let r = await this.applyDeleteQuery(tableName, fields, q.q);
                    result.push({
                        id: id,
                        result: r
                    });
                }
                else if (q.a == 'u') {
                    let r = await this.applyUpdateQuery(tableName, fields, q.d, q.q);
                    result.push({
                        id: id,
                        result: r
                    });
                }
            }
            ;
        }
        ;
        if (Array.isArray(query.records) && query.records.length > 0) {
            await this.applyUpdateRecords(tableName, fields, query.records);
        }
        ;
        return result;
    }
    ;
    async applyDeleteQuery(tableName, fields, qry) {
        let sql = '';
        let params = [];
        sql = `DELETE FROM ${this.escape(tableName)} `;
        sql += 'WHERE ' + this.getQuery(fields, qry, params);
        return await this.query(sql, params);
    }
    ;
    async applyInsertQuery(tableName, fields, data) {
        let sql = '';
        let params = [];
        sql = `INSERT INTO ${this.escape(tableName)} SET ${this.getFields(fields, data, params)}`;
        return await this.query(sql, params);
    }
    ;
    async applySelectQuery(tableName, fields, qry) {
        let sql = '';
        let params = [];
        sql = `SELECT ${this.getFields(fields)} FROM ${this.escape(tableName)} `;
        sql += 'WHERE ' + this.getQuery(fields, qry, params);
        let result = await this.query(sql, params);
        return result;
    }
    ;
    async applyUpdateQuery(tableName, fields, data, qry) {
        let sql = '';
        let params = [];
        sql = `UPDATE ${this.escape(tableName)} SET ${this.getFields(fields, data, params)} `;
        sql += 'WHERE ' + this.getQuery(fields, qry, params);
        return await this.query(sql, params);
    }
    ;
    async applyUpdateRecords(tableName, fields, records) {
        let keyField;
        for (let f in fields) {
            let field = fields[f];
            if (field.dataType == 'key') {
                if (!field.field)
                    field.field = f;
                field.prop = f;
                keyField = field;
                break;
            }
            ;
        }
        ;
        for (let i = 0; i < records.length; i++) {
            let record = records[i];
            let params = [];
            if (record.a == 'u') {
                let sql = `UPDATE ${this.escape(tableName)} SET ${this.getFields(fields, record.d, params)}`;
                sql += ` WHERE ${this.escape(keyField.field)}=?`;
                params.push(record.k);
                await this.query(sql, params);
            }
            else if (record.a == 'i') {
                if (!record.d[keyField.prop])
                    record.d[keyField.prop] = record.k;
                let sql = `INSERT INTO ${this.escape(tableName)} SET ${this.getFields(fields, record.d, params)}`;
                await this.query(sql, params);
            }
            else if (record.a == 'd' && record.k) {
                let sql = `DELETE FROM ${this.escape(tableName)} WHERE ${this.escape(keyField.field)}=?`;
                let params = [record.k];
                await this.query(sql, params);
            }
            ;
        }
        ;
        return;
    }
    ;
    escape(entity) {
        return this.connection.escapeId(entity);
    }
    getFields(fields, data, params) {
        let result = '';
        for (let prop in fields) {
            let field = fields[prop];
            if (!field.details) {
                if (!data || typeof (data[prop]) != 'undefined') {
                    if (result) {
                        result += ',';
                        result += this.escape(field.field || prop);
                    }
                    else
                        result = this.escape(field.field || prop);
                    if (data) {
                        result += '=?';
                        params.push(data[prop]);
                    }
                    ;
                }
                ;
            }
            ;
        }
        ;
        return result;
    }
    ;
    getQuery(fields, query, params) {
        if (query.length == 1)
            return this.getQuery(fields, query[0], params);
        let sql = '(';
        if (Array.isArray(query)) {
            let op = query[1];
            if (['like', '=', '!=', '<', '>', '>=', '<='].indexOf(op) > -1) {
                let field = fields[query[0]];
                if (!field)
                    throw `Field "${query[0]}" not defined`;
                sql += this.escape(field.field || query[0]) + ' ' + op + ' ?';
                params.push(query[2]);
            }
            else if (op == 'between') {
                let field = fields[query[0]];
                if (!field)
                    throw `Field "${query[0]}" not defined`;
                sql += this.escape(field.field || query[0]) + ' ' + op + ' ?,? ';
                params.push(query[2]);
                params.push(query[3]);
            }
            else if (op == 'in') {
                let field = fields[query[0]];
                if (!field)
                    throw `Field "${query[0]}" not defined`;
                sql += this.escape(field.field || query[0]) + ' ' + op + ' (?)';
                params.push(query[2]);
            }
            else {
                for (let i = 0; i < query.length; i++) {
                    if (Array.isArray(query[i]))
                        sql += this.getQuery(fields, query[i], params);
                    else if (query[i] == 'or' || query[i] == 'and')
                        sql += ' ' + query[i] + ' ';
                }
                ;
            }
            ;
        }
        ;
        sql += ')';
        return sql;
    }
    ;
    get connection() {
        if (!this._connection)
            this._connection = MySQL.createConnection(this.options);
        return this._connection;
    }
    ;
    end() {
        if (this._connection)
            this._connection.end();
        delete this._connection;
    }
    ;
    beginTransaction() {
        return new Promise((resolve, reject) => {
            this.transaction = true;
            this.connection.beginTransaction(function (err) {
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
            this.connection.commit((err) => {
                try {
                    this.end();
                }
                catch (err) { }
                ;
                if (err)
                    reject(err);
                else {
                    resolve(true);
                }
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
            this.connection.rollback((err) => {
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
