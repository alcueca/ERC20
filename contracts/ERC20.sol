// SPDX-License-Identifier: MIT
// Inspired on token.sol from DappHub

pragma solidity  ^0.8.0;


contract ERC20 {
    uint256                                           internal  _totalSupply;
    mapping (address => uint256)                      internal  _balanceOf;
    mapping (address => mapping (address => uint256)) internal  _allowance;
    string                                            public    symbol;
    uint256                                           public    decimals = 18; // standard token precision. override to customize
    string                                            public    name = "";     // Optional token name

    constructor(string memory name_, string memory symbol_) {
        name = name_;
        symbol = symbol_;
    }

    event Approval(address indexed owner, address indexed spender, uint wad);
    event Transfer(address indexed src, address indexed dst, uint wad);
    event Mint(address indexed dst, uint wad);
    event Burn(address indexed src, uint wad);

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address guy) public view returns (uint256) {
        return _balanceOf[guy];
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowance[owner][spender];
    }

    function approve(address spender, uint wad) public returns (bool) {
        return _approve(msg.sender, spender, wad);
    }

    function transfer(address dst, uint wad) external returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(address src, address dst, uint wad) public returns (bool) {
        uint256 allowed = _allowance[src][msg.sender];
        if (src != msg.sender && allowed != type(uint).max) {
            require(allowed >= wad, "ERC20: insufficient-approval");
            _approve(src, msg.sender, allowed - wad);
        }

        require(_balanceOf[src] >= wad, "ERC20: insufficient-balance");
        _balanceOf[src] = _balanceOf[src] - wad;
        _balanceOf[dst] = _balanceOf[dst] + wad;

        emit Transfer(src, dst, wad);

        return true;
    }

    function _approve(address owner, address spender, uint wad) internal returns (bool) {
        _allowance[owner][spender] = wad;
        emit Approval(owner, spender, wad);
        return true;
    }

    function _mint(address dst, uint wad) internal {
        _balanceOf[dst] = _balanceOf[dst] + wad;
        _totalSupply = _totalSupply + wad;
        emit Mint(dst, wad);
    }

    function _burn(address src, uint wad) internal {
        uint256 allowed = _allowance[src][msg.sender];
        if (src != msg.sender && allowed != type(uint).max) {
            require(allowed >= wad, "ERC20: insufficient-approval");
            _approve(src, msg.sender, allowed - wad);
        }

        require(_balanceOf[src] >= wad, "ERC20: insufficient-balance");
        _balanceOf[src] = _balanceOf[src] - wad;
        _totalSupply = _totalSupply - wad;
        emit Burn(src, wad);
    }
}