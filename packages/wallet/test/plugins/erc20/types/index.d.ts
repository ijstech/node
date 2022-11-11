/// <amd-module name="erc20/ERC20.json.ts" />
declare module "erc20/ERC20.json.ts" {
    const _default: {
        abi: ({
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
            name?: undefined;
            outputs?: undefined;
        } | {
            anonymous: boolean;
            inputs: {
                indexed: boolean;
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            type: string;
            stateMutability?: undefined;
            outputs?: undefined;
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
/// <amd-module name="erc20/ERC20.ts" />
declare module "erc20/ERC20.ts" {
    import { IWallet, Contract, TransactionReceipt, BigNumber, Event } from "@ijstech/eth-contract";
    export interface IDeployParams {
        symbol: string;
        name: string;
        initialSupply: number | BigNumber;
        cap: number | BigNumber;
        decimals: number | BigNumber;
    }
    export interface IAllowanceParams {
        param1: string;
        param2: string;
    }
    export interface IApproveParams {
        spender: string;
        value: number | BigNumber;
    }
    export interface IBurnParams {
        account: string;
        value: number | BigNumber;
    }
    export interface IDecreaseAllowanceParams {
        spender: string;
        subtractedValue: number | BigNumber;
    }
    export interface IIncreaseAllowanceParams {
        spender: string;
        addedValue: number | BigNumber;
    }
    export interface IMintParams {
        account: string;
        value: number | BigNumber;
    }
    export interface ITransferParams {
        to: string;
        value: number | BigNumber;
    }
    export interface ITransferFromParams {
        from: string;
        to: string;
        value: number | BigNumber;
    }
    export class ERC20 extends Contract {
        constructor(wallet: IWallet, address?: string);
        deploy(params: IDeployParams): Promise<string>;
        parseApprovalEvent(receipt: TransactionReceipt): ERC20.ApprovalEvent[];
        decodeApprovalEvent(event: Event): ERC20.ApprovalEvent;
        parseAuthEvent(receipt: TransactionReceipt): ERC20.AuthEvent[];
        decodeAuthEvent(event: Event): ERC20.AuthEvent;
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
            (params: IBurnParams): Promise<TransactionReceipt>;
            call: (params: IBurnParams) => Promise<void>;
        };
        cap: {
            (): Promise<BigNumber>;
        };
        decimals: {
            (): Promise<BigNumber>;
        };
        decreaseAllowance: {
            (params: IDecreaseAllowanceParams): Promise<TransactionReceipt>;
            call: (params: IDecreaseAllowanceParams) => Promise<boolean>;
        };
        deny: {
            (account: string): Promise<TransactionReceipt>;
            call: (account: string) => Promise<void>;
        };
        increaseAllowance: {
            (params: IIncreaseAllowanceParams): Promise<TransactionReceipt>;
            call: (params: IIncreaseAllowanceParams) => Promise<boolean>;
        };
        mint: {
            (params: IMintParams): Promise<TransactionReceipt>;
            call: (params: IMintParams) => Promise<void>;
        };
        name: {
            (): Promise<string>;
        };
        owners: {
            (param1: string): Promise<BigNumber>;
        };
        rely: {
            (account: string): Promise<TransactionReceipt>;
            call: (account: string) => Promise<void>;
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
        interface AuthEvent {
            account: string;
            auth: BigNumber;
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
/// <amd-module name="erc20" />
declare module "erc20" {
    export { ERC20 } from "erc20/ERC20.ts";
}
