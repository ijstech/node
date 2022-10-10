"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    deploy() {
        return this.__deploy();
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
        let allowance_call = (params) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.call('allowance', allowanceParams(params));
            return new eth_contract_1.BigNumber(result);
        });
        this.allowance = allowance_call;
        let balanceOf_call = (param1) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.call('balanceOf', [param1]);
            return new eth_contract_1.BigNumber(result);
        });
        this.balanceOf = balanceOf_call;
        let decimals_call = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.call('decimals');
            return new eth_contract_1.BigNumber(result);
        });
        this.decimals = decimals_call;
        let name_call = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.call('name');
            return result;
        });
        this.name = name_call;
        let symbol_call = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.call('symbol');
            return result;
        });
        this.symbol = symbol_call;
        let totalSupply_call = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.call('totalSupply');
            return new eth_contract_1.BigNumber(result);
        });
        this.totalSupply = totalSupply_call;
        let approveParams = (params) => [params.spender, this.wallet.utils.toString(params.amount)];
        let approve_send = (params) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.send('approve', approveParams(params));
            return result;
        });
        let approve_call = (params) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.call('approve', approveParams(params));
            return result;
        });
        this.approve = Object.assign(approve_send, {
            call: approve_call
        });
        let burn_send = (amount) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.send('burn', [this.wallet.utils.toString(amount)]);
            return result;
        });
        let burn_call = (amount) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.call('burn', [this.wallet.utils.toString(amount)]);
            return;
        });
        this.burn = Object.assign(burn_send, {
            call: burn_call
        });
        let mint_send = (amount) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.send('mint', [this.wallet.utils.toString(amount)]);
            return result;
        });
        let mint_call = (amount) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.call('mint', [this.wallet.utils.toString(amount)]);
            return;
        });
        this.mint = Object.assign(mint_send, {
            call: mint_call
        });
        let transferParams = (params) => [params.recipient, this.wallet.utils.toString(params.amount)];
        let transfer_send = (params) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.send('transfer', transferParams(params));
            return result;
        });
        let transfer_call = (params) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.call('transfer', transferParams(params));
            return result;
        });
        this.transfer = Object.assign(transfer_send, {
            call: transfer_call
        });
        let transferFromParams = (params) => [params.sender, params.recipient, this.wallet.utils.toString(params.amount)];
        let transferFrom_send = (params) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.send('transferFrom', transferFromParams(params));
            return result;
        });
        let transferFrom_call = (params) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.call('transferFrom', transferFromParams(params));
            return result;
        });
        this.transferFrom = Object.assign(transferFrom_send, {
            call: transferFrom_call
        });
    }
}
exports.ERC20 = ERC20;
