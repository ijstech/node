"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
exports.Plugin = {
    async applyQueries(queries) {
        let plugin = global.$$plugin_db_default_default;
        let result = await plugin.applyQueries(queries);
        return result;
    },
    beginTransaction() {
        let plugin = global.$$plugin_db_default;
        return plugin.beginTransaction();
    },
    async checkTableExists(tableName) {
        let plugin = global.$$plugin_db_default;
        let result = await plugin.checkTableExists(tableName);
        return result;
    },
    commit() {
        let plugin = global.$$plugin_db_default;
        return plugin.commit();
    },
    async query(sql, params) {
        let plugin = global.$$plugin_db_default;
        let result = await plugin.query(sql, params);
        return result;
    },
    async resolve(table, fields, criteria, args) {
        let plugin = global.$$plugin_db_default;
        let result = await plugin.resolve(table, fields, criteria, args);
        return result;
    },
    rollback() {
        let plugin = global.$$plugin_db_default;
        return plugin.rollback();
    },
    async syncTableSchema(tableName, fields) {
        let plugin = global.$$plugin_db_default;
        return await plugin.syncTableSchema(tableName, fields);
    },
    async syncTableIndexes(tableName, indexes) {
        let plugin = global.$$plugin_db_default;
        return await plugin.syncTableIndexes(tableName, indexes);
    }
};
exports.default = exports.Plugin;
