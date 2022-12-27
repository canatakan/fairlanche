// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact can.ugur@boun.edu.tr
contract ERC20Resource is ERC20, ERC20Burnable, Ownable {
    uint256 public maximumSupply;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _premintAmount,
        uint256 _maximumSupply
    ) ERC20(_name, _symbol) {
        maximumSupply = _maximumSupply;
        _mint(msg.sender, _premintAmount);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(
            totalSupply() + amount <= maximumSupply,
            "ERC20Resource: Maximum supply reached"
        );
        _mint(to, amount);
    }
}
