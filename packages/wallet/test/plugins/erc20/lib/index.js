define("erc20.json", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        "abi": [
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "Approval",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "from",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "Transfer",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "EIP712_TYPEHASH",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "NAME_HASH",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "PERMIT_TYPEHASH",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "VERSION_HASH",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "allowance",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "approve",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "balanceOf",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "decimals",
                "outputs": [
                    {
                        "internalType": "uint8",
                        "name": "",
                        "type": "uint8"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "name",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "nonces",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deadline",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint8",
                        "name": "v",
                        "type": "uint8"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "r",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "s",
                        "type": "bytes32"
                    }
                ],
                "name": "permit",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "symbol",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalSupply",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "transfer",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "from",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "transferFrom",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ],
        "bytecode": "608060405234801561001057600080fd5b50610c55806100206000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c8063313ce567116100975780639e4e7318116100665780639e4e7318146102c5578063a9059cbb146102cd578063d505accf14610306578063dd62ed3e14610366576100f5565b8063313ce5671461023957806370a08231146102575780637ecebe001461028a57806395d89b41146102bd576100f5565b806318160ddd116100d357806318160ddd146101de57806323b872dd146101e6578063253d2c7d1461022957806330adf81f14610231576100f5565b806304622c2e146100fa57806306fdde0314610114578063095ea7b314610191575b600080fd5b6101026103a1565b60408051918252519081900360200190f35b61011c6103c5565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561015657818101518382015260200161013e565b50505050905090810190601f1680156101835780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101ca600480360360408110156101a757600080fd5b5073ffffffffffffffffffffffffffffffffffffffff81351690602001356103fe565b604080519115158252519081900360200190f35b610102610414565b6101ca600480360360608110156101fc57600080fd5b5073ffffffffffffffffffffffffffffffffffffffff81358116916020810135909116906040013561041a565b6101026104f9565b61010261051d565b610241610541565b6040805160ff9092168252519081900360200190f35b6101026004803603602081101561026d57600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16610546565b610102600480360360208110156102a057600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16610558565b61011c61056a565b6101026105a3565b6101ca600480360360408110156102e357600080fd5b5073ffffffffffffffffffffffffffffffffffffffff81351690602001356105c7565b610364600480360360e081101561031c57600080fd5b5073ffffffffffffffffffffffffffffffffffffffff813581169160208101359091169060408101359060608101359060ff6080820135169060a08101359060c001356105d4565b005b6101026004803603604081101561037c57600080fd5b5073ffffffffffffffffffffffffffffffffffffffff81358116916020013516610944565b7fccf0ed8d136d82190c405c1be2cf07fff31d482a66996af4f69b3259174a23ba81565b6040518060400160405280600c81526020017f4f70656e53776170204c5073000000000000000000000000000000000000000081525081565b600061040b338484610961565b50600192915050565b60005481565b73ffffffffffffffffffffffffffffffffffffffff831660009081526002602090815260408083203384529091528120547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff146104e45773ffffffffffffffffffffffffffffffffffffffff841660009081526002602090815260408083203384529091529020546104b2908363ffffffff6109d016565b73ffffffffffffffffffffffffffffffffffffffff851660009081526002602090815260408083203384529091529020555b6104ef848484610a19565b5060019392505050565b7f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f81565b7f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c981565b601281565b60016020526000908152604090205481565b60036020526000908152604090205481565b6040518060400160405280600881526020017f4f535741502d4c5000000000000000000000000000000000000000000000000081525081565b7fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc681565b600061040b338484610a19565b4284101561064357604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600760248201527f4558504952454400000000000000000000000000000000000000000000000000604482015290519081900360640190fd5b604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f6020808301919091527fccf0ed8d136d82190c405c1be2cf07fff31d482a66996af4f69b3259174a23ba828401527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608301524660808301523060a0808401919091528351808403909101815260c08301845280519082012073ffffffffffffffffffffffffffffffffffffffff8b8116600081815260038552868120805460018082019092557f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c960e0890152610100880193909352928d1661012087015261014086018c90526101608601919091526101808086018b9052865180870390910181526101a0860187528051908501207f19010000000000000000000000000000000000000000000000000000000000006101c08701526101c286018490526101e28087019190915286518087039091018152610202860180885281519186019190912090829052610222860180885281905260ff8a16610242870152610262860189905261028286018890529551929594909391926102a280830193927fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08301929081900390910190855afa158015610847573d6000803e3d6000fd5b50506040517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0015191505073ffffffffffffffffffffffffffffffffffffffff8116158015906108c257508973ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16145b61092d57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601160248201527f494e56414c49445f5349474e4154555245000000000000000000000000000000604482015290519081900360640190fd5b6109388a8a8a610961565b50505050505050505050565b600260209081526000928352604080842090915290825290205481565b73ffffffffffffffffffffffffffffffffffffffff808416600081815260026020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b6000610a1283836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250610afa565b9392505050565b73ffffffffffffffffffffffffffffffffffffffff8316600090815260016020526040902054610a4f908263ffffffff6109d016565b73ffffffffffffffffffffffffffffffffffffffff8085166000908152600160205260408082209390935590841681522054610a91908263ffffffff610bab16565b73ffffffffffffffffffffffffffffffffffffffff80841660008181526001602090815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b60008184841115610ba3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015610b68578181015183820152602001610b50565b50505050905090810190601f168015610b955780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b505050900390565b600082820183811015610a1257604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fdfea264697066735822122096db91cc4abeafe9715515fe37e334f2a0e94e86a23f845259aae562ffd5183e64736f6c634300060b0033"
    };
});
define("index", ["require", "exports", "@ijstech/eth-wallet"], function (require, exports, eth_wallet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ERC20 = void 0;
    const Bin = require("./ERC20.json");
    class ERC20 extends eth_wallet_1.Contract {
        constructor(wallet, address) {
            super(wallet, address, Bin.abi, Bin.bytecode);
        }
        deploy() {
            return this._deploy();
        }
        parseApprovalEvent(receipt) {
            return this.parseEvents(receipt, "Approval").map(e => this.decodeApprovalEvent(e));
        }
        decodeApprovalEvent(event) {
            let result = event.data;
            return {
                owner: result.owner,
                spender: result.spender,
                value: new eth_wallet_1.BigNumber(result.value),
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
                value: new eth_wallet_1.BigNumber(result.value),
                _event: event
            };
        }
        async EIP712_TYPEHASH() {
            let result = await this.methods('EIP712_TYPEHASH');
            return result;
        }
        async NAME_HASH() {
            let result = await this.methods('NAME_HASH');
            return result;
        }
        async PERMIT_TYPEHASH() {
            let result = await this.methods('PERMIT_TYPEHASH');
            return result;
        }
        async VERSION_HASH() {
            let result = await this.methods('VERSION_HASH');
            return result;
        }
        async allowance(params) {
            let result = await this.methods('allowance', params.param1, params.param2);
            return new eth_wallet_1.BigNumber(result);
        }
        async approve(params) {
            let result = await this.methods('approve', params.spender, eth_wallet_1.Utils.toString(params.value));
            return result;
        }
        async balanceOf(param1) {
            let result = await this.methods('balanceOf', param1);
            return new eth_wallet_1.BigNumber(result);
        }
        async decimals() {
            let result = await this.methods('decimals');
            return new eth_wallet_1.BigNumber(result);
        }
        async name() {
            let result = await this.methods('name');
            return result;
        }
        async nonces(param1) {
            let result = await this.methods('nonces', param1);
            return new eth_wallet_1.BigNumber(result);
        }
        async permit(params) {
            let result = await this.methods('permit', params.owner, params.spender, eth_wallet_1.Utils.toString(params.value), eth_wallet_1.Utils.toString(params.deadline), eth_wallet_1.Utils.toString(params.v), eth_wallet_1.Utils.stringToBytes32(params.r), eth_wallet_1.Utils.stringToBytes32(params.s));
            return result;
        }
        async symbol() {
            let result = await this.methods('symbol');
            return result;
        }
        async totalSupply() {
            let result = await this.methods('totalSupply');
            return new eth_wallet_1.BigNumber(result);
        }
        async transfer(params) {
            let result = await this.methods('transfer', params.to, eth_wallet_1.Utils.toString(params.value));
            return result;
        }
        async transferFrom(params) {
            let result = await this.methods('transferFrom', params.from, params.to, eth_wallet_1.Utils.toString(params.value));
            return result;
        }
    }
    exports.ERC20 = ERC20;
});
