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
    uint256 public constant epochCapacity = 5;
    uint256 public cumulativeCapacity;
    uint16 public share; // calculated with _calculateShare()

    uint256[maxDemandVolume + 1] public numberOfDemands; // demand volume array
    uint256 public totalDemand; // total number of demands, D

    uint256 public blockOffset; // block number of the contract creation
    uint256 public constant epochDuration = 2000; // 2000 blocks
    uint256 public epoch = 1; // epoch counter

    constructor() {
        owner = msg.sender;
        numberOfUsers = 0;
        blockOffset = block.number;
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
        if (epoch < (block.number - blockOffset) / epochDuration) {
            // if the current epoch is over
            epoch = (block.number - blockOffset) / epochDuration;
            uint256 distribution;
            (share, distribution) = _calculateShare();
            cumulativeCapacity -= distribution; // subtract the distributed amount
            cumulativeCapacity += epochCapacity; // add the capacity of the new epoch
        }
        // TODO: refund the remaining gas to the caller
    }

    function _calculateShare()
        internal
        view
        returns (uint16 _share, uint256 _amount)
    {
        /*
         * This function calculates the maximum share that can be distributed
         * in the current epoch to the users. In addition to that,it also
         * calculates the total distribution amount for the calculated maximum
         * share.
         *
         * These two values mentioned above are returned in a tuple as (share, amount).
         *
         * Note: only called by _updateState(), hence, assumes that the state is updated
         */

        uint256 cumulativeNODSum = 0;
        uint256 cumulativeTDVSum = 0;

        uint256 necessaryCapacity = 0; // necessary capacity to meet demands at ith volume
        uint256 sufficientCapacity = 0; // the latest necessaryCapacity that can be distributed

        for (uint16 i = 1; i <= maxDemandVolume; i++) {
            // always point to the previous necessaryCapacity
            sufficientCapacity = necessaryCapacity;
            
            // use the previous values of cumulativeNODSum and cumulativeTDVSum
            necessaryCapacity =
                cumulativeTDVSum +
                i *
                (totalDemand - cumulativeNODSum);

            uint256 currentNOD = numberOfDemands[i];

            // then calculate the new values
            cumulativeNODSum += currentNOD;
            cumulativeTDVSum += currentNOD * i;

            if (necessaryCapacity > cumulativeCapacity) {
                // necessaryCapacity for this volume is larger than the cumulativeCapacity
                // so, sufficientCapacity stores the maximum amount that can be distributed
                return (i - 1, sufficientCapacity);
            }
        }

        // cumulative capacity was enough for all demands
        return (maxDemandVolume, necessaryCapacity);
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
