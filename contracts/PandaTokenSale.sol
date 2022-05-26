// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./PandaToken.sol";

contract PandaTokenSale{
    address admin;
    PandaToken public tokenContract;
    uint256 public tokenPrice; // 0.001 ether
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(PandaToken _tokenContract, uint256 _tokenPrice){
        // assing admin
        admin = msg.sender;
        // token contract
        tokenContract = _tokenContract;
        // token price
        tokenPrice = _tokenPrice;
    }

    // multiply
    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }

    // Buy tokens
    function buyTokens(uint256 _numberOfTokens) public payable{
        // Require enough amount
        require((msg.value == mul(_numberOfTokens, tokenPrice)));
        // Require contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // Require transfer is successful
        require((tokenContract.transfer(msg.sender, _numberOfTokens)));
        // keep track of tokens sold
        tokensSold += _numberOfTokens;
        // emit sell event
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        // Require admin
        require(msg.sender == admin);
        // Transfer remainign dapp tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        // Destroy contract
        selfdestruct(payable(admin));
    }
}