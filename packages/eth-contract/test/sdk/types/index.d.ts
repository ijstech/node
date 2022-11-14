/// <amd-module name="@demo/sdk/contracts/ERC20.json.ts" />
declare module "@demo/sdk/contracts/ERC20.json.ts" {
    const _default: {
        abi: ({
            anonymous: boolean;
            inputs: {
                indexed: boolean;
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            type: string;
            outputs?: undefined;
            stateMutability?: undefined;
        } | {
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        })[];
        bytecode: string;
    };
    export default _default;
}
/// <amd-module name="@demo/sdk/contracts/ERC20.ts" />
declare module "@demo/sdk/contracts/ERC20.ts" {
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
    export class ERC20 extends Contract {
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
    export module ERC20 {
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
}
/// <amd-module name="@demo/sdk/contracts/index.ts" />
declare module "@demo/sdk/contracts/index.ts" {
    export { ERC20 } from "@demo/sdk/contracts/ERC20.ts";
}
/// <amd-module name="@demo/sdk" />
declare module "@demo/sdk" {
    import * as Contracts from "@demo/sdk/contracts/index.ts";
    export default Contracts;
}
