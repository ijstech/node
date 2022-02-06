import {IRedisConnection, IMySQLConnection, IWalletRequiredPluginOptions} from '@ijstech/types';
declare const Config: {
    redis: IRedisConnection,
    mysql: IMySQLConnection,
    wallet: IWalletRequiredPluginOptions,
    form: {
        host: string,
        token: string,
        package?: string,
        mainForm?: string
    },
    github: {
        org: string,
        repo: string,
        token: string
    }
}
export = Config