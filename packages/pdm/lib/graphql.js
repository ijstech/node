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
exports.TGraphQL = void 0;
const GraphQL = __importStar(require("graphql"));
class TGraphQL {
    constructor(schema, client) {
        this._schema = this.buildSchema(schema);
        this._client = client;
    }
    ;
    buildSchema(schema) {
        const rootQueryTypeFields = {};
        for (const tableName in schema) {
            const fields = schema[tableName];
            const fieldObject = {};
            const criteria = {};
            for (const prop in fields) {
                const field = fields[prop];
                const fieldName = field.field;
                let type;
                switch (field.dataType) {
                    case 'key':
                    case 'char':
                    case 'varchar':
                    case 'date':
                    case 'dateTime':
                    case 'time':
                        type = new GraphQL.GraphQLNonNull(GraphQL.GraphQLString);
                        criteria[prop] = { type: GraphQL.GraphQLString };
                        break;
                    case 'ref':
                    case '1toM':
                        break;
                    case 'boolean':
                        type = new GraphQL.GraphQLNonNull(GraphQL.GraphQLBoolean);
                        criteria[prop] = { type: GraphQL.GraphQLBoolean };
                        break;
                    case 'integer':
                        type = new GraphQL.GraphQLNonNull(GraphQL.GraphQLInt);
                        criteria[prop] = { type: GraphQL.GraphQLInt };
                        break;
                    case 'decimal':
                        type = new GraphQL.GraphQLNonNull(GraphQL.GraphQLFloat);
                        criteria[prop] = { type: GraphQL.GraphQLFloat };
                        break;
                    case 'blob':
                    case 'text':
                    case 'mediumText':
                    case 'longText':
                        type = GraphQL.GraphQLString;
                        criteria[prop] = { type: GraphQL.GraphQLString };
                        break;
                }
                if (type) {
                    type.field = fieldName;
                    fieldObject[prop] = { type };
                    criteria[prop]['dataType'] = field.dataType;
                }
            }
            const tableType = new GraphQL.GraphQLObjectType({
                name: tableName,
                fields: () => fieldObject,
            });
            rootQueryTypeFields[tableName] = {
                type: new GraphQL.GraphQLList(tableType),
                args: criteria,
                resolve: async (parent, args) => {
                    let result = await this._client.resolve(tableName, fields, criteria, args);
                    if (typeof (result) == 'string')
                        result = JSON.parse(result);
                    return result;
                }
            };
        }
        const rootQueryType = new GraphQL.GraphQLObjectType({
            name: 'Query',
            description: 'Root query',
            fields: () => rootQueryTypeFields
        });
        return new GraphQL.GraphQLSchema({
            query: rootQueryType
        });
    }
    ;
    query(source) {
        return new Promise((resolve, reject) => {
            GraphQL.graphql({
                schema: this._schema,
                source: source
            }).then(data => resolve(data.data)).catch(e => {
                throw e;
            });
        });
    }
    ;
    get introspection() {
        if (!this._introspection) {
            this._introspection = GraphQL.introspectionFromSchema(this._schema);
        }
        return this._introspection;
    }
}
exports.TGraphQL = TGraphQL;
;
