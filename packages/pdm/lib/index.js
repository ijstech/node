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
exports.loadPlugin = void 0;
const PDM = __importStar(require("./pdm"));
const DB = __importStar(require("@ijstech/db"));
const graphql_1 = require("./graphql");
exports.default = PDM;
function loadPlugin(worker, options) {
    let client;
    if (!client)
        client = DB.getClient(options[Object.keys(options)[0]]);
    const plugin = {
        async applyQueries(queries) {
            let result = await client.applyQueries(queries);
            if (typeof (result) == 'string')
                return JSON.stringify(result);
            else
                return result;
        },
        async graphQuery(schema, query) {
            let graphql = new graphql_1.TGraphQL(schema, client);
            return await graphql.query(query);
        },
        graphIntrospection(schema) {
            let graphql = new graphql_1.TGraphQL(schema, client);
            return graphql.introspection;
        }
    };
    if (worker.vm) {
        worker.vm.injectGlobalObject('$$pdm_plugin', plugin);
    }
    else {
        global['$$pdm_plugin'] = plugin;
    }
    ;
}
exports.loadPlugin = loadPlugin;
;
