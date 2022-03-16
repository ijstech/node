var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("ERC20.json", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        "abi": [
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_symbol",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_initialSupply",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_cap",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint8",
                        "name": "_decimals",
                        "type": "uint8"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
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
                        "name": "account",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "auth",
                        "type": "uint256"
                    }
                ],
                "name": "Auth",
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
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "burn",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "cap",
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
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "subtractedValue",
                        "type": "uint256"
                    }
                ],
                "name": "decreaseAllowance",
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
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "deny",
                "outputs": [],
                "stateMutability": "nonpayable",
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
                        "name": "addedValue",
                        "type": "uint256"
                    }
                ],
                "name": "increaseAllowance",
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
                        "name": "account",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "mint",
                "outputs": [],
                "stateMutability": "nonpayable",
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
                "name": "owners",
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
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "rely",
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
        "bytecode": "60a06040523480156200001157600080fd5b50604051620015d5380380620015d5833981810160405260a08110156200003757600080fd5b81019080805160405193929190846401000000008211156200005857600080fd5b9083019060208201858111156200006e57600080fd5b82516401000000008111828201881017156200008957600080fd5b82525081516020918201929091019080838360005b83811015620000b85781810151838201526020016200009e565b50505050905090810190601f168015620000e65780820380516001836020036101000a031916815260200191505b50604052602001805160405193929190846401000000008211156200010a57600080fd5b9083019060208201858111156200012057600080fd5b82516401000000008111828201881017156200013b57600080fd5b82525081516020918201929091019080838360005b838110156200016a57818101518382015260200162000150565b50505050905090810190601f168015620001985780820380516001836020036101000a031916815260200191505b506040818152602083810151848301516060909501513360008181528085528590206001908190558652935191975094955091927f881ab8a22f316bf86588be8193257d22bb9209d2b24689ab26fbd3be12b10b05929081900390910190a284516200020c90600190602088019062000272565b5083516200022290600290602087019062000272565b5060039190915560068290553360009081526004602052604090209190915560f81b7fff000000000000000000000000000000000000000000000000000000000000001660805250620003179050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620002b557805160ff1916838001178555620002e5565b82800160010185558215620002e5579182015b82811115620002e5578251825591602001919060010190620002c8565b50620002f3929150620002f7565b5090565b6200031491905b80821115620002f35760008155600101620002fe565b90565b60805160f81c6112a062000335600039806105d852506112a06000f3fe608060405234801561001057600080fd5b506004361061011b5760003560e01c806340c10f19116100b25780639c52a7f111610081578063a457c2d711610066578063a457c2d7146103ee578063a9059cbb14610427578063dd62ed3e146104605761011b565b80639c52a7f1146103825780639dc29fac146103b55761011b565b806340c10f19146102d957806365fae35e1461031457806370a082311461034757806395d89b411461037a5761011b565b806323b872dd116100ee57806323b872dd14610237578063313ce5671461027a578063355274ea1461029857806339509351146102a05761011b565b8063022914a71461012057806306fdde0314610165578063095ea7b3146101e257806318160ddd1461022f575b600080fd5b6101536004803603602081101561013657600080fd5b503573ffffffffffffffffffffffffffffffffffffffff1661049b565b60408051918252519081900360200190f35b61016d6104ad565b6040805160208082528351818301528351919283929083019185019080838360005b838110156101a757818101518382015260200161018f565b50505050905090810190601f1680156101d45780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61021b600480360360408110156101f857600080fd5b5073ffffffffffffffffffffffffffffffffffffffff8135169060200135610556565b604080519115158252519081900360200190f35b61015361056c565b61021b6004803603606081101561024d57600080fd5b5073ffffffffffffffffffffffffffffffffffffffff813581169160208101359091169060400135610572565b6102826105d6565b6040805160ff9092168252519081900360200190f35b6101536105fa565b61021b600480360360408110156102b657600080fd5b5073ffffffffffffffffffffffffffffffffffffffff8135169060200135610600565b610312600480360360408110156102ef57600080fd5b5073ffffffffffffffffffffffffffffffffffffffff8135169060200135610649565b005b6103126004803603602081101561032a57600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16610878565b6101536004803603602081101561035d57600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16610957565b61016d610969565b6103126004803603602081101561039857600080fd5b503573ffffffffffffffffffffffffffffffffffffffff166109e1565b610312600480360360408110156103cb57600080fd5b5073ffffffffffffffffffffffffffffffffffffffff8135169060200135610b40565b61021b6004803603604081101561040457600080fd5b5073ffffffffffffffffffffffffffffffffffffffff8135169060200135610cda565b61021b6004803603604081101561043d57600080fd5b5073ffffffffffffffffffffffffffffffffffffffff8135169060200135610d23565b6101536004803603604081101561047657600080fd5b5073ffffffffffffffffffffffffffffffffffffffff81358116916020013516610d30565b60006020819052908152604090205481565b600280546040805160206001841615610100027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff01909316849004601f8101849004840282018401909252818152929183018282801561054e5780601f106105235761010080835404028352916020019161054e565b820191906000526020600020905b81548152906001019060200180831161053157829003601f168201915b505050505081565b6000610563338484610d4d565b50600192915050565b60065481565b600061057f848484610e94565b73ffffffffffffffffffffffffffffffffffffffff84166000908152600560209081526040808320338085529252909120546105cc9186916105c7908663ffffffff61104d16565b610d4d565b5060019392505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b60035481565b33600081815260056020908152604080832073ffffffffffffffffffffffffffffffffffffffff8716845290915281205490916105639185906105c7908663ffffffff61109616565b336000908152602081905260409020546001146106c757604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601c60248201527f546f6b656e3a204e6f6e20617574686f72697a65642061636365737300000000604482015290519081900360640190fd5b73ffffffffffffffffffffffffffffffffffffffff821661074957604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015290519081900360640190fd5b60065461075c908263ffffffff61109616565b6006556003541580610772575060065460035410155b6107dd57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601960248201527f45524332304361707065643a2063617020657863656564656400000000000000604482015290519081900360640190fd5b73ffffffffffffffffffffffffffffffffffffffff8216600090815260046020526040902054610813908263ffffffff61109616565b73ffffffffffffffffffffffffffffffffffffffff831660008181526004602090815260408083209490945583518581529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35050565b336000908152602081905260409020546001146108f657604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601c60248201527f546f6b656e3a204e6f6e20617574686f72697a65642061636365737300000000604482015290519081900360640190fd5b73ffffffffffffffffffffffffffffffffffffffff811660008181526020818152604091829020600190819055825190815291517f881ab8a22f316bf86588be8193257d22bb9209d2b24689ab26fbd3be12b10b059281900390910190a250565b60046020526000908152604090205481565b60018054604080516020600284861615610100027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190941693909304601f8101849004840282018401909252818152929183018282801561054e5780601f106105235761010080835404028352916020019161054e565b33600090815260208190526040902054600114610a5f57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601c60248201527f546f6b656e3a204e6f6e20617574686f72697a65642061636365737300000000604482015290519081900360640190fd5b73ffffffffffffffffffffffffffffffffffffffff8116331415610ae457604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601660248201527f417574683a2043616e6e6f742073656c662064656e7900000000000000000000604482015290519081900360640190fd5b73ffffffffffffffffffffffffffffffffffffffff81166000818152602081815260408083208390558051928352517f881ab8a22f316bf86588be8193257d22bb9209d2b24689ab26fbd3be12b10b059281900390910190a250565b33600090815260208190526040902054600114610bbe57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601c60248201527f546f6b656e3a204e6f6e20617574686f72697a65642061636365737300000000604482015290519081900360640190fd5b73ffffffffffffffffffffffffffffffffffffffff8216610c2a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806112016021913960400191505060405180910390fd5b600654610c3d908263ffffffff61104d16565b60065573ffffffffffffffffffffffffffffffffffffffff8216600090815260046020526040902054610c76908263ffffffff61104d16565b73ffffffffffffffffffffffffffffffffffffffff83166000818152600460209081526040808320949094558351858152935191937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929081900390910190a35050565b33600081815260056020908152604080832073ffffffffffffffffffffffffffffffffffffffff8716845290915281205490916105639185906105c7908663ffffffff61104d16565b6000610563338484610e94565b600560209081526000928352604080842090915290825290205481565b73ffffffffffffffffffffffffffffffffffffffff8316610db9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001806112476024913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8216610e25576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806111df6022913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff808416600081815260056020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b73ffffffffffffffffffffffffffffffffffffffff8316610f00576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806112226025913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8216610f6c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260238152602001806111bc6023913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8316600090815260046020526040902054610fa2908263ffffffff61104d16565b73ffffffffffffffffffffffffffffffffffffffff8085166000908152600460205260408082209390935590841681522054610fe4908263ffffffff61109616565b73ffffffffffffffffffffffffffffffffffffffff80841660008181526004602090815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b600061108f83836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525061110a565b9392505050565b60008282018381101561108f57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b600081848411156111b3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015611178578181015183820152602001611160565b50505050905090810190601f1680156111a55780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b50505090039056fe45524332303a207472616e7366657220746f20746865207a65726f206164647265737345524332303a20617070726f766520746f20746865207a65726f206164647265737345524332303a206275726e2066726f6d20746865207a65726f206164647265737345524332303a207472616e736665722066726f6d20746865207a65726f206164647265737345524332303a20617070726f76652066726f6d20746865207a65726f2061646472657373a2646970667358221220f676ce2b0cfec7a650ea82404059cf1cef1c0da4ab101d5816a3c309db79075f64736f6c634300060b0033"
    };
});
define("ERC20", ["require", "exports", "@ijstech/eth-contract", "ERC20.json"], function (require, exports, eth_contract_1, ERC20_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ERC20 = void 0;
    ERC20_json_1 = __importDefault(ERC20_json_1);
    class ERC20 extends eth_contract_1.Contract {
        constructor(wallet, address) {
            super(wallet, address, ERC20_json_1.default.abi, ERC20_json_1.default.bytecode);
        }
        deploy(params) {
            return this._deploy(params.symbol, params.name, this.utils.toString(params.initialSupply), this.utils.toString(params.cap), this.utils.toString(params.decimals));
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
        parseAuthEvent(receipt) {
            return this.parseEvents(receipt, "Auth").map(e => this.decodeAuthEvent(e));
        }
        decodeAuthEvent(event) {
            let result = event.data;
            return {
                account: result.account,
                auth: new eth_contract_1.BigNumber(result.auth),
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
        async allowance(params) {
            let result = await this.methods('allowance', params.param1, params.param2);
            return new eth_contract_1.BigNumber(result);
        }
        async approve(params) {
            let result = await this.methods('approve', params.spender, this.utils.toString(params.value));
            return result;
        }
        async balanceOf(param1) {
            let result = await this.methods('balanceOf', param1);
            return new eth_contract_1.BigNumber(result);
        }
        async burn(params) {
            let result = await this.methods('burn', params.account, this.utils.toString(params.value));
            return result;
        }
        async cap() {
            let result = await this.methods('cap');
            return new eth_contract_1.BigNumber(result);
        }
        async decimals() {
            let result = await this.methods('decimals');
            return new eth_contract_1.BigNumber(result);
        }
        async decreaseAllowance(params) {
            let result = await this.methods('decreaseAllowance', params.spender, this.utils.toString(params.subtractedValue));
            return result;
        }
        async deny(account) {
            let result = await this.methods('deny', account);
            return result;
        }
        async increaseAllowance(params) {
            let result = await this.methods('increaseAllowance', params.spender, this.utils.toString(params.addedValue));
            return result;
        }
        async mint(params) {
            let result = await this.methods('mint', params.account, this.utils.toString(params.value));
            return result;
        }
        async name() {
            let result = await this.methods('name');
            return result;
        }
        async owners(param1) {
            let result = await this.methods('owners', param1);
            return new eth_contract_1.BigNumber(result);
        }
        async rely(account) {
            let result = await this.methods('rely', account);
            return result;
        }
        async symbol() {
            let result = await this.methods('symbol');
            return result;
        }
        async totalSupply() {
            let result = await this.methods('totalSupply');
            return new eth_contract_1.BigNumber(result);
        }
        async transfer(params) {
            let result = await this.methods('transfer', params.to, this.utils.toString(params.value));
            return result;
        }
        async transferFrom(params) {
            let result = await this.methods('transferFrom', params.from, params.to, this.utils.toString(params.value));
            return result;
        }
    }
    exports.ERC20 = ERC20;
});
define("index", ["require", "exports", "ERC20"], function (require, exports, ERC20_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ERC20 = void 0;
    Object.defineProperty(exports, "ERC20", { enumerable: true, get: function () { return ERC20_1.ERC20; } });
});
