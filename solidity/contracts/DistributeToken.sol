pragma solidity ^0.4.23;

import "./ERC20.sol";

contract DistributeToken is ERC20 {
    constructor(uint256 initialSupply) public ERC20("Distribute Token", "DT", 18) {
        _mint(msg.sender, initialSupply);
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }
}