"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneToMany = exports.BlobField = exports.TimeField = exports.DateTimeField = exports.DateField = exports.BooleanField = exports.IntegerField = exports.DecimalField = exports.StringField = exports.RefTo = exports.KeyField = exports.Index = exports.RecordSet = exports.TRecordSet = exports.TRecord = exports.TContext = exports.DBClient = void 0;
var dbClient_1 = require("./dbClient");
Object.defineProperty(exports, "DBClient", { enumerable: true, get: function () { return dbClient_1.DBClient; } });
function generateUUID() {
    var d = new Date().getTime();
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        }
        else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
;
;
;
class TContext {
    constructor(client) {
        this._recordSets = {};
        this._recordSetIdxCount = 1;
        this._recordIdxCount = 1;
        this._modifiedRecords = {};
        this._applyQueries = {};
        this._deletedRecords = {};
        this.initRecordsets();
        this._client = client;
    }
    ;
    _getRecordSetId() {
        return this._recordSetIdxCount++;
    }
    ;
    _getSchema() {
        let result = {};
        for (let tableName in this.$$records) {
            let fields = this[tableName]['fields'];
            result[tableName] = fields;
        }
        return result;
    }
    ;
    _checkTableExists(tableName) {
        return this._client.checkTableExists(tableName);
    }
    ;
    async _initTables() {
        try {
            for (let n in this.$$records) {
                let rs = this.$$records[n];
                const syncTableSchemaResult = await this._client.syncTableSchema(rs.tableName, rs.recordSet.fields);
                if (!syncTableSchemaResult)
                    return false;
                let indexes = [];
                for (let name in rs.recordType['$$indexes']) {
                    let properties = rs.recordType['$$indexes'][name];
                    indexes.push({
                        name,
                        ...properties
                    });
                }
                const syncTableIndexesResult = await this._client.syncTableIndexes(rs.tableName, indexes);
                if (!syncTableIndexesResult)
                    return false;
            }
            return true;
        }
        catch (err) {
            return false;
        }
    }
    getApplyQueries(recordSet) {
        let id = recordSet._id;
        if (!this._applyQueries[id])
            this._applyQueries[id] = {
                id: recordSet._id,
                fields: recordSet.fields,
                table: recordSet.tableName,
                queries: []
            };
        return this._applyQueries[id].queries;
    }
    applyDelete(recordSet, query) {
        let queries = this.getApplyQueries(recordSet);
        queries.push({
            a: 'd',
            q: query
        });
    }
    ;
    applyInsert(recordSet, data) {
        let queries = this.getApplyQueries(recordSet);
        queries.push({
            a: 'i',
            d: data
        });
    }
    ;
    applyUpdate(recordSet, data, query) {
        let queries = this.getApplyQueries(recordSet);
        queries.push({
            a: 'u',
            d: data,
            q: query
        });
    }
    ;
    initRecordsets() {
        for (let n in this.$$records) {
            let t = this.$$records[n];
            if (t.recordSetType)
                this[n] = new (t.recordSetType)(this, t.recordType, t.tableName);
            else
                this[n] = new TRecordSet(this, t.recordType, t.tableName);
            t.recordSet = this[n];
        }
        ;
    }
    ;
    async fetch(recordSet) {
        let queries = [];
        let self = this;
        function getQueries() {
            if (recordSet._queries.length > 0) {
                let id = recordSet._id;
                self._recordSets[id] = recordSet;
                let fields = recordSet.fields;
                let qry = {
                    id: id,
                    table: recordSet.tableName,
                    fields: fields,
                    queries: recordSet._queries
                };
                queries.push(qry);
            }
            ;
        }
        ;
        if (recordSet) {
            getQueries();
        }
        else {
            for (let v in this.$$records) {
                let rs = this.$$records[v];
                let tableName = rs.tableName;
                recordSet = rs.recordSet;
                getQueries();
            }
        }
        ;
        let client = this._client || global['$$pdm_plugin'];
        let data = await client.applyQueries(queries);
        if (typeof (data) == 'string')
            data = JSON.parse(data);
        if (data && data[0] && data[0].error)
            throw data[0].error;
        let result;
        for (let i = 0; i < data.length; i++) {
            let r = data[i];
            if (r.id) {
                let recordSet = this._recordSets[r.id];
                if (recordSet) {
                    result = recordSet.mergeRecords(r.result);
                    recordSet._queries = [];
                }
            }
            ;
        }
        ;
        if (recordSet)
            return result;
        else
            return true;
    }
    ;
    modifyRecord(record) {
        if (!record.$$id)
            record.$$id = this._recordIdxCount++;
        this._modifiedRecords[record.$$id] = record;
    }
    ;
    reset() {
        for (let v in this.$$records) {
            let rs = this.$$records[v];
            rs.recordSet.reset();
        }
    }
    ;
    async save() {
        let data = {};
        for (let i in this._modifiedRecords) {
            let record = this._modifiedRecords[i];
            let id = record.$$recordSet._id;
            if (!data[id]) {
                data[id] = {
                    fields: record.$$recordSet.fields,
                    id: id,
                    table: record.$$recordSet.tableName,
                    records: []
                };
            }
            ;
            let records = data[id].records;
            records.push({
                a: record.$$newRecord ? 'i' : record.$$deleted ? 'd' : 'u',
                k: record.$$keyValue,
                d: record.$$deleted ? undefined : record.$$modifies
            });
        }
        ;
        for (let i in this._applyQueries) {
            let query = this._applyQueries[i];
            let id = query.id;
            if (!data[id]) {
                data[id] = {
                    fields: query.fields,
                    id: id,
                    table: query.table,
                    queries: []
                };
            }
            ;
            data[id].queries = query.queries;
        }
        ;
        let queries = [];
        for (let i in data)
            queries.push(data[i]);
        let client = this._client || global['$$pdm_plugin'];
        let result = await client.applyQueries(queries);
        if (typeof (result) == 'string')
            result = JSON.parse(result);
        if (result && result[0] && result[0].error)
            throw result[0].error;
        for (let i in this._modifiedRecords) {
            let record = this._modifiedRecords[i];
            delete record.$$modified;
            delete record.$$newRecord;
            delete record.$$keyValue;
            delete record.$$modifies;
            delete record.$$origValues;
        }
        ;
        this._applyQueries = {};
        this._modifiedRecords = {};
    }
    ;
}
exports.TContext = TContext;
;
function queryFunc(...args) {
    if (typeof (args[0]) == 'function') {
        let qry = [];
        this.queries.push(qry);
        args[0](new TQuery(qry));
    }
    else {
        this.queries.push(args);
    }
    ;
    return new TQueryAndOr(this.parentQuery || this.queries);
}
;
class TQueryAndOr {
    constructor(parentQuery) {
        this.and = (...args) => {
            this.queries = [];
            this.parentQuery.push('and');
            this.parentQuery.push(this.queries);
            return queryFunc.apply(this, args);
        };
        this.or = (...args) => {
            this.queries = [];
            this.parentQuery.push('or');
            this.parentQuery.push(this.queries);
            return queryFunc.apply(this, args);
        };
        this.parentQuery = parentQuery || [];
    }
    ;
}
;
class TQuery {
    constructor(queries) {
        this.where = (...args) => {
            return queryFunc.apply(this, args);
        };
        this.queries = queries || [];
    }
    ;
}
;
;
class TRecord {
    constructor(recordSet, data) {
        this.recordSet = recordSet;
        this.data = data;
    }
    ;
}
exports.TRecord = TRecord;
;
;
class TRecordSet {
    constructor(context, record, tableName, master, masterField) {
        this._queries = [];
        this._recordsIdx = {};
        this._records = [];
        this._currIdx = 0;
        this._id = context._getRecordSetId();
        this._context = context;
        this._recordType = record;
        this._tableName = tableName;
        this._master = master;
        this._masterField = masterField;
    }
    ;
    add(data) {
        let result = {};
        if (data) {
            for (let n in data) {
                if (!n.startsWith('$'))
                    result[n] = data[n];
            }
            ;
        }
        ;
        for (let prop in this.fields) {
            let field = this._fields[prop];
            if (field.field && prop != field.field) {
                if (typeof (result[prop]) != 'undefined' && typeof (result[field.field]) == 'undefined')
                    result[field.field] = result[prop];
            }
        }
        ;
        if (this.keyField && typeof (result[this.keyField.field]) == 'undefined')
            result[this.keyField.field] = generateUUID();
        result.$$newRecord = true;
        this._records.push(result);
        return this.proxy(result);
    }
    ;
    applyInsert(data, options) {
        for (let prop in this.fields) {
            let field = this._fields[prop];
            if (field.field && prop != field.field) {
                if (typeof (data[prop]) != 'undefined' && typeof (data[field.field]) == 'undefined')
                    data[field.field] = data[prop];
            }
        }
        ;
        if (this.keyField && typeof (data[this.keyField.field]) == 'undefined')
            data[this.keyField.field] = generateUUID();
        this.context.applyInsert(this, data);
    }
    ;
    applyDelete() {
        let qry = [];
        this.context.applyDelete(this, qry);
        let result = new TQuery(qry);
        return result;
    }
    ;
    applyUpdate(data, keys) {
        let qry = [];
        for (let prop in this.fields) {
            let field = this._fields[prop];
            if (field.field && prop != field.field) {
                if (typeof (data[prop]) != 'undefined' && typeof (data[field.field]) == 'undefined')
                    data[field.field] = data[prop];
                if (keys) {
                    if (typeof (keys[prop]) != 'undefined' && typeof (keys[field.field]) == 'undefined') {
                        if (qry.length > 0)
                            qry.push('and');
                        qry.push([prop, '=', keys[prop]]);
                    }
                    ;
                }
                ;
            }
            ;
        }
        ;
        this.context.applyUpdate(this, data, qry);
        let result = new TQuery(qry);
        return result;
    }
    ;
    get context() {
        return this._context;
    }
    get count() {
        return this._records.length;
    }
    ;
    get current() {
        return this.proxy(this._records[this._currIdx]);
    }
    delete(record) {
        let rd = record.$$record;
        let idx = this._records.indexOf(rd);
        if (idx > -1) {
            rd.$$deleted = true;
            rd.$$keyValue = rd[this.keyField.prop || this.keyField.field];
            this._records.splice(idx, 1);
            if (this._currIdx > 0)
                this._currIdx--;
            this.context.modifyRecord(rd);
        }
    }
    ;
    async fetch() {
        if (this._master && !this._fetchAll) {
            this._fetchAll = true;
            this._queries.push({ a: 's', q: [[this._masterField, '=', this._master.$$keyValue]] });
        }
        return new Promise(async (resolve) => {
            let result = await this._context.fetch(this);
            resolve(result);
        });
    }
    ;
    get fields() {
        if (!this._fields) {
            let rd = new this._recordType();
            this._fields = rd.$$fields;
        }
        ;
        return this._fields;
    }
    ;
    get first() {
        this._currIdx = 0;
        return this.proxy(this._records[0]);
    }
    mergeRecords(records) {
        let keyField = this.keyField;
        let result = [];
        if (keyField) {
            for (let i = 0; i < records.length; i++) {
                let record = records[i];
                let kv = record[keyField.field];
                if (kv) {
                    if (!this._recordsIdx[kv]) {
                        this._records.push(record);
                        this._recordsIdx[kv] = record;
                    }
                    else if (this._recordsIdx[kv]['$$record']) {
                        this._recordsIdx[kv]['$$record'] = record;
                    }
                    result.push(this.proxy(this._recordsIdx[kv]));
                }
                ;
            }
            ;
        }
        else {
            this._records = this._records.concat(records);
        }
        return result;
    }
    get next() {
        if (this._currIdx < this._records.length)
            this._currIdx++;
        return this.proxy(this._records[this._currIdx]);
    }
    get keyField() {
        if (this._keyField)
            return this._keyField;
        let fields = this.fields;
        for (let f in fields) {
            let field = fields[f];
            if (field.dataType == 'key') {
                if (!field.field)
                    field.field = f;
                field.prop = f;
                this._keyField = field;
                return field;
            }
            ;
        }
        ;
    }
    ;
    proxy(record) {
        if (!record)
            return;
        if (!record.$$proxy) {
            record.$$record = record;
            record.$$recordSet = this;
            record.$$proxy = new Proxy(record, {
                get: (obj, prop) => {
                    let field = this.fields[prop];
                    if (field && field.dataType == 'ref') {
                        if (record.$$record[field.field] === null)
                            return;
                        else if (!record.$$record[prop]) {
                            return new Promise(async (resolve) => {
                                let rs = this.context[field.record];
                                let rd = await rs.queryRecord(record.$$record[field.field]);
                                record.$$record[prop] = rd ? rd : null;
                                if (record.$$record[prop] === null)
                                    return resolve(null);
                                resolve(record.$$record[prop]);
                            });
                        }
                        else
                            return record.$$record[prop];
                    }
                    else if (field && field.details) {
                        if (!record.$$keyValue)
                            record.$$keyValue = record.$$record[this.keyField.field];
                        if (!record.$$record[prop])
                            record.$$record[prop] = new TRecordSet(this._context, field.details, field.table, record, field.prop);
                        return record.$$record[prop];
                    }
                    else if (prop == '$$record')
                        return record.$$record;
                    else if (field)
                        return record.$$record[field.field];
                    else
                        return record.$$record[prop];
                },
                set: (obj, prop, value) => {
                    if (!record.$$keyValue)
                        record.$$keyValue = record.$$record[this.keyField.field];
                    let fieldName = this.fields[prop].field;
                    record.$$origValues = record.$$origValues || {};
                    if (typeof (record.$$origValues[fieldName]) == 'undefined')
                        record.$$origValues[fieldName] = record.$$record[fieldName];
                    record.$$modifies = record.$$modifies || {};
                    record.$$modifies[fieldName] = value;
                    this.validateFieldValue(prop, value);
                    if (!record.$$modified) {
                        record.$$modified = true;
                        this.context.modifyRecord(record);
                    }
                    ;
                    record.$$record[fieldName] = value;
                    return true;
                }
            });
        }
        ;
        return record.$$proxy;
    }
    ;
    get query() {
        let qry = [];
        let result = new TQuery(qry);
        this._queries.push({ a: 's', q: qry });
        return result;
    }
    ;
    async queryRecord(keyValue) {
        if (this._recordsIdx[keyValue])
            return this.proxy(this._recordsIdx[keyValue]);
        else {
            this._queries.push({ a: 's', q: [this.keyField.prop, '=', keyValue] });
            await this.fetch();
            if (this._recordsIdx[keyValue])
                return this.proxy(this._recordsIdx[keyValue]);
        }
        ;
    }
    ;
    records(index) {
        return this.proxy(this._records[index]);
    }
    ;
    reset() {
        this._currIdx = 0;
        this._queries = [];
        this._records = [];
        this._recordsIdx = {};
    }
    ;
    get tableName() {
        return this._tableName;
    }
    ;
    validateFieldValue(prop, value) {
        let field = this.fields[prop];
        if (!field)
            throw `Field "${prop}" is not defined`;
        if (field.dataType == 'varchar' && value && value.length > field.size)
            throw `Value for "${prop}" is too long`;
    }
    ;
    values(field) {
        let result = [];
        for (let i = 0; i < this._records.length; i++) {
            let r = this._records[i];
            result.push(r[field]);
        }
        return result;
    }
}
exports.TRecordSet = TRecordSet;
;
;
;
;
;
;
;
;
;
function RecordSet(tableName, recordType, recordSetType) {
    return function (target, propName, params) {
        target['$$records'] = target['$$records'] || {};
        target['$$records'][propName] = {
            tableName: tableName,
            recordType: recordType,
            recordSetType: recordSetType
        };
    };
}
exports.RecordSet = RecordSet;
;
function Index(indexProps) {
    return function (target) {
        const indexName = indexProps.name || 'PRIMARY';
        let indexType;
        if (!indexProps.name) {
            indexType = 'PRIMARY';
        }
        else {
            indexType = indexProps.type || 'NON_UNIQUE';
        }
        target['$$indexes'] = target['$$indexes'] || {};
        target['$$indexes'][indexName] = {
            columns: indexProps.columns,
            type: indexType
        };
    };
}
exports.Index = Index;
function KeyField(fieldType) {
    return function (target, propName) {
        fieldType = fieldType || {};
        fieldType.field = fieldType.field || propName;
        fieldType.dataType = 'key';
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
}
exports.KeyField = KeyField;
function RefTo(record, field) {
    return function (target, propName) {
        let fieldType = {
            field: field || propName,
            record: record
        };
        fieldType.dataType = 'ref';
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
}
exports.RefTo = RefTo;
function StringField(fieldType) {
    return function (target, propName) {
        fieldType = fieldType || {};
        fieldType.field = fieldType.field || propName;
        fieldType.dataType = fieldType.dataType || 'varchar';
        fieldType.size = fieldType.size || 50;
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
}
exports.StringField = StringField;
;
function DecimalField(fieldType) {
    return function (target, propName) {
        fieldType = fieldType || {};
        fieldType.field = fieldType.field || propName;
        fieldType.dataType = 'decimal';
        if (typeof (fieldType.digits) == 'undefined')
            fieldType.digits = 10;
        if (typeof (fieldType.decimals) == 'undefined')
            fieldType.decimals = 2;
        if (fieldType.digits < fieldType.decimals)
            fieldType.digits = fieldType.decimals;
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
}
exports.DecimalField = DecimalField;
;
function IntegerField(fieldType) {
    return function (target, propName) {
        fieldType = fieldType || {};
        fieldType.field = fieldType.field || propName;
        fieldType.dataType = 'integer';
        if (typeof (fieldType.digits) == 'undefined')
            fieldType.digits = 10;
        if (typeof (fieldType.decimals) == 'undefined')
            fieldType.decimals = 2;
        if (fieldType.digits < fieldType.decimals)
            fieldType.digits = fieldType.decimals;
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
}
exports.IntegerField = IntegerField;
;
function BooleanField(fieldType) {
    return function (target, propName) {
        fieldType = fieldType || {};
        fieldType.field = fieldType.field || propName;
        fieldType.dataType = 'boolean';
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
}
exports.BooleanField = BooleanField;
;
function DateField(fieldType) {
    return function (target, propName) {
        fieldType = fieldType || {};
        fieldType.field = fieldType.field || propName;
        fieldType.dataType = 'date';
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
}
exports.DateField = DateField;
;
function DateTimeField(fieldType) {
    return function (target, propName) {
        fieldType = fieldType || {};
        fieldType.field = fieldType.field || propName;
        fieldType.dataType = 'dateTime';
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
}
exports.DateTimeField = DateTimeField;
;
function TimeField(fieldType) {
    return function (target, propName) {
        fieldType = fieldType || {};
        fieldType.field = fieldType.field || propName;
        fieldType.dataType = 'time';
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
}
exports.TimeField = TimeField;
;
function BlobField(fieldType) {
    return function (target, propName) {
        fieldType = fieldType || {};
        fieldType.field = fieldType.field || propName;
        fieldType.dataType = 'blob';
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
}
exports.BlobField = BlobField;
;
function OneToMany(record, prop, tableName, fieldName) {
    return function (target, propName) {
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = { details: record, table: tableName, field: fieldName, prop: prop, dataType: '1toM' };
    };
}
exports.OneToMany = OneToMany;
;
