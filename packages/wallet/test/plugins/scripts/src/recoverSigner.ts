import {IWorkerPlugin, ISession} from '@ijstech/plugin';

class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {
        let wallet = session.plugins.wallet;
        let signer = await wallet.recoverSigner(data.msg, data.signature);
        let verified = await wallet.verifyMessage(signer, data.msg, data.signature);
        return {
            signer: signer,
            verified: verified
        }
    };
};
export default Worker;