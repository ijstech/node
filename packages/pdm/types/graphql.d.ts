import * as Types from '@ijstech/types';
import { ISchema } from './types';
export declare class TGraphQL {
    private _schema;
    private _introspection;
    private _client;
    constructor(schema: ISchema, client: Types.IDBClient);
    private buildSchema;
    query(source: string): Promise<any>;
    get introspection(): any;
}
