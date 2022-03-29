import {ISession, IWorkerPlugin} from '@ijstech/plugin';
import Crypto from '@ijstech/crypto';

class Worker implements IWorkerPlugin{
    async process(session: ISession, data: any): Promise<any> {
        if (data.password && data.hash){
            return await Crypto.verifyPassword(data.password, data.hash)
        }
        else if (data.password)
            return await Crypto.hashPassword(data.password);
        else if (data.uuid)
            return await Crypto.randomUUID();
    }
}
export default Worker;