// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Permissioned is Ownable {
    event Register(address indexed _user);
    event Unregister(address indexed _user);

    uint256 public numberOfUsers;
    mapping(address => uint256) public registeredIds;

    modifier onlyRegistered() {
        require(
            registeredIds[msg.sender] != 0,
            "Permissioned: User is not registered"
        );
        _;
    }

    function addPermissionedUser(address payable _addr) public onlyOwner {
        require(
            registeredIds[_addr] == 0,
            "Permissioned: User already exists"
        );
        numberOfUsers++;
        registeredIds[_addr] = numberOfUsers; // ids starting from 1
        emit Register(_addr);
    }

    function removePermissionedUser(address _addr) public onlyOwner {
        require(
            registeredIds[_addr] != 0,
            "Permissioned: User does not exist"
        );
        delete registeredIds[_addr];
        numberOfUsers--;
        emit Unregister(_addr);
    }
}
