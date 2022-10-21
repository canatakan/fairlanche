// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract EtherDistributor {
    struct User {
        uint256 id;  // ids starting from 1
        address payable addr;
        uint256 balance;
        uint256 demandEpoch;
        uint256 claimEpoch;
    }

    address public owner;
    uint256 public numberOfUsers;

    User[] public permissionedUsers;
    mapping(address => User) public permissionedAddresses;

    constructor() {
        owner = msg.sender;
        numberOfUsers = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function addPermissionedUser(address payable _addr) public onlyOwner {
        // if the user does not exist, the id field should return the default value 0
        require(permissionedAddresses[_addr].id == 0, "User already exists.");
        numberOfUsers++; // user ids start from 1
        User memory currentUser = User(numberOfUsers, _addr, 0, 0, 0);
        permissionedUsers.push(currentUser);
        permissionedAddresses[_addr] = currentUser;
    }
}
