"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC20 = void 0;
const eth_contract_1 = require("@ijstech/eth-contract");
const ERC20_json_1 = __importDefault(require("./ERC20.json"));
class ERC20 extends eth_contract_1.Contract {
    constructor(wallet, address) {
        super(wallet, address, ERC20_json_1.default.abi, ERC20_json_1.default.bytecode);
        this.assign();
    }
    deploy(options) {
        return this.__deploy([], options);
    }
    parseApprovalEvent(receipt) {
        return this.parseEvents(receipt, "Approval").map(e => this.decodeApprovalEvent(e));
    }
    decodeApprovalEvent(event) {
        let result = event.data;
        return {
            owner: result.owner,
            spender: result.spender,
            value: new eth_contract_1.BigNumber(result.value),
            _event: event
        };
    }
    parseTransferEvent(receipt) {
        return this.parseEvents(receipt, "Transfer").map(e => this.decodeTransferEvent(e));
    }
    decodeTransferEvent(event) {
        let result = event.data;
        return {
            from: result.from,
            to: result.to,
            value: new eth_contract_1.BigNumber(result.value),
            _event: event
        };
    }
    assign() {
        let allowanceParams = (params) => [params.param1, params.param2];
        let allowance_call = async (params, options) => {
            let result = await this.call('allowance', allowanceParams(params), options);
            return new eth_contract_1.BigNumber(result);
        };
        this.allowance = allowance_call;
        let balanceOf_call = async (param1, options) => {
            let result = await this.call('balanceOf', [param1], options);
            return new eth_contract_1.BigNumber(result);
        };
        this.balanceOf = balanceOf_call;
        let decimals_call = async (options) => {
            let result = await this.call('decimals', [], options);
            return new eth_contract_1.BigNumber(result);
        };
        this.decimals = decimals_call;
        let name_call = async (options) => {
            let result = await this.call('name', [], options);
            return result;
        };
        this.name = name_call;
        let symbol_call = async (options) => {
            let result = await this.call('symbol', [], options);
            return result;
        };
        this.symbol = symbol_call;
        let totalSupply_call = async (options) => {
            let result = await this.call('totalSupply', [], options);
            return new eth_contract_1.BigNumber(result);
        };
        this.totalSupply = totalSupply_call;
        let approveParams = (params) => [params.spender, this.wallet.utils.toString(params.amount)];
        let approve_send = async (params, options) => {
            let result = await this.send('approve', approveParams(params), options);
            return result;
        };
        let approve_call = async (params, options) => {
            let result = await this.call('approve', approveParams(params), options);
            return result;
        };
        let approve_txData = async (params, options) => {
            let result = await this.txData('approve', approveParams(params), options);
            return result;
        };
        this.approve = Object.assign(approve_send, {
            call: approve_call,
            txData: approve_txData
        });
        let burn_send = async (amount, options) => {
            let result = await this.send('burn', [this.wallet.utils.toString(amount)], options);
            return result;
        };
        let burn_call = async (amount, options) => {
            let result = await this.call('burn', [this.wallet.utils.toString(amount)], options);
            return;
        };
        let burn_txData = async (amount, options) => {
            let result = await this.txData('burn', [this.wallet.utils.toString(amount)], options);
            return result;
        };
        this.burn = Object.assign(burn_send, {
            call: burn_call,
            txData: burn_txData
        });
        let mint_send = async (amount, options) => {
            let result = await this.send('mint', [this.wallet.utils.toString(amount)], options);
            return result;
        };
        let mint_call = async (amount, options) => {
            let result = await this.call('mint', [this.wallet.utils.toString(amount)], options);
            return;
        };
        let mint_txData = async (amount, options) => {
            let result = await this.txData('mint', [this.wallet.utils.toString(amount)], options);
            return result;
        };
        this.mint = Object.assign(mint_send, {
            call: mint_call,
            txData: mint_txData
        });
        let transferParams = (params) => [params.recipient, this.wallet.utils.toString(params.amount)];
        let transfer_send = async (params, options) => {
            let result = await this.send('transfer', transferParams(params), options);
            return result;
        };
        let transfer_call = async (params, options) => {
            let result = await this.call('transfer', transferParams(params), options);
            return result;
        };
        let transfer_txData = async (params, options) => {
            let result = await this.txData('transfer', transferParams(params), options);
            return result;
        };
        this.transfer = Object.assign(transfer_send, {
            call: transfer_call,
            txData: transfer_txData
        });
        let transferFromParams = (params) => [params.sender, params.recipient, this.wallet.utils.toString(params.amount)];
        let transferFrom_send = async (params, options) => {
            let result = await this.send('transferFrom', transferFromParams(params), options);
            return result;
        };
        let transferFrom_call = async (params, options) => {
            let result = await this.call('transferFrom', transferFromParams(params), options);
            return result;
        };
        let transferFrom_txData = async (params, options) => {
            let result = await this.txData('transferFrom', transferFromParams(params), options);
            return result;
        };
        this.transferFrom = Object.assign(transferFrom_send, {
            call: transferFrom_call,
            txData: transferFrom_txData
        });
    }
}
exports.ERC20 = ERC20;
ERC20._abi = ERC20_json_1.default.abi;
