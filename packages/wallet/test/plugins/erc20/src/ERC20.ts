import {IWallet, Contract, TransactionReceipt, BigNumber, Event} from "@ijstech/eth-contract";
import Bin from "./ERC20.json";

export class ERC20 extends Contract{
    constructor(wallet: IWallet, address?: string){
        super(wallet, address, Bin.abi, Bin.bytecode);
    }
    deploy(params:{symbol:string,name:string,initialSupply:number|BigNumber,cap:number|BigNumber,decimals:number|BigNumber}): Promise<string>{
        return this._deploy(params.symbol,params.name,this.utils.toString(params.initialSupply),this.utils.toString(params.cap),this.utils.toString(params.decimals));
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
    parseAuthEvent(receipt: TransactionReceipt): ERC20.AuthEvent[]{
        return this.parseEvents(receipt, "Auth").map(e=>this.decodeAuthEvent(e));
    }
    decodeAuthEvent(event: Event): ERC20.AuthEvent{
        let result = event.data;
        return {
            account: result.account,
            auth: new BigNumber(result.auth),
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
    async burn(params:{account:string,value:number|BigNumber}): Promise<TransactionReceipt>{
        let result = await this.methods('burn',params.account,this.utils.toString(params.value));
        return result;
    }
    async cap(): Promise<BigNumber>{
        let result = await this.methods('cap');
        return new BigNumber(result);
    }
    async decimals(): Promise<BigNumber>{
        let result = await this.methods('decimals');
        return new BigNumber(result);
    }
    async decreaseAllowance(params:{spender:string,subtractedValue:number|BigNumber}): Promise<TransactionReceipt>{
        let result = await this.methods('decreaseAllowance',params.spender,this.utils.toString(params.subtractedValue));
        return result;
    }
    async deny(account:string): Promise<TransactionReceipt>{
        let result = await this.methods('deny',account);
        return result;
    }
    async increaseAllowance(params:{spender:string,addedValue:number|BigNumber}): Promise<TransactionReceipt>{
        let result = await this.methods('increaseAllowance',params.spender,this.utils.toString(params.addedValue));
        return result;
    }
    async mint(params:{account:string,value:number|BigNumber}): Promise<TransactionReceipt>{
        let result = await this.methods('mint',params.account,this.utils.toString(params.value));
        return result;
    }
    async name(): Promise<string>{
        let result = await this.methods('name');
        return result;
    }
    async owners(param1:string): Promise<BigNumber>{
        let result = await this.methods('owners',param1);
        return new BigNumber(result);
    }
    async rely(account:string): Promise<TransactionReceipt>{
        let result = await this.methods('rely',account);
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
    export interface AuthEvent {account:string,auth:BigNumber,_event:Event}
    export interface TransferEvent {from:string,to:string,value:BigNumber,_event:Event}
}