import {IWallet, Contract as _Contract, Transaction, TransactionReceipt, BigNumber, Event, IBatchRequestObj, TransactionOptions} from "@ijstech/eth-contract";
import Bin from "./Interface.json";
export interface IS2nsaParams {s:string;index:number|BigNumber}
export interface ISetParams {b:string;ns:{ss:{i256:number|BigNumber,ui256:number|BigNumber,b32:string,b:string,s:string}}}
export interface ISet_1Params {i:number|BigNumber;ss:{i256:number|BigNumber,ui256:number|BigNumber,b32:string,b:string,s:string}}
export interface ISet_2Params {s:string;nsa:{ss:{i256:number|BigNumber,ui256:number|BigNumber,b32:string,b:string,s:string}}[]}
export class Interface extends _Contract{
    static _abi: any = Bin.abi;
    constructor(wallet: IWallet, address?: string){
        super(wallet, address, Bin.abi, undefined);
        this.assign()
    }
    parseSet1Event(receipt: TransactionReceipt): Interface.Set1Event[]{
        return this.parseEvents(receipt, "Set1").map(e=>this.decodeSet1Event(e));
    }
    decodeSet1Event(event: Event): Interface.Set1Event{
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
    parseSet2Event(receipt: TransactionReceipt): Interface.Set2Event[]{
        return this.parseEvents(receipt, "Set2").map(e=>this.decodeSet2Event(e));
    }
    decodeSet2Event(event: Event): Interface.Set2Event{
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
    parseSet3Event(receipt: TransactionReceipt): Interface.Set3Event[]{
        return this.parseEvents(receipt, "Set3").map(e=>this.decodeSet3Event(e));
    }
    decodeSet3Event(event: Event): Interface.Set3Event{
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
    b: {
        (options?: TransactionOptions): Promise<string>;
    }
    b2ns: {
        (b:string, options?: TransactionOptions): Promise<{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}>;
    }
    b32: {
        (options?: TransactionOptions): Promise<string>;
    }
    b32a: {
        (index:number|BigNumber, options?: TransactionOptions): Promise<string>;
    }
    ba: {
        (index:number|BigNumber, options?: TransactionOptions): Promise<string>;
    }
    i256: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    i256a: {
        (index:number|BigNumber, options?: TransactionOptions): Promise<BigNumber>;
    }
    i2ss: {
        (i:number|BigNumber, options?: TransactionOptions): Promise<{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}>;
    }
    s: {
        (options?: TransactionOptions): Promise<string>;
    }
    s2nsa: {
        (params: IS2nsaParams, options?: TransactionOptions): Promise<{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}>;
    }
    sa: {
        (index:number|BigNumber, options?: TransactionOptions): Promise<string>;
    }
    set: {
        (params: ISetParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: ISetParams, options?: TransactionOptions) => Promise<void>;
    }
    set_1: {
        (params: ISet_1Params, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: ISet_1Params, options?: TransactionOptions) => Promise<void>;
    }
    set_2: {
        (params: ISet_2Params, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: ISet_2Params, options?: TransactionOptions) => Promise<void>;
    }
    ui256: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    ui256a: {
        (index:number|BigNumber, options?: TransactionOptions): Promise<BigNumber>;
    }
    private assign(){
        let b_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('b',[],options);
            return result;
        }
        this.b = b_call
        let b2ns_call = async (b:string, options?: TransactionOptions): Promise<{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}> => {
            let result = await this.call('b2ns',[this.wallet.utils.stringToBytes32(b)],options);
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
        this.b2ns = b2ns_call
        let b32_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('b32',[],options);
            return result;
        }
        this.b32 = b32_call
        let b32a_call = async (index:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.call('b32a',[this.wallet.utils.toString(index)],options);
            return result;
        }
        this.b32a = b32a_call
        let ba_call = async (index:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.call('ba',[this.wallet.utils.toString(index)],options);
            return result;
        }
        this.ba = ba_call
        let i256_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('i256',[],options);
            return new BigNumber(result);
        }
        this.i256 = i256_call
        let i256a_call = async (index:number|BigNumber, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('i256a',[this.wallet.utils.toString(index)],options);
            return new BigNumber(result);
        }
        this.i256a = i256a_call
        let i2ss_call = async (i:number|BigNumber, options?: TransactionOptions): Promise<{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}> => {
            let result = await this.call('i2ss',[this.wallet.utils.toString(i)],options);
            return {
                i256: new BigNumber(result.i256),
                ui256: new BigNumber(result.ui256),
                b32: result.b32,
                b: result.b,
                s: result.s
            };
        }
        this.i2ss = i2ss_call
        let s_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('s',[],options);
            return result;
        }
        this.s = s_call
        let s2nsaParams = (params: IS2nsaParams) => [params.s,this.wallet.utils.toString(params.index)];
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
        this.s2nsa = s2nsa_call
        let sa_call = async (index:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.call('sa',[this.wallet.utils.toString(index)],options);
            return result;
        }
        this.sa = sa_call
        let ui256_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('ui256',[],options);
            return new BigNumber(result);
        }
        this.ui256 = ui256_call
        let ui256a_call = async (index:number|BigNumber, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('ui256a',[this.wallet.utils.toString(index)],options);
            return new BigNumber(result);
        }
        this.ui256a = ui256a_call
        let setParams = (params: ISetParams) => [this.wallet.utils.stringToBytes32(params.b),[[this.wallet.utils.toString(params.ns.ss.i256),this.wallet.utils.toString(params.ns.ss.ui256),this.wallet.utils.stringToBytes32(params.ns.ss.b32),this.wallet.utils.stringToBytes(params.ns.ss.b),params.ns.ss.s]]];
        let set_send = async (params: ISetParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('set',setParams(params),options);
            return result;
        }
        let set_call = async (params: ISetParams, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('set',setParams(params),options);
            return;
        }
        this.set = Object.assign(set_send, {
            call:set_call
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
        this.set_1 = Object.assign(set_1_send, {
            call:set_1_call
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
        this.set_2 = Object.assign(set_2_send, {
            call:set_2_call
        });
    }
}
export module Interface{
    export interface Set1Event {i:BigNumber,ss:{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string},_event:Event}
    export interface Set2Event {b:string,ns:{ss:{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}},_event:Event}
    export interface Set3Event {s:string,nsa:{ss:{i256:BigNumber,ui256:BigNumber,b32:string,b:string,s:string}}[],_event:Event}
}