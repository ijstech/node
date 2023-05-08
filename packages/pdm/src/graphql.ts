import * as GraphQL from "graphql";
import * as Types from '@ijstech/types';
import {TContext} from './pdm';
import {ISchema, IGraphClient} from './types';

export class TGraphQL{
    private _schema: GraphQL.GraphQLSchema;
    private _introspection: any;    
    private _client: Types.IDBClient;
    
    constructor(schema: ISchema, client: Types.IDBClient){
        this._schema = this.buildSchema(schema);
        this._client = client;
    };
    private buildSchema(schema: ISchema): GraphQL.GraphQLSchema {
        const rootQueryTypeFields = {};
        for(const tableName in schema) {
            const fields = schema[tableName];
            const fieldObject = {};
            const criteria = {};
            for(const prop in fields) {
                const field = fields[prop];
                const fieldName = field.field;
                let type:any;
                switch(field.dataType) {
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
                if(type) {
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
                    if (typeof(result) == 'string')
                        result = JSON.parse(result);
                    return result;
                }
            }
        }
        const rootQueryType = new GraphQL.GraphQLObjectType({
            name: 'Query',
            description: 'Root query',
            fields: () => rootQueryTypeFields
        });
        return new GraphQL.GraphQLSchema({
            query: rootQueryType
        })
    };
    query(source: string): Promise<any> {
        return new Promise((resolve, reject) => {
            GraphQL.graphql({
                schema: this._schema,
                source: source
            }).then(data => resolve(data.data)).catch(e => {
                throw e;
            });
        });
    };
    get introspection(): any {
        if(!this._introspection) {
            this._introspection = GraphQL.introspectionFromSchema(this._schema);
        }
        return this._introspection;
    }
};