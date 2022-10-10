import { IWallet, Contract, TransactionReceipt, BigNumber, Event } from "@ijstech/eth-contract";
export interface IAllowanceParams {
    param1: string;
    param2: string;
}
export interface IApproveParams {
    spender: string;
    amount: number | BigNumber;
}
export interface ITransferParams {
    recipient: string;
    amount: number | BigNumber;
}
export interface ITransferFromParams {
    sender: string;
    recipient: string;
    amount: number | BigNumber;
}
export declare class ERC20 extends Contract {
    constructor(wallet: IWallet, address?: string);
    deploy(): Promise<string>;
    parseApprovalEvent(receipt: TransactionReceipt): ERC20.ApprovalEvent[];
    decodeApprovalEvent(event: Event): ERC20.ApprovalEvent;
    parseTransferEvent(receipt: TransactionReceipt): ERC20.TransferEvent[];
    decodeTransferEvent(event: Event): ERC20.TransferEvent;
    allowance: {
        (params: IAllowanceParams): Promise<BigNumber>;
    };
    approve: {
        (params: IApproveParams): Promise<TransactionReceipt>;
        call: (params: IApproveParams) => Promise<boolean>;
    };
    balanceOf: {
        (param1: string): Promise<BigNumber>;
    };
    burn: {
        (amount: number | BigNumber): Promise<TransactionReceipt>;
        call: (amount: number | BigNumber) => Promise<void>;
    };
    decimals: {
        (): Promise<BigNumber>;
    };
    mint: {
        (amount: number | BigNumber): Promise<TransactionReceipt>;
        call: (amount: number | BigNumber) => Promise<void>;
    };
    name: {
        (): Promise<string>;
    };
    symbol: {
        (): Promise<string>;
    };
    totalSupply: {
        (): Promise<BigNumber>;
    };
    transfer: {
        (params: ITransferParams): Promise<TransactionReceipt>;
        call: (params: ITransferParams) => Promise<boolean>;
    };
    transferFrom: {
        (params: ITransferFromParams): Promise<TransactionReceipt>;
        call: (params: ITransferFromParams) => Promise<boolean>;
    };
    private assign;
}
export declare module ERC20 {
    interface ApprovalEvent {
        owner: string;
        spender: string;
        value: BigNumber;
        _event: Event;
    }
    interface TransferEvent {
        from: string;
        to: string;
        value: BigNumber;
        _event: Event;
    }
}
