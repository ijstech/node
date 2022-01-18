import * as Types from '@ijstech/types';
import * as MySQL from 'mysql';

export class MySQLClient implements Types.IDBClient{
    private _connection: MySQL.Connection;
    private options: Types.IMySQLConnection;
    private transaction: boolean;

    constructor(options: Types.IMySQLConnection){
        this.options = options;
    };
    get connection(): MySQL.Connection{
        if (!this._connection)
            this._connection = MySQL.createConnection(this.options);
        return this._connection;
    };
    private end(){
        this._connection.end();
        delete this._connection;
    };
    beginTransaction(): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            this.transaction = true;
            this.connection.beginTransaction(function(err){                        
                try{
                    this.end();
                }
                catch(err){};
                if (err)
                    reject(err)
                else
                    resolve(true);
            });
        });
    };
    commit(): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            this.transaction = false;
            this.connection.commit(function(err){                        
                try{
                    this.end();
                }
                catch(err){};
                if (err)
                    reject(err)
                else
                    resolve(true);
            });
        });
    };
    query(sql: string, params?: any[]): Promise<any> {
        return new Promise((resolve, reject)=>{
            try{
                this.connection.query(sql, params, function(err, result){
                    if (err)
                        reject(err)
                    else
                        resolve(result);
                })
            }
            finally{
                if (!this.transaction)
                    this.end();
            };
        });
    };
    rollback(): Promise<boolean>{
        return new Promise((resolve, reject)=>{
            this.transaction = false;
            this.connection.rollback(function(err){                        
                try{
                    this.end();
                }
                catch(err){};
                if (err)
                    reject(err)
                else
                    resolve(true)                
            });
        });
    };
};