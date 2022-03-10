import {IWallet, Contract, TransactionReceipt, BigNumber, Event} from "@ijstech/eth-contract";
import Bin from "./erc20.json";

export class ERC20 extends Contract{
    constructor(wallet: IWallet, address?: string){
        super(wallet, address, Bin.abi, Bin.bytecode);
    }
    deploy(): Promise<string>{
        return this._deploy();
    }
    parseApprovalEvent(receipt: TransactionReceipt): ERC20.ApprovalEvent[]{
        return this.parseEvents(receipt, "Approval").map(e=>this.decodeApprovalEvent(e));
    }
    decodeApprovalEvent(event: Event): ERC20.ApprovalEvent{
        let result = event.data;
        return {
            owner: result.owner,
            spender: result.spender,
            value: new BigNumber(result.value),
            _event: event
        };
    }
    parseTransferEvent(receipt: TransactionReceipt): ERC20.TransferEvent[]{
        return this.parseEvents(receipt, "Transfer").map(e=>this.decodeTransferEvent(e));
    }
    decodeTransferEvent(event: Event): ERC20.TransferEvent{
        let result = event.data;
        return {
            from: result.from,
            to: result.to,
            value: new BigNumber(result.value),
            _event: event
        };
    }
    async EIP712_TYPEHASH(): Promise<string>{
        let result = await this.methods('EIP712_TYPEHASH');
        return result;
    }
    async NAME_HASH(): Promise<string>{
        let result = await this.methods('NAME_HASH');
        return result;
    }
    async PERMIT_TYPEHASH(): Promise<string>{
        let result = await this.methods('PERMIT_TYPEHASH');
        return result;
    }
    async VERSION_HASH(): Promise<string>{
        let result = await this.methods('VERSION_HASH');
        return result;
    }
    async allowance(params:{param1:string,param2:string}): Promise<BigNumber>{
        let result = await this.methods('allowance',params.param1,params.param2);
        return new BigNumber(result);
    }
    async approve(params:{spender:string,value:number|BigNumber}): Promise<TransactionReceipt>{
        let result = await this.methods('approve',params.spender,this.utils.toString(params.value));
        return result;
    }
    async balanceOf(param1:string): Promise<BigNumber>{
        let result = await this.methods('balanceOf',param1);
        return new BigNumber(result);
    }
    async decimals(): Promise<BigNumber>{
        let result = await this.methods('decimals');
        return new BigNumber(result);
    }
    async name(): Promise<string>{
        let result = await this.methods('name');
        return result;
    }
    async nonces(param1:string): Promise<BigNumber>{
        let result = await this.methods('nonces',param1);
        return new BigNumber(result);
    }
    async permit(params:{owner:string,spender:string,value:number|BigNumber,deadline:number|BigNumber,v:number|BigNumber,r:string,s:string}): Promise<TransactionReceipt>{
        let result = await this.methods('permit',params.owner,params.spender,this.utils.toString(params.value),this.utils.toString(params.deadline),this.utils.toString(params.v),this.utils.stringToBytes32(params.r),this.utils.stringToBytes32(params.s));
        return result;
    }
    async symbol(): Promise<string>{
        let result = await this.methods('symbol');
        return result;
    }
    async totalSupply(): Promise<BigNumber>{
        let result = await this.methods('totalSupply');
        return new BigNumber(result);
    }
    async transfer(params:{to:string,value:number|BigNumber}): Promise<TransactionReceipt>{
        let result = await this.methods('transfer',params.to,this.utils.toString(params.value));
        return result;
    }
    async transferFrom(params:{from:string,to:string,value:number|BigNumber}): Promise<TransactionReceipt>{
        let result = await this.methods('transferFrom',params.from,params.to,this.utils.toString(params.value));
        return result;
    }
}
export module ERC20{
    export interface ApprovalEvent {owner:string,spender:string,value:BigNumber,_event:Event}
    export interface TransferEvent {from:string,to:string,value:BigNumber,_event:Event}
}