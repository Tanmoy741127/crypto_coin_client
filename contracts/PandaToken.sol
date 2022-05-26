// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract PandaToken{
    string public name;
    string public symbol;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address=>uint256)) public allowance; 
    // function allowance(address _owner, address _spender) public view returns (uint256 remaining)


    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor(uint256 _initialSupply){
        name = "Panda Token";
        symbol = "PND";
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns(bool success) {
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // Delegated Transfer

    // approve
    function approve(address _spender, uint256 _value) public returns (bool success){
        // allowance
        allowance[msg.sender][_spender] = _value;

        // approve event
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    // transferFrom
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        // Require _from has enough tokens
        require(_value <= balanceOf[_from]);
        // Require allowance is big enough
        require(_value <= allowance[_from][msg.sender]);

        // change balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // update allowance
        allowance[_from][msg.sender] -= _value;
        // transfer event
        emit Transfer(_from, _to, _value);
        // return boolean
        return true;
    }
    
}