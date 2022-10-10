import {IWallet, Contract, Transaction, TransactionReceipt, BigNumber, Event, IBatchRequestObj} from "@ijstech/eth-contract";
import Bin from "./ERC20.json";

export interface IAllowanceParams {param1:string;param2:string}
export interface IApproveParams {spender:string;amount:number|BigNumber}
export interface ITransferParams {recipient:string;amount:number|BigNumber}
export interface ITransferFromParams {sender:string;recipient:string;amount:number|BigNumber}
export class ERC20 extends Contract{
    constructor(wallet: IWallet, address?: string){
        super(wallet, address, Bin.abi, Bin.bytecode);
        this.assign()
    }
    deploy(): Promise<string>{
        return this.__deploy();
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
    allowance: {
        (params: IAllowanceParams): Promise<BigNumber>;
    }
    approve: {
        (params: IApproveParams): Promise<TransactionReceipt>;
        call: (params: IApproveParams) => Promise<boolean>;
    }
    balanceOf: {
        (param1:string): Promise<BigNumber>;
    }
    burn: {
        (amount:number|BigNumber): Promise<TransactionReceipt>;
        call: (amount:number|BigNumber) => Promise<void>;
    }
    decimals: {
        (): Promise<BigNumber>;
    }
    mint: {
        (amount:number|BigNumber): Promise<TransactionReceipt>;
        call: (amount:number|BigNumber) => Promise<void>;
    }
    name: {
        (): Promise<string>;
    }
    symbol: {
        (): Promise<string>;
    }
    totalSupply: {
        (): Promise<BigNumber>;
    }
    transfer: {
        (params: ITransferParams): Promise<TransactionReceipt>;
        call: (params: ITransferParams) => Promise<boolean>;
    }
    transferFrom: {
        (params: ITransferFromParams): Promise<TransactionReceipt>;
        call: (params: ITransferFromParams) => Promise<boolean>;
    }
    private assign(){
        let allowanceParams = (params: IAllowanceParams) => [params.param1,params.param2];
        let allowance_call = async (params: IAllowanceParams): Promise<BigNumber> => {
            let result = await this.call('allowance',allowanceParams(params));
            return new BigNumber(result);
        }
        this.allowance = allowance_call
        let balanceOf_call = async (param1:string): Promise<BigNumber> => {
            let result = await this.call('balanceOf',[param1]);
            return new BigNumber(result);
        }
        this.balanceOf = balanceOf_call
        let decimals_call = async (): Promise<BigNumber> => {
            let result = await this.call('decimals');
            return new BigNumber(result);
        }
        this.decimals = decimals_call
        let name_call = async (): Promise<string> => {
            let result = await this.call('name');
            return result;
        }
        this.name = name_call
        let symbol_call = async (): Promise<string> => {
            let result = await this.call('symbol');
            return result;
        }
        this.symbol = symbol_call
        let totalSupply_call = async (): Promise<BigNumber> => {
            let result = await this.call('totalSupply');
            return new BigNumber(result);
        }
        this.totalSupply = totalSupply_call
        let approveParams = (params: IApproveParams) => [params.spender,this.wallet.utils.toString(params.amount)];
        let approve_send = async (params: IApproveParams): Promise<TransactionReceipt> => {
            let result = await this.send('approve',approveParams(params));
            return result;
        }
        let approve_call = async (params: IApproveParams): Promise<boolean> => {
            let result = await this.call('approve',approveParams(params));
            return result;
        }
        this.approve = Object.assign(approve_send, {
            call:approve_call
        });
        let burn_send = async (amount:number|BigNumber): Promise<TransactionReceipt> => {
            let result = await this.send('burn',[this.wallet.utils.toString(amount)]);
            return result;
        }
        let burn_call = async (amount:number|BigNumber): Promise<void> => {
            let result = await this.call('burn',[this.wallet.utils.toString(amount)]);
            return;
        }
        this.burn = Object.assign(burn_send, {
            call:burn_call
        });
        let mint_send = async (amount:number|BigNumber): Promise<TransactionReceipt> => {
            let result = await this.send('mint',[this.wallet.utils.toString(amount)]);
            return result;
        }
        let mint_call = async (amount:number|BigNumber): Promise<void> => {
            let result = await this.call('mint',[this.wallet.utils.toString(amount)]);
            return;
        }
        this.mint = Object.assign(mint_send, {
            call:mint_call
        });
        let transferParams = (params: ITransferParams) => [params.recipient,this.wallet.utils.toString(params.amount)];
        let transfer_send = async (params: ITransferParams): Promise<TransactionReceipt> => {
            let result = await this.send('transfer',transferParams(params));
            return result;
        }
        let transfer_call = async (params: ITransferParams): Promise<boolean> => {
            let result = await this.call('transfer',transferParams(params));
            return result;
        }
        this.transfer = Object.assign(transfer_send, {
            call:transfer_call
        });
        let transferFromParams = (params: ITransferFromParams) => [params.sender,params.recipient,this.wallet.utils.toString(params.amount)];
        let transferFrom_send = async (params: ITransferFromParams): Promise<TransactionReceipt> => {
            let result = await this.send('transferFrom',transferFromParams(params));
            return result;
        }
        let transferFrom_call = async (params: ITransferFromParams): Promise<boolean> => {
            let result = await this.call('transferFrom',transferFromParams(params));
            return result;
        }
        this.transferFrom = Object.assign(transferFrom_send, {
            call:transferFrom_call
        });
    }
}
export module ERC20{
    export interface ApprovalEvent {owner:string,spender:string,value:BigNumber,_event:Event}
    export interface TransferEvent {from:string,to:string,value:BigNumber,_event:Event}
}