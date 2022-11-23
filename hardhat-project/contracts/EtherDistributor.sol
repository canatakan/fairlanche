// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract EtherDistributor {
    uint16 public constant DEMAND_EXPIRATION_TIME = 100; // in epochs

    struct User {
        uint256 id; // ids starting from 1
        address payable addr;
        // list of structs [(epochMultiplier, volume), ...]
        uint256[DEMAND_EXPIRATION_TIME] epochMultipliers;
        uint16[DEMAND_EXPIRATION_TIME] demandedVolumes;
        
        uint256 lastDemandEpoch;
    }

    address public owner;
    uint256 public numberOfUsers;

    User[] public permissionedUsers;
    mapping(address => User) public permissionedAddresses;

    uint16 public constant MAX_DEMAND_VOLUME = 10;
    uint256 public epochCapacity;
    uint256 public cumulativeCapacity;

    uint16[DEMAND_EXPIRATION_TIME] public shares; // calculated with _calculateShare()

    uint256[MAX_DEMAND_VOLUME + 1] public numberOfDemands; // demand volume array
    uint256 public totalDemand; // total number of demands, D

    uint256 public blockOffset; // block number of the contract creation
    uint256 public epochDuration; // duration of each epoch, in blocks
    uint256 public epoch; // epoch counter

    constructor(uint256 _epochCapacity, uint256 _epochDuration) payable {
        owner = msg.sender;
        numberOfUsers = 0;
        blockOffset = block.number;
        epochCapacity = _epochCapacity;
        epochDuration = _epochDuration;
        cumulativeCapacity = epochCapacity;
        // TODO: think about the usages of epoch variable after updating it to 1
        epoch = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function addPermissionedUser(address payable _addr) public onlyOwner {
        // if the user does not exist, the id field should return the default value 0
        require(permissionedAddresses[_addr].id == 0, "User already exists.");
        numberOfUsers++; // user ids start from 1

        uint256[100] memory _epochMultipliers;
        uint16[100] memory _demandedVolumes;

        User memory currentUser = User(
            numberOfUsers,
            _addr,
            _epochMultipliers,
            _demandedVolumes,
            0
        );

        permissionedUsers.push(currentUser);
        permissionedAddresses[_addr] = currentUser;
    }

    function demand(uint16 volume) public {
        
        require(permissionedAddresses[msg.sender].id != 0, "User does not have the permission.");
        require(volume > 0 && volume <= MAX_DEMAND_VOLUME, "Invalid volume.");
        unchecked {
            /* _updateState() sets totalDemand numberOfDemands to 0
            *   if the epoch is expired. That is why we need to use
            *   unchecked here.
            */
            _updateState();
            require(
                permissionedAddresses[msg.sender].lastDemandEpoch < epoch,
                "Wait for the next epoch."
            );
            numberOfDemands[volume]++;
            totalDemand++;
        }
        
        permissionedAddresses[msg.sender].epochMultipliers[epoch % DEMAND_EXPIRATION_TIME] =
            epoch /
            DEMAND_EXPIRATION_TIME;
        permissionedAddresses[msg.sender].demandedVolumes[epoch % DEMAND_EXPIRATION_TIME] = volume;
        permissionedAddresses[msg.sender].lastDemandEpoch = epoch;

    }

    function claim(uint256 epochNumber) public {
        
        require(permissionedAddresses[msg.sender].id != 0, "User does not have the permission.");

        _updateState();
        require(epochNumber < epoch, "Invalid epoch number.");
        require(
            epochNumber + DEMAND_EXPIRATION_TIME > epoch,
            "Epoch is too old."
        );

        uint256 index = epochNumber % DEMAND_EXPIRATION_TIME;
        uint256 epochMultiplierAtIndex = permissionedAddresses[msg.sender].epochMultipliers[index];
        uint256 volumeAtIndex = permissionedAddresses[msg.sender].demandedVolumes[index];

        require(
            epochMultiplierAtIndex * 100 + index == epochNumber ||
                volumeAtIndex != 0,
            "You do not have a demand for this epoch."
        );

        // send min(share, User.demanded) to User.addr

        uint256 share = shares[epochNumber % DEMAND_EXPIRATION_TIME];

        // first, update the balance of the user
        permissionedAddresses[msg.sender].demandedVolumes[index] = 0;

        // then, send the ether
        (bool success, ) = msg.sender.call{
            value: min(share, volumeAtIndex)
        }("");
        require(success, "Transfer failed.");
    }

    function claimAll() public {
       
        require(permissionedAddresses[msg.sender].id != 0, "User does not have the permission.");

        _updateState();

        uint256 claimAmount = 0;
        for (uint256 i = 0; i < DEMAND_EXPIRATION_TIME; i++) {
            uint16 currentVolume = permissionedAddresses[msg.sender].demandedVolumes[i];
            uint256 currentEpochMultiplier = permissionedAddresses[msg.sender].epochMultipliers[i];

            if (currentEpochMultiplier * 100 + i < epoch - DEMAND_EXPIRATION_TIME)
                continue;

            if (currentVolume == 0) continue;

            claimAmount += min(shares[i], permissionedAddresses[msg.sender].demandedVolumes[i]);

            permissionedAddresses[msg.sender].demandedVolumes[i] = 0;
        }

        require(claimAmount > 0, "You have no claim.");

        (bool success, ) = msg.sender.call{value: claimAmount}("");
        require(success, "Transfer failed.");
    }

    function _updateState() public {
        uint256 currentEpoch = ((block.number - blockOffset) / epochDuration) + 1;
        if (epoch < currentEpoch) {
            // if the current epoch is over
            uint256 epochDifference = currentEpoch - epoch;
            epoch = currentEpoch;

            uint256 distribution;
            (
                shares[(epoch - epochDifference) % DEMAND_EXPIRATION_TIME],
                distribution
            ) = _calculateShare();
            cumulativeCapacity -= distribution; // subtract the distributed amount
            cumulativeCapacity += (epochCapacity) * epochDifference; // add the capacity of the new epoch

            totalDemand = 0;
            for (uint256 i = 0; i < MAX_DEMAND_VOLUME + 1; i++) {
                numberOfDemands[i] = 0;
            }
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

        for (uint16 i = 1; i <= MAX_DEMAND_VOLUME; i++) {
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
        return (MAX_DEMAND_VOLUME, necessaryCapacity);
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    // define a view function to see user struct fields
    function getUser(address _addr)
        public
        view
        returns (
            uint256,
            address,
            uint256[100] memory,
            uint16[100] memory,
            uint256
        )
    {
        User memory currentUser = permissionedAddresses[_addr];
        return (
            currentUser.id,
            currentUser.addr,
            currentUser.epochMultipliers,
            currentUser.demandedVolumes,
            currentUser.lastDemandEpoch
        );
    }
}
