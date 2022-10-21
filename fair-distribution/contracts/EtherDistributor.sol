// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract EtherDistributor {
    struct User {
        uint256 id;
        address payable addr;
        uint256 balance;
        uint256 demandEpoch;
        uint256 claimEpoch;
    }

    address public owner;
    uint256 public numberOfUsers;
    User[] public permissionedUsers;

    constructor() {
        owner = msg.sender;
        numberOfUsers = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function addPermissionedUser(address payable _addr) public onlyOwner {
        permissionedUsers.push(User(numberOfUsers, _addr, 0, 0, 0));
        numberOfUsers++;
    }
}
