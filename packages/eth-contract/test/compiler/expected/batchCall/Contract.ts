import {IWallet, Contract as _Contract, Transaction, TransactionReceipt, BigNumber, Event, IBatchRequestObj, TransactionOptions} from "@ijstech/eth-contract";
import Bin from "./Contract.json";
export interface IDeployParams {i256:number|BigNumber;ui256:number|BigNumber;b32:string;b:string;s:string}
export interface IPay_2Params {to:string;amount:number|BigNumber}
export interface IPowParams {x:number|BigNumber;n:number|BigNumber}
export interface IS2nsaParams {param1:string;param2:number|BigNumber}
export interface ISetParams {b:string;ns:{ss:{i256:number|BigNumber,ui256:number|BigNumber,b32:string,b:string,s:string}}}
export interface ISet_1Params {i:number|BigNumber;ss:{i256:number|BigNumber,ui256:number|BigNumber,b32:string,b:string,s:string}}
export interface ISet_2Params {s:string;nsa:{ss:{i256:number|BigNumber,ui256:number|BigNumber,b32:string,b:string,s:string}}[]}
export class Contract extends _Contract{
    static _abi: any = Bin.abi;
    constructor(wallet: IWallet, address?: string){
        super(wallet, address, Bin.abi, Bin.bytecode);
        this.assign()
    }
    deploy(params: IDeployParams, options?: TransactionOptions): Promise<string>{
        return this.__deploy([this.wallet.utils.toString(params.i256),this.wallet.utils.toString(params.ui256),this.wallet.utils.stringToBytes32(params.b32),this.wallet.utils.stringToBytes(params.b),params.s], options);
    }
    parseSet1Event(receipt: TransactionReceipt): Contract.Set1Event[]{
        return this.parseEvents(receipt, "Set1").map(e=>this.decodeSet1Event(e));
    }
    decodeSet1Event(event: Event): Contract.Set1Event{
        let result = event.data;
        return {
            i: new BigNumber(result.i),
            ss: 
            {
                i256: new BigNumber(result.ss.i256),
                ui256: new BigNumber(result.ss.ui256),
                b32: result.ss.b32,
                b: result.ss.b,
                s: result.ss.s
            }
            ,
            _event: event
        };
    }
    parseSet2Event(receipt: TransactionReceipt): Contract.Set2Event[]{
        return this.parseEvents(receipt, "Set2").map(e=>this.decodeSet2Event(e));
    }
    decodeSet2Event(event: Event): Contract.Set2Event{
        let result = event.data;
        return {
            b: result.b,
            ns: 
            {
                ss: 
                {
                    i256: new BigNumber(result.ns.ss.i256),
                    ui256: new BigNumber(result.ns.ss.ui256),
                    b32: result.ns.ss.b32,
                    b: result.ns.ss.b,
                    s: result.ns.ss.s
                }
                
            }
            ,
            _event: event
        };
    }
    parseSet3Event(receipt: TransactionReceipt): Contract.Set3Event[]{
        return this.parseEvents(receipt, "Set3").map(e=>this.decodeSet3Event(e));
    }
    decodeSet3Event(event: Event): Contract.Set3Event{
        let result = event.data;
        return {
            s: result.s,
            nsa: result.nsa.map(e=>(
                {
                    ss: 
                    {
                        i256: new BigNumber(e.ss.i256),
                        ui256: new BigNumber(e.ss.ui256),
                        b32: e.ss.b32,
                        b: e.ss.b,
                        s: e.ss.s
                    }
                    
                }
            )),
            _event: event
        };
    }
    PI: {
        (options?: TransactionOptions): Promise<BigNumber>;
        batchCall: (batchObj: IBatchRequestObj, key: string, options?: TransactionOptions) => Promise<void>;
    }
    b: {
        (options?: TransactionOptions): Promise<string>;
        batchCall: (batchObj: IBatchRequestObj, key: string, options?: TransactionOptions) => Promise<void>;
    }
    b2ns: {
        (param1:string, options?: TransactionOptions): Promise<{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}>;
        batchCall: (batchObj: IBatchRequestObj, key: string, param1:string, options?: TransactionOptions) => Promise<void>;
    }
    b32: {
        (options?: TransactionOptions): Promise<string>;
        batchCall: (batchObj: IBatchRequestObj, key: string, options?: TransactionOptions) => Promise<void>;
    }
    b32a: {
        (param1:number|BigNumber, options?: TransactionOptions): Promise<string>;
        batchCall: (batchObj: IBatchRequestObj, key: string, param1:number|BigNumber, options?: TransactionOptions) => Promise<void>;
    }
    ba: {
        (param1:number|BigNumber, options?: TransactionOptions): Promise<string>;
        batchCall: (batchObj: IBatchRequestObj, key: string, param1:number|BigNumber, options?: TransactionOptions) => Promise<void>;
    }
    i256: {
        (options?: TransactionOptions): Promise<BigNumber>;
        batchCall: (batchObj: IBatchRequestObj, key: string, options?: TransactionOptions) => Promise<void>;
    }
    i256a: {
        (param1:number|BigNumber, options?: TransactionOptions): Promise<BigNumber>;
        batchCall: (batchObj: IBatchRequestObj, key: string, param1:number|BigNumber, options?: TransactionOptions) => Promise<void>;
    }
    i2as: {
        (i:number|BigNumber, options?: TransactionOptions): Promise<{i256a:BigNumber[],ui256a:BigNumber[],b32a:string[],ba:string[],sa:string[]}>;
        batchCall: (batchObj: IBatchRequestObj, key: string, i:number|BigNumber, options?: TransactionOptions) => Promise<void>;
    }
    i2ss: {
        (param1:number|BigNumber, options?: TransactionOptions): Promise<{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}>;
        batchCall: (batchObj: IBatchRequestObj, key: string, param1:number|BigNumber, options?: TransactionOptions) => Promise<void>;
    }
    pay: {
        (to:string, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt>;
        call: (to:string, options?: number|BigNumber|TransactionOptions) => Promise<BigNumber>;
        batchCall: (batchObj: IBatchRequestObj, key: string, to:string, options?: number|BigNumber|TransactionOptions) => Promise<void>;
    }
    pay_1: {
        (options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt>;
        call: (options?: number|BigNumber|TransactionOptions) => Promise<BigNumber>;
        batchCall: (batchObj: IBatchRequestObj, key: string, options?: number|BigNumber|TransactionOptions) => Promise<void>;
    }
    pay_2: {
        (params: IPay_2Params, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt>;
        call: (params: IPay_2Params, options?: number|BigNumber|TransactionOptions) => Promise<BigNumber>;
        batchCall: (batchObj: IBatchRequestObj, key: string, params: IPay_2Params, options?: number|BigNumber|TransactionOptions) => Promise<void>;
    }
    pow: {
        (params: IPowParams, options?: TransactionOptions): Promise<BigNumber>;
        batchCall: (batchObj: IBatchRequestObj, key: string, params: IPowParams, options?: TransactionOptions) => Promise<void>;
    }
    s: {
        (options?: TransactionOptions): Promise<string>;
        batchCall: (batchObj: IBatchRequestObj, key: string, options?: TransactionOptions) => Promise<void>;
    }
    s2nsa: {
        (params: IS2nsaParams, options?: TransactionOptions): Promise<{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}>;
        batchCall: (batchObj: IBatchRequestObj, key: string, params: IS2nsaParams, options?: TransactionOptions) => Promise<void>;
    }
    sa: {
        (param1:number|BigNumber, options?: TransactionOptions): Promise<string>;
        batchCall: (batchObj: IBatchRequestObj, key: string, param1:number|BigNumber, options?: TransactionOptions) => Promise<void>;
    }
    set: {
        (params: ISetParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: ISetParams, options?: TransactionOptions) => Promise<void>;
        batchCall: (batchObj: IBatchRequestObj, key: string, params: ISetParams, options?: TransactionOptions) => Promise<void>;
    }
    set_1: {
        (params: ISet_1Params, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: ISet_1Params, options?: TransactionOptions) => Promise<void>;
        batchCall: (batchObj: IBatchRequestObj, key: string, params: ISet_1Params, options?: TransactionOptions) => Promise<void>;
    }
    set_2: {
        (params: ISet_2Params, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: ISet_2Params, options?: TransactionOptions) => Promise<void>;
        batchCall: (batchObj: IBatchRequestObj, key: string, params: ISet_2Params, options?: TransactionOptions) => Promise<void>;
    }
    ui256: {
        (options?: TransactionOptions): Promise<BigNumber>;
        batchCall: (batchObj: IBatchRequestObj, key: string, options?: TransactionOptions) => Promise<void>;
    }
    ui256a: {
        (param1:number|BigNumber, options?: TransactionOptions): Promise<BigNumber>;
        batchCall: (batchObj: IBatchRequestObj, key: string, param1:number|BigNumber, options?: TransactionOptions) => Promise<void>;
    }
    private assign(){
        let PI_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('PI',[],options);
            return new BigNumber(result);
        }
        let PI_batchCall = async (batchObj: IBatchRequestObj, key: string, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'PI',[],options);
        }
        this.PI = Object.assign(PI_call, {
            batchCall:PI_batchCall
        });
        let b_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('b',[],options);
            return result;
        }
        let b_batchCall = async (batchObj: IBatchRequestObj, key: string, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'b',[],options);
        }
        this.b = Object.assign(b_call, {
            batchCall:b_batchCall
        });
        let b2ns_call = async (param1:string, options?: TransactionOptions): Promise<{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}> => {
            let result = await this.call('b2ns',[this.wallet.utils.stringToBytes32(param1)],options);
            return (
            {
                i256: new BigNumber(result.i256),
                ui256: new BigNumber(result.ui256),
                b32: result.b32,
                b: result.b,
                s: result.s
            }
            );
        }
        let b2ns_batchCall = async (batchObj: IBatchRequestObj, key: string, param1:string, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'b2ns',[this.wallet.utils.stringToBytes32(param1)],options);
        }
        this.b2ns = Object.assign(b2ns_call, {
            batchCall:b2ns_batchCall
        });
        let b32_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('b32',[],options);
            return result;
        }
        let b32_batchCall = async (batchObj: IBatchRequestObj, key: string, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'b32',[],options);
        }
        this.b32 = Object.assign(b32_call, {
            batchCall:b32_batchCall
        });
        let b32a_call = async (param1:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.call('b32a',[this.wallet.utils.toString(param1)],options);
            return result;
        }
        let b32a_batchCall = async (batchObj: IBatchRequestObj, key: string, param1:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'b32a',[this.wallet.utils.toString(param1)],options);
        }
        this.b32a = Object.assign(b32a_call, {
            batchCall:b32a_batchCall
        });
        let ba_call = async (param1:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.call('ba',[this.wallet.utils.toString(param1)],options);
            return result;
        }
        let ba_batchCall = async (batchObj: IBatchRequestObj, key: string, param1:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'ba',[this.wallet.utils.toString(param1)],options);
        }
        this.ba = Object.assign(ba_call, {
            batchCall:ba_batchCall
        });
        let i256_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('i256',[],options);
            return new BigNumber(result);
        }
        let i256_batchCall = async (batchObj: IBatchRequestObj, key: string, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'i256',[],options);
        }
        this.i256 = Object.assign(i256_call, {
            batchCall:i256_batchCall
        });
        let i256a_call = async (param1:number|BigNumber, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('i256a',[this.wallet.utils.toString(param1)],options);
            return new BigNumber(result);
        }
        let i256a_batchCall = async (batchObj: IBatchRequestObj, key: string, param1:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'i256a',[this.wallet.utils.toString(param1)],options);
        }
        this.i256a = Object.assign(i256a_call, {
            batchCall:i256a_batchCall
        });
        let i2as_call = async (i:number|BigNumber, options?: TransactionOptions): Promise<{i256a:BigNumber[],ui256a:BigNumber[],b32a:string[],ba:string[],sa:string[]}> => {
            let result = await this.call('i2as',[this.wallet.utils.toString(i)],options);
            return (
            {
                i256a: result.i256a.map(e=>new BigNumber(e)),
                ui256a: result.ui256a.map(e=>new BigNumber(e)),
                b32a: result.b32a,
                ba: result.ba,
                sa: result.sa
            }
            );
        }
        let i2as_batchCall = async (batchObj: IBatchRequestObj, key: string, i:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'i2as',[this.wallet.utils.toString(i)],options);
        }
        this.i2as = Object.assign(i2as_call, {
            batchCall:i2as_batchCall
        });
        let i2ss_call = async (param1:number|BigNumber, options?: TransactionOptions): Promise<{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}> => {
            let result = await this.call('i2ss',[this.wallet.utils.toString(param1)],options);
            return {
                i256: new BigNumber(result.i256),
                ui256: new BigNumber(result.ui256),
                b32: result.b32,
                b: result.b,
                s: result.s
            };
        }
        let i2ss_batchCall = async (batchObj: IBatchRequestObj, key: string, param1:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'i2ss',[this.wallet.utils.toString(param1)],options);
        }
        this.i2ss = Object.assign(i2ss_call, {
            batchCall:i2ss_batchCall
        });
        let powParams = (params: IPowParams) => [this.wallet.utils.toString(params.x),this.wallet.utils.toString(params.n)];
        let pow_call = async (params: IPowParams, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('pow',powParams(params),options);
            return new BigNumber(result);
        }
        let pow_batchCall = async (batchObj: IBatchRequestObj, key: string, params: IPowParams, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'pow',powParams(params),options);
        }
        this.pow = Object.assign(pow_call, {
            batchCall:pow_batchCall
        });
        let s_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('s',[],options);
            return result;
        }
        let s_batchCall = async (batchObj: IBatchRequestObj, key: string, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 's',[],options);
        }
        this.s = Object.assign(s_call, {
            batchCall:s_batchCall
        });
        let s2nsaParams = (params: IS2nsaParams) => [params.param1,this.wallet.utils.toString(params.param2)];
        let s2nsa_call = async (params: IS2nsaParams, options?: TransactionOptions): Promise<{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}> => {
            let result = await this.call('s2nsa',s2nsaParams(params),options);
            return (
            {
                i256: new BigNumber(result.i256),
                ui256: new BigNumber(result.ui256),
                b32: result.b32,
                b: result.b,
                s: result.s
            }
            );
        }
        let s2nsa_batchCall = async (batchObj: IBatchRequestObj, key: string, params: IS2nsaParams, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 's2nsa',s2nsaParams(params),options);
        }
        this.s2nsa = Object.assign(s2nsa_call, {
            batchCall:s2nsa_batchCall
        });
        let sa_call = async (param1:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.call('sa',[this.wallet.utils.toString(param1)],options);
            return result;
        }
        let sa_batchCall = async (batchObj: IBatchRequestObj, key: string, param1:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'sa',[this.wallet.utils.toString(param1)],options);
        }
        this.sa = Object.assign(sa_call, {
            batchCall:sa_batchCall
        });
        let ui256_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('ui256',[],options);
            return new BigNumber(result);
        }
        let ui256_batchCall = async (batchObj: IBatchRequestObj, key: string, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'ui256',[],options);
        }
        this.ui256 = Object.assign(ui256_call, {
            batchCall:ui256_batchCall
        });
        let ui256a_call = async (param1:number|BigNumber, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('ui256a',[this.wallet.utils.toString(param1)],options);
            return new BigNumber(result);
        }
        let ui256a_batchCall = async (batchObj: IBatchRequestObj, key: string, param1:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'ui256a',[this.wallet.utils.toString(param1)],options);
        }
        this.ui256a = Object.assign(ui256a_call, {
            batchCall:ui256a_batchCall
        });
        let pay_send = async (to:string, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('pay',[to],options);
            return result;
        }
        let pay_call = async (to:string, options?: number|BigNumber|TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('pay',[to],options);
            return new BigNumber(result);
        }
        let pay_batchCall = async (batchObj: IBatchRequestObj, key: string, to:string, options?: number|BigNumber|TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'pay',[to],options);
        }
        this.pay = Object.assign(pay_send, {
            call:pay_call
            , batchCall:pay_batchCall
        });
        let pay_1_send = async (options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('pay',[],options);
            return result;
        }
        let pay_1_call = async (options?: number|BigNumber|TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('pay',[],options);
            return new BigNumber(result);
        }
        let pay_1_batchCall = async (batchObj: IBatchRequestObj, key: string, options?: number|BigNumber|TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'pay',[],options);
        }
        this.pay_1 = Object.assign(pay_1_send, {
            call:pay_1_call
            , batchCall:pay_1_batchCall
        });
        let pay_2Params = (params: IPay_2Params) => [params.to,this.wallet.utils.toString(params.amount)];
        let pay_2_send = async (params: IPay_2Params, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('pay',pay_2Params(params),options);
            return result;
        }
        let pay_2_call = async (params: IPay_2Params, options?: number|BigNumber|TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('pay',pay_2Params(params),options);
            return new BigNumber(result);
        }
        let pay_2_batchCall = async (batchObj: IBatchRequestObj, key: string, params: IPay_2Params, options?: number|BigNumber|TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'pay',pay_2Params(params),options);
        }
        this.pay_2 = Object.assign(pay_2_send, {
            call:pay_2_call
            , batchCall:pay_2_batchCall
        });
        let setParams = (params: ISetParams) => [this.wallet.utils.stringToBytes32(params.b),[[this.wallet.utils.toString(params.ns.ss.i256),this.wallet.utils.toString(params.ns.ss.ui256),this.wallet.utils.stringToBytes32(params.ns.ss.b32),this.wallet.utils.stringToBytes(params.ns.ss.b),params.ns.ss.s]]];
        let set_send = async (params: ISetParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('set',setParams(params),options);
            return result;
        }
        let set_call = async (params: ISetParams, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('set',setParams(params),options);
            return;
        }
        let set_batchCall = async (batchObj: IBatchRequestObj, key: string, params: ISetParams, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'set',setParams(params),options);
        }
        this.set = Object.assign(set_send, {
            call:set_call
            , batchCall:set_batchCall
        });
        let set_1Params = (params: ISet_1Params) => [this.wallet.utils.toString(params.i),[this.wallet.utils.toString(params.ss.i256),this.wallet.utils.toString(params.ss.ui256),this.wallet.utils.stringToBytes32(params.ss.b32),this.wallet.utils.stringToBytes(params.ss.b),params.ss.s]];
        let set_1_send = async (params: ISet_1Params, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('set',set_1Params(params),options);
            return result;
        }
        let set_1_call = async (params: ISet_1Params, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('set',set_1Params(params),options);
            return;
        }
        let set_1_batchCall = async (batchObj: IBatchRequestObj, key: string, params: ISet_1Params, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'set',set_1Params(params),options);
        }
        this.set_1 = Object.assign(set_1_send, {
            call:set_1_call
            , batchCall:set_1_batchCall
        });
        let set_2Params = (params: ISet_2Params) => [params.s,params.nsa.map(e=>([[this.wallet.utils.toString(e.ss.i256),this.wallet.utils.toString(e.ss.ui256),this.wallet.utils.stringToBytes32(e.ss.b32),this.wallet.utils.stringToBytes(e.ss.b),e.ss.s]]))];
        let set_2_send = async (params: ISet_2Params, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('set',set_2Params(params),options);
            return result;
        }
        let set_2_call = async (params: ISet_2Params, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('set',set_2Params(params),options);
            return;
        }
        let set_2_batchCall = async (batchObj: IBatchRequestObj, key: string, params: ISet_2Params, options?: TransactionOptions): Promise<void> => {
            await this.batchCall(batchObj, key, 'set',set_2Params(params),options);
        }
        this.set_2 = Object.assign(set_2_send, {
            call:set_2_call
            , batchCall:set_2_batchCall
        });
    }
}
export module Contract{
    export interface Set1Event {i:BigNumber,ss:{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string},_event:Event}
    export interface Set2Event {b:string,ns:{ss:{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}},_event:Event}
    export interface Set3Event {s:string,nsa:{ss:{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}}[],_event:Event}
}