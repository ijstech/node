"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
        try {
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
        catch (err) {
            console.error(err);
            throw err;
        }
        ;
    }
    ;
    async applyDeleteQuery(tableName, fields, qry) {
        try {
            await this.syncTableSchema(tableName, fields);
            let sql = '';
            let params = [];
            sql = `DELETE FROM ${this.escape(tableName)} `;
            sql += 'WHERE ' + this.getQuery(fields, qry, params);
            return await this.query(sql, params);
        }
        catch (err) {
            throw err;
        }
    }
    ;
    async applyInsertQuery(tableName, fields, data) {
        try {
            await this.syncTableSchema(tableName, fields);
            let sql = '';
            let params = [];
            sql = `INSERT INTO ${this.escape(tableName)} SET ${this.getFields(fields, data, params)}`;
            return await this.query(sql, params);
        }
        catch (e) {
            throw e;
        }
    }
    ;
    async applySelectQuery(tableName, fields, qry) {
        try {
            await this.syncTableSchema(tableName, fields);
            let sql = '';
            let params = [];
            sql = `SELECT ${this.getFields(fields)} FROM ${this.escape(tableName)} `;
            sql += 'WHERE ' + this.getQuery(fields, qry, params);
            let result = await this.query(sql, params);
            return result;
        }
        catch (e) {
            throw e;
        }
    }
    ;
    async applyUpdateQuery(tableName, fields, data, qry) {
        try {
            await this.syncTableSchema(tableName, fields);
            let sql = '';
            let params = [];
            sql = `UPDATE ${this.escape(tableName)} SET ${this.getFields(fields, data, params)} `;
            sql += 'WHERE ' + this.getQuery(fields, qry, params);
            return await this.query(sql, params);
        }
        catch (e) {
            throw e;
        }
    }
    ;
    async applyUpdateRecords(tableName, fields, records) {
        try {
            await this.syncTableSchema(tableName, fields);
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
                    if (!record.d[keyField.field])
                        record.d[keyField.field] = record.k;
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
        }
        catch (e) {
            throw e;
        }
        ;
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
        let idx = {};
        for (let prop in fields) {
            let field = fields[prop];
            let fieldName = field.field;
            if (!field.details) {
                if (!data || typeof (data[fieldName]) != 'undefined') {
                    if (!idx[fieldName]) {
                        idx[fieldName] = true;
                        if (result) {
                            result += ',';
                            result += this.escape(fieldName);
                        }
                        else
                            result = this.escape(fieldName);
                        if (data) {
                            result += '=?';
                            params.push(data[fieldName]);
                        }
                        ;
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
    async resolve(table, fields, criteria, args) {
        let sql = '';
        for (let p in fields) {
            let field = fields[p];
            if (sql)
                sql += ',';
            else
                sql = 'SELECT ';
            sql += this.escape(field.field);
            if (field.field !== p)
                sql += ` as ${this.escape(p)}`;
        }
        sql += ` FROM ?? WHERE 1 = 1 `;
        let params = [table];
        for (const arg in args) {
            const value = args[arg];
            const fieldName = fields[arg].field;
            const dataType = criteria[arg]['dataType'];
            switch (dataType) {
                case 'key':
                case 'char':
                case 'varchar':
                case 'date':
                case 'dateTime':
                case 'time':
                case 'boolean':
                case 'integer':
                case 'decimal':
                    sql += `AND ?? = ?`;
                    params.push(fieldName, value);
                    break;
                case 'blob':
                case 'text':
                case 'mediumText':
                case 'longText':
                    sql += `AND ?? LIKE CONCAT('%', ?, '%')`;
                    params.push(fieldName, value);
                    break;
            }
        }
        let data = await this.query(sql, params);
        return data;
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
            const buildColumn = (field, fieldName) => {
                let primaryKeyName;
                let sql;
                let params;
                switch (field.dataType) {
                    case 'key':
                        primaryKeyName = fieldName;
                        sql = `${this.escape(fieldName)} VARCHAR(${field.size || 36}) NOT NULL`;
                        break;
                    case 'ref':
                        sql = `${this.escape(fieldName)} VARCHAR(${field.size || 36})`;
                        break;
                    case 'char':
                        sql = `${this.escape(fieldName)} CHAR(?)`;
                        params = [field.size];
                        break;
                    case 'varchar':
                        sql = `${this.escape(fieldName)} VARCHAR(?)`;
                        params = [field.size];
                        break;
                    case 'boolean':
                        sql = `${this.escape(fieldName)} TINYINT(1)`;
                        break;
                    case 'integer':
                        sql = `${this.escape(fieldName)} INT(?)`;
                        params = [field.digits || 11];
                        break;
                    case 'decimal':
                        sql = `${this.escape(fieldName)} DECIMAL(?, ?)`;
                        params = [field.digits || 11, field.decimals || 2];
                        break;
                    case 'date':
                    case 'dateTime':
                    case 'time':
                    case 'text':
                    case 'mediumText':
                    case 'longText':
                        sql = `${this.escape(fieldName)} ${field.dataType.toUpperCase()}`;
                        break;
                    case 'blob':
                        sql = `${this.escape(fieldName)} MEDIUMBLOB`;
                        break;
                }
                if (sql) {
                    if (!['key', 'blob', 'text', 'mediumText', 'longText'].includes(field.dataType)) {
                        sql += field.notNull ? ' NOT NULL' : ' NULL';
                        sql += field.default !== undefined && field.default !== null ? ` DEFAULT ${field.default}` : '';
                    }
                }
                return {
                    primaryKeyName,
                    sql,
                    params
                };
            };
            const tableExists = await this.checkTableExists(tableName);
            if (!tableExists) {
                let pkName;
                const columnBuilder = [];
                const columnBuilderParams = [];
                let newFields = {};
                for (const prop in fields) {
                    const field = fields[prop];
                    const fieldName = field.field;
                    if (!newFields[fieldName.toLowerCase()]) {
                        newFields[fieldName.toLowerCase()] = true;
                        let { primaryKeyName, sql, params } = buildColumn(field, fieldName);
                        if (!pkName)
                            pkName = primaryKeyName;
                        if (sql) {
                            columnBuilder.push(sql);
                            if (params) {
                                columnBuilderParams.push(...params);
                            }
                        }
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
                const describeQuery = `DESCRIBE ${this.escape(tableName)}`;
                const columnDef = await this.query(describeQuery);
                const columnBuilder = [];
                const columnBuilderPK = [];
                const columnBuilderParams = [];
                let prevField;
                for (const prop in fields) {
                    const field = fields[prop];
                    const fieldName = field.field;
                    const currentField = columnDef.find(v => v['Field'] === (fieldName));
                    if (!currentField) {
                        let { primaryKeyName, sql, params } = buildColumn(field, fieldName);
                        if (primaryKeyName) {
                            columnBuilderPK.push(`ADD PRIMARY KEY (${this.escape(primaryKeyName)})`);
                        }
                        if (sql) {
                            sql = `ADD ${sql}`;
                            if (field.dataType === 'key') {
                                sql += ' FIRST';
                            }
                            else {
                                sql += prevField ? ` AFTER ${this.escape(prevField)}` : ` FIRST`;
                            }
                            columnBuilder.push(sql);
                            if (params) {
                                columnBuilderParams.push(...params);
                            }
                        }
                    }
                    else {
                        const nullChanged = currentField['Null'] === 'YES' && field.notNull || currentField['Null'] === 'NO' && !field.notNull;
                        const defaultChanged = currentField['Default'] == field.default ? false : true;
                        let sizeChanged = false;
                        switch (field.dataType) {
                            case 'varchar':
                                if (currentField['Type'].indexOf('varchar') >= 0) {
                                    const match = currentField['Type'].match(/\d+/g);
                                    if (match) {
                                        const size = parseInt(match[0]);
                                        if (field.size > size) {
                                            sizeChanged = true;
                                        }
                                    }
                                }
                                break;
                        }
                        if (nullChanged || defaultChanged || sizeChanged) {
                            let { primaryKeyName, sql, params } = buildColumn(field, fieldName);
                            if (sql) {
                                sql = `MODIFY ${sql}`;
                                columnBuilder.push(sql);
                                if (params) {
                                    columnBuilderParams.push(...params);
                                }
                            }
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
                ;
                return true;
            }
            ;
        }
        catch (e) {
            console.error(e);
            return false;
        }
        ;
    }
    ;
    async syncTableIndexes(tableName, indexes) {
        try {
            const result = await this.query(`SHOW INDEXES FROM ${this.escape(tableName)}`);
            const existingIndexes = result.reduce((acc, row) => {
                if (!acc[row.Key_name]) {
                    let indexType;
                    if (row.Non_unique === 0) {
                        indexType = 'UNIQUE';
                    }
                    else {
                        indexType = 'NON_UNIQUE';
                    }
                    acc[row.Key_name] = {
                        name: row.Key_name,
                        columns: [],
                        type: indexType
                    };
                }
                acc[row.Key_name].columns.push(row.Column_name);
                return acc;
            }, {});
            const createIndex = async (index) => {
                const columns = index.columns.join(', ');
                let createIndexSql;
                if (index.type === 'UNIQUE') {
                    createIndexSql = `CREATE UNIQUE INDEX ${this.escape(index.name)} ON ${this.escape(tableName)} (${columns})`;
                }
                else {
                    createIndexSql = `CREATE INDEX ${this.escape(index.name)} ON ${this.escape(tableName)} (${columns})`;
                }
                await this.query(createIndexSql);
            };
            const dropIndex = async (indexName) => {
                let dropIndexSql = `DROP INDEX ${this.escape(indexName)} ON ${this.escape(tableName)}`;
                await this.query(dropIndexSql);
            };
            for (const index of indexes) {
                const indexName = index.name;
                const type = index.type;
                if (!existingIndexes[indexName]) {
                    await createIndex(index);
                }
                else {
                    const typeChanged = existingIndexes[indexName].type !== type;
                    const existingIndexesColumns = existingIndexes[indexName].columns;
                    const columnsChanged = !existingIndexesColumns.every(column => index.columns.includes(column)) || !index.columns.every(column => existingIndexesColumns.includes(column));
                    if (typeChanged || columnsChanged) {
                        await dropIndex(indexName);
                        await createIndex(index);
                    }
                }
            }
            const indexesToDrop = Object.keys(existingIndexes)
                .filter(existingIndex => existingIndex !== 'PRIMARY' && !indexes.find(index => index.name === existingIndex));
            for (const indexName of indexesToDrop) {
                if (!indexes.find(index => index.name === indexName)) {
                    await dropIndex(indexName);
                }
            }
            return true;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
}
exports.MySQLClient = MySQLClient;
;
