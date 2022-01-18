import {IRedisConnection, IMySQLConnection} from '@ijstech/types';
declare const Config: {
    redis: IRedisConnection,
    mysql: IMySQLConnection
}
export = Config