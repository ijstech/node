// SPDX-License-Identifier: GPL-3.0-only
pragma solidity =0.6.11;

import './IERC20.sol';
import './SafeMath.sol';

contract ERC20 is IERC20 {
    using SafeMath for uint256;
    
    // --- Auth ---
    event Auth(address indexed account, uint256 auth);
    mapping (address => uint256) public owners;
    function rely(address account) external auth { 
        owners[account] = 1; 
        emit Auth(account, 1);
    }
    function deny(address account) external auth { 
        require(account != msg.sender, "Auth: Cannot self deny");
        owners[account] = 0; 
        emit Auth(account, 0); 
    }
    modifier auth {
        require(owners[msg.sender] == 1, "Token: Non authorized access"); 
        _; 
    }

    // --- ERC20 Data ---
    string  public override symbol;
    string  public override name;
    uint256 public cap;
    uint8 public immutable override decimals;
    
    mapping (address => uint256) public override balanceOf;
    mapping (address => mapping (address => uint256)) public override allowance;
    uint256 public override totalSupply;

    constructor(string memory _symbol, string memory _name, uint256 _initialSupply, uint256 _cap, uint8 _decimals) public {
        owners[msg.sender] = 1;
        emit Auth(msg.sender, 1);
        symbol = _symbol;
        name = _name;
        cap = _cap;
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = totalSupply;
        decimals = _decimals;
    }
    function mint(address account, uint256 value) external auth {
        require(account != address(0), "ERC20: mint to the zero address");

        totalSupply = totalSupply.add(value);
        require(cap == 0 || cap >= totalSupply, "ERC20Capped: cap exceeded");
        balanceOf[account] = balanceOf[account].add(value); 
        emit Transfer(address(0), account, value);
    }
    function burn(address account, uint256 value) external auth {
        require(account != address(0), "ERC20: burn from the zero address");

        totalSupply = totalSupply.sub(value);
        balanceOf[account] = balanceOf[account].sub(value);
        emit Transfer(account, address(0), value);
    }
    function transfer(address to, uint256 value) external override returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }
    function approve(address spender, uint256 value) external override returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external override returns (bool) {
        _transfer(from, to, value);
        _approve(from, msg.sender, allowance[from][msg.sender].sub(value));
        return true;
    }
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool) {
        _approve(msg.sender, spender, allowance[msg.sender][spender].add(addedValue));
        return true;
    }
    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool) {
        _approve(msg.sender, spender, allowance[msg.sender][spender].sub(subtractedValue));
        return true;
    }
    function _transfer(address from, address to, uint256 value) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        balanceOf[from] = balanceOf[from].sub(value);
        balanceOf[to] = balanceOf[to].add(value);
        emit Transfer(from, to, value);
    }
    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }
}