"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = exports.getClient = void 0;
const mysql_1 = require("./mysql");
let Clients = {};
;
function getClient(options) {
    if (options.mysql) {
        let opt = options.mysql;
        let id = opt.host + ':' + opt.user + ':' + opt.database;
        if (!Clients[id])
            Clients[id] = new mysql_1.MySQLClient(opt);
        return Clients[id];
    }
}
exports.getClient = getClient;
;
function getPluginClient(vm, db, client) {
    let name = '$$plugin_db_' + db;
    if (!vm.loadedPlugins[name]) {
        vm.loadedPlugins[name] = true;
        let plugin = {
            async applyQueries(queries) {
                let result = await client.applyQueries(queries);
                return result;
            },
            beginTransaction() {
                return client.beginTransaction();
            },
            async checkTableExists(tableName) {
                let result = await client.checkTableExists(tableName);
                return result;
            },
            commit() {
                return client.commit();
            },
            async query(sql, params) {
                let result = await client.query(sql, params);
                return JSON.stringify(result);
            },
            async resolve(table, fields, criteria, args) {
                let result = await client.resolve(table, fields, criteria, args);
                return JSON.stringify(result);
            },
            rollback() {
                return client.rollback();
            }
        };
        vm.injectGlobalObject(name, plugin);
    }
    return name;
}
function loadPlugin(plugin, options, vm) {
    return {
        getConnection(name) {
            let opt;
            if (name)
                opt = options[name];
            else {
                opt = options[Object.keys(options)[0]];
            }
            if (vm) {
                let client = getClient(opt);
                return getPluginClient(vm, name, client);
            }
            else
                return getClient(opt);
        }
    };
}
exports.loadPlugin = loadPlugin;
;
exports.default = loadPlugin;
