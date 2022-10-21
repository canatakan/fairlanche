// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract EtherDistributor {
    struct User {
        uint256 id; // ids starting from 1
        address payable addr;
        uint16 demandedVolume; // demand volume of the user
        uint256 demandEpoch;
        uint256 claimEpoch;
    }

    address public owner;
    uint256 public numberOfUsers;

    User[] public permissionedUsers;
    mapping(address => User) public permissionedAddresses;

    uint16 public constant maxDemandVolume = 10;
    uint256 public constant capacity = 50;
    uint16 public share; // calculated with _calculateShare()

    uint256[maxDemandVolume + 1] public numberOfDemands; // demand volume array
    uint256 public totalDemand; // total number of demands, D

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

    function demand(uint16 volume) public {
        require(
            permissionedAddresses[msg.sender].id != 0,
            "User does not have the permission."
        );
        require(volume > 0 && volume <= maxDemandVolume, "Invalid volume.");
        // TODO: epoch check should be made here
        numberOfDemands[volume]++;
        totalDemand++;
        permissionedAddresses[msg.sender].demandedVolume = volume;
        // share should be updated here:
        _updateState();
    }

    function claim() public {
        // send min(share, User.demanded) to User.addr
    }

    function _updateState() internal {
        share = _calculateShare();
    }

    // only called by _updateState, hence, assumes that the state is updated
    function _calculateShare() internal view returns (uint16) {
        uint256 cumulativeNODSum = 0;
        uint256 cumulativeTDVSum = 0;
        uint256 necessaryCapacity = 0;

        for (uint16 i = 1; i < maxDemandVolume; i++) {
            uint256 currentNOD = numberOfDemands[i];
            if (currentNOD == 0) {
                // skip calculations if there is no demand
                continue;
            }

            uint256 currentTDV = currentNOD * i;

            necessaryCapacity =
                cumulativeTDVSum +
                i *
                (totalDemand - cumulativeNODSum);
            if (necessaryCapacity > capacity) {
                return i - 1;
            }

            cumulativeNODSum += currentNOD;
            cumulativeTDVSum += currentTDV;
        }

        return maxDemandVolume;
    }
}
