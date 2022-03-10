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
        try {
            await this.syncTableSchema(tableName, fields);
        }
        catch (e) {
        }
        let sql = '';
        let params = [];
        sql = `DELETE FROM ${this.escape(tableName)} `;
        sql += 'WHERE ' + this.getQuery(fields, qry, params);
        return await this.query(sql, params);
    }
    ;
    async applyInsertQuery(tableName, fields, data) {
        try {
            await this.syncTableSchema(tableName, fields);
        }
        catch (e) {
        }
        let sql = '';
        let params = [];
        sql = `INSERT INTO ${this.escape(tableName)} SET ${this.getFields(fields, data, params)}`;
        return await this.query(sql, params);
    }
    ;
    async applySelectQuery(tableName, fields, qry) {
        try {
            await this.syncTableSchema(tableName, fields);
        }
        catch (e) {
        }
        let sql = '';
        let params = [];
        sql = `SELECT ${this.getFields(fields)} FROM ${this.escape(tableName)} `;
        sql += 'WHERE ' + this.getQuery(fields, qry, params);
        let result = await this.query(sql, params);
        return result;
    }
    ;
    async applyUpdateQuery(tableName, fields, data, qry) {
        try {
            await this.syncTableSchema(tableName, fields);
        }
        catch (e) {
        }
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
    async checkTableExists(tableName) {
        let sql = `SHOW TABLES LIKE ?`;
        let result = await this.query(sql, [tableName]);
        return result.length > 0;
    }
    ;
    escape(entity) {
        return this.connection.escapeId(entity);
    }
    ;
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
    import(sql) {
        return new Promise((resolve) => {
            let config = JSON.parse(JSON.stringify(this.options));
            config.multipleStatements = true;
            let connection = MySQL.createConnection(config);
            connection.beginTransaction(function (err) {
                if (err) {
                    connection.end();
                    resolve(false);
                }
                else {
                    connection.query(sql, [], function (err, result) {
                        if (err) {
                            connection.rollback(function (err) {
                                connection.end();
                                resolve(false);
                            });
                        }
                        else {
                            connection.commit(function () {
                                connection.end();
                                resolve(true);
                            });
                        }
                        ;
                    });
                }
                ;
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
    async syncTableSchema(tableName, fields) {
        try {
            const tableExists = await this.checkTableExists(tableName);
            if (!tableExists) {
                let pkName;
                const columnBuilder = [];
                const columnBuilderParams = [];
                for (const fieldName in fields) {
                    const field = fields[fieldName];
                    switch (field.dataType) {
                        case 'key':
                            pkName = fieldName;
                            columnBuilder.push(`${this.escape(fieldName)} CHAR(36) NOT NULL DEFAULT ''`);
                            break;
                        case 'ref':
                            columnBuilder.push(`${this.escape(field.field)} CHAR(36) DEFAULT NULL`);
                        case '1toM':
                            break;
                        case 'char':
                            columnBuilder.push(`${this.escape(fieldName)} CHAR(?) NOT NULL`);
                            columnBuilderParams.push(field.size);
                            break;
                        case 'varchar':
                            columnBuilder.push(`${this.escape(fieldName)} VARCHAR(?) NOT NULL`);
                            columnBuilderParams.push(field.size);
                            break;
                        case 'boolean':
                            columnBuilder.push(`${this.escape(fieldName)} TINYINT(1) NOT NULL`);
                            break;
                        case 'integer':
                            columnBuilder.push(`${this.escape(fieldName)} INT(?) NOT NULL`);
                            columnBuilderParams.push(field.digits || 11);
                            break;
                        case 'decimal':
                            columnBuilder.push(`${this.escape(fieldName)} DECIMAL(?, ?) NOT NULL`);
                            columnBuilderParams.push(field.digits || 11, field.decimals || 2);
                            break;
                        case 'date':
                            columnBuilder.push(`${this.escape(fieldName)} DATE NOT NULL`);
                            break;
                        case 'blob':
                            columnBuilder.push(`${this.escape(fieldName)} MEDIUMBLOB`);
                            break;
                        case 'text':
                            columnBuilder.push(`${this.escape(fieldName)} TEXT`);
                            break;
                        case 'mediumText':
                            columnBuilder.push(`${this.escape(fieldName)} MEDIUMTEXT`);
                            break;
                        case 'longText':
                            columnBuilder.push(`${this.escape(fieldName)} LONGTEXT`);
                            break;
                    }
                }
                if (pkName) {
                    columnBuilder.push(`PRIMARY KEY (${this.escape(pkName)})`);
                }
                if (columnBuilder.length > 0) {
                    const sql = `CREATE TABLE ${this.escape(tableName)} (${columnBuilder.join(', ')})`;
                    await this.query(sql, columnBuilderParams);
                }
                return true;
            }
            else {
                const sql = `DESCRIBE ${this.escape(tableName)}`;
                const columnDef = await this.query(sql);
                const columnBuilder = [];
                const columnBuilderPK = [];
                const columnBuilderParams = [];
                let prevField;
                for (const fieldName in fields) {
                    const field = fields[fieldName];
                    const currentField = columnDef.find(v => v['Field'] === (field.field || fieldName));
                    if (!currentField) {
                        switch (field.dataType) {
                            case 'key':
                                columnBuilder.push(`ADD ${this.escape(fieldName)} CHAR(36) NOT NULL DEFAULT '' FIRST`);
                                columnBuilderPK.push(`ADD PRIMARY KEY (${this.escape(fieldName)})`);
                                break;
                            case 'ref':
                                columnBuilder.push(`ADD ${this.escape(field.field)} CHAR(36) DEFAULT NULL ${prevField ? `AFTER ${this.escape(prevField)}` : `FIRST`}`);
                                break;
                            case '1toM':
                                break;
                            case 'char':
                                columnBuilder.push(`ADD ${this.escape(fieldName)} CHAR(?) NOT NULL ${prevField ? `AFTER ${this.escape(prevField)}` : `FIRST`}`);
                                columnBuilderParams.push(field.size);
                                break;
                            case 'varchar':
                                columnBuilder.push(`ADD ${this.escape(fieldName)} VARCHAR(?) NOT NULL ${prevField ? `AFTER ${this.escape(prevField)}` : `FIRST`}`);
                                columnBuilderParams.push(field.size);
                                break;
                            case 'boolean':
                                columnBuilder.push(`ADD ${this.escape(fieldName)} TINYINT(1) NOT NULL ${prevField ? `AFTER ${this.escape(prevField)}` : `FIRST`}`);
                                break;
                            case 'integer':
                                columnBuilder.push(`ADD ${this.escape(fieldName)} INT(?) NOT NULL ${prevField ? `AFTER ${this.escape(prevField)}` : `FIRST`}`);
                                columnBuilderParams.push(field.digits || 11);
                                break;
                            case 'decimal':
                                columnBuilder.push(`ADD ${this.escape(fieldName)} DECIMAL(?, ?) NOT NULL ${prevField ? `AFTER ${this.escape(prevField)}` : `FIRST`}`);
                                columnBuilderParams.push(field.digits || 11, field.decimals || 2);
                                break;
                            case 'date':
                                columnBuilder.push(`ADD ${this.escape(fieldName)} DATE NOT NULL ${prevField ? `AFTER ${this.escape(prevField)}` : `FIRST`}`);
                                break;
                            case 'blob':
                                columnBuilder.push(`ADD ${this.escape(fieldName)} MEDIUMBLOB ${prevField ? `AFTER ${this.escape(prevField)}` : `FIRST`}`);
                                break;
                            case 'text':
                                columnBuilder.push(`ADD ${this.escape(fieldName)} TEXT ${prevField ? `AFTER ${this.escape(prevField)}` : `FIRST`}`);
                                break;
                            case 'mediumText':
                                columnBuilder.push(`ADD ${this.escape(fieldName)} MEDIUMTEXT ${prevField ? `AFTER ${this.escape(prevField)}` : `FIRST`}`);
                                break;
                            case 'longText':
                                columnBuilder.push(`ADD ${this.escape(fieldName)} LONGTEXT ${prevField ? `AFTER ${this.escape(prevField)}` : `FIRST`}`);
                                break;
                        }
                    }
                    else {
                        switch (field.dataType) {
                            case 'varchar':
                                if (currentField['Type'].indexOf('varchar') >= 0) {
                                    const match = currentField['Type'].match(/\d+/g);
                                    if (match) {
                                        const size = parseInt(match[0]);
                                        if (field.size > size) {
                                            columnBuilder.push(`MODIFY ${this.escape(fieldName)} VARCHAR(?)`);
                                            columnBuilderParams.push(field.size);
                                        }
                                    }
                                }
                                break;
                        }
                    }
                    prevField = fieldName;
                }
                if (columnBuilder.length > 0) {
                    const sql = `ALTER TABLE ${this.escape(tableName)} ${columnBuilder.join(', ')}`;
                    await this.query(sql, columnBuilderParams);
                }
                if (columnBuilderPK.length > 0) {
                    const sql2 = `ALTER TABLE ${this.escape(tableName)} ${columnBuilderPK.join(',')}`;
                    await this.query(sql2);
                }
            }
        }
        catch (e) {
            throw e;
        }
    }
}
exports.MySQLClient = MySQLClient;
;
