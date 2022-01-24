import {IRedisConnection, IMySQLConnection, IWalletRequiredPluginOptions} from '@ijstech/types';
declare const Config: {
    redis: IRedisConnection,
    mysql: IMySQLConnection,
    wallet: IWalletRequiredPluginOptions
}
export = Config