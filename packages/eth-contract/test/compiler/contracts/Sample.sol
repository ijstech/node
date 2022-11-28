// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.17;
library Library {
	function _pow(uint256 x, uint256 n, uint256 b) internal pure returns (uint256 z) {
		assembly {
			switch x 
				case 0 {
					switch n 
						case 0 {z := b} 
						default {z := 0}
				}
				default {
					switch mod(n, 2) 
						case 0 { z := b } 
						default { z := x }
					let half := div(b, 2)  // for rounding.
					for { n := div(n, 2) } n { n := div(n,2) } {
						let xx := mul(x, x)
						if iszero(eq(div(xx, x), x)) { revert(0,0) }
						let xxRound := add(xx, half)
						if lt(xxRound, xx) { revert(0,0) }
						x := div(xxRound, b)
						if mod(n,2) {
							let zx := mul(z, x)
							if and(iszero(iszero(x)), iszero(eq(div(zx, x), z))) { revert(0,0) }
							let zxRound := add(zx, half)
							if lt(zxRound, zx) { revert(0,0) }
							z := div(zxRound, b)
						}
					}
				}
		}
	}    
}
interface Interface {
    event Set1(uint256 indexed i, SimpleStruct ss);
    event Set2(bytes32 indexed b, NextedStruct ns);
    event Set3(string indexed s, NextedStruct[] nsa);

    struct SimpleStruct {
        int256 i256;
        uint256 ui256;
        bytes32 b32;
        bytes b;
        string s;
    }
    struct ArrayStruct {
        int256[] i256a;
        uint256[] ui256a;
        bytes32[] b32a;
        bytes[] ba;
        string[] sa;
    }
    struct NextedStruct {
        SimpleStruct ss;
    }
    
    // view functions
    function i256() external view returns (int256 i256);
    function ui256() external view returns (uint256 ui256);
    function b32() external view returns (bytes32 b32);
    function b() external view returns (bytes memory b);
    function s() external view returns (string memory s);
    function i256a(uint256 index) external view returns (int256 i256);
    function ui256a(uint256 index) external view returns (uint256 ui256);
    function b32a(uint256 index) external view returns (bytes32 b32);
    function ba(uint256 index) external view returns (bytes memory b);
    function sa(uint256 index) external view returns (string memory s);

    function i2ss(uint256 i) external view returns (
        int256 i256,
        uint256 ui256,
        bytes32 b32,
        bytes memory b,
        string memory s
    );
    function b2ns(bytes32 b) external view returns (
        SimpleStruct memory ss
    );
    function s2nsa(string calldata s, uint256 index) external view returns (
        SimpleStruct memory ss
    );

    // state change / overload
    function set(uint256 i, SimpleStruct calldata ss) external;
    function set(bytes32 b, NextedStruct calldata ns) external;
    function set(string calldata s, NextedStruct[] calldata nsa) external;
}
abstract contract Abstract is Interface {
    uint256 public constant PI = 3141592653589793238;
    int256 public override i256;
    uint256 public override ui256;
    bytes32 public override b32;
    bytes public override b;
    string public override s;
    int256[] public override i256a;
    uint256[] public override ui256a;
    bytes32[] public override b32a;
    bytes[] public override ba;
    string[] public override sa;
    mapping(uint256 => SimpleStruct) public override i2ss;
    mapping(bytes32 => NextedStruct) public override b2ns;
    mapping(string =>  NextedStruct[]) public override s2nsa;

    // state change / overload
    function set(uint256 _i, SimpleStruct calldata ss) external override {
        i2ss[_i] = ss;
        emit Set1(_i, ss);
    }
    function set(bytes32 _b, NextedStruct calldata ns) external override {
        b2ns[_b] = ns;
        emit Set2(_b, ns);
    }
    function set(string calldata _s, NextedStruct[] calldata nsa) external override {
        uint256 length = nsa.length;
        NextedStruct[] storage n = s2nsa[_s];
        for (uint256 i = 0 ; i < length ; i++) {
            n.push(nsa[i]);
        }
        emit Set3(_s, nsa);
    }
}
contract Contract is Abstract{
    using Library for uint256;
    mapping(uint256 => ArrayStruct) internal _i2as;
    constructor(int256 _i256, uint256 _ui256, bytes32 _b32, bytes memory _b, string memory _s) {
        i256 = _i256;
        ui256 = _ui256;
        b32 = _b32;
        s = _s;
        b = _b;
    }
    function i2as(uint256 i) external view returns (ArrayStruct memory a) {
        return _i2as[i];
    }
    // pure functions
    function pow(uint256 x, uint256 n) external pure returns (uint256){
        return x._pow(n, 18);
    }
    // payable functions with 0-2 parameters
    function pay() external payable returns (uint256) {
        payable(msg.sender).transfer(msg.value);
        return msg.value;
    }
    function pay(address payable to) external payable returns (uint256) {
        to.transfer(msg.value);
        return msg.value;
    }
    function pay(address payable to, uint256 amount) external payable returns (uint256) {
        to.transfer(amount);
        return amount;
    }
}