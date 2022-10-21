// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract EtherDistributor {

	struct User {
		uint id;
		address addr;
		uint balance;
		uint demandEpoch;
		uint claimEpoch;
	}

	address public owner;
	uint public numberOfUsers;
	User[] public permissionedUsers;

	constructor(){
		owner = msg.sender;
		numberOfUsers = 0;
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "Only owner can call this function.");
		_;
	}

	function addPermissionedUser(address _addr) public onlyOwner {
		permissionedUsers.push(User(numberOfUsers, _addr, 0, 0, 0));
		numberOfUsers++;
	}

}
