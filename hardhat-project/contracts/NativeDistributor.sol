// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract NativeDistributor {
    uint256 public constant milliether = 1e15; // 0.001 ether

    uint16 public maxDemandVolume;
    uint16 public etherMultiplier;

    uint256 public distributionEndBlock;
    uint256 public claimEndBlock;
    bool public enableWithdraw;

    struct User {
        uint256 id; // ids starting from 1
        address payable addr;
        mapping(uint256 => uint16) demandedVolumes; // volume demanded for each epoch
        uint256 lastDemandEpoch;
    }

    address public owner;
    uint256 public numberOfUsers;
    mapping(address => User) public permissionedAddresses;

    uint256 public epochCapacity;
    uint256 public cumulativeCapacity;

    uint16[] public shares; // calculated with calculateShare()

    uint256[] public numberOfDemands; // demand volume array
    uint256 public totalDemand; // total number of demands, D

    uint256 public blockOffset; // block number of the contract creation
    uint256 public epochDuration; // duration of each epoch, in blocks
    uint256 public epoch; // epoch counter

    /**
     * @param _maxDemandVolume maximum demand volume
     * @param _epochCapacity capacity of each epoch
     * @param _epochDuration duration of each epoch, in blocks
     * @param _etherMultiplier multiplier for the milliether value. To send 1 ether for shares, set it to 1000.
     * @param _expirationBlocks number of blocks after the distribution ends that the contract will be active
     * @param _enableWithdraw if true, the owner can withdraw the remaining balance after the expirationBlocks
     */
    constructor(
        uint16 _maxDemandVolume,
        uint256 _epochCapacity,
        uint256 _epochDuration,
        uint16 _etherMultiplier,
        uint256 _expirationBlocks,
        bool _enableWithdraw
    ) payable {
        require(
            _epochCapacity > 0 && _epochDuration > 0,
            "Epoch capacity and duration must be greater than 0."
        );
        require(
            msg.value >= _epochCapacity * (_etherMultiplier * milliether),
            "The contract must be funded with at least one epoch capacity."
        );

        owner = msg.sender;
        numberOfUsers = 0;
        blockOffset = block.number;

        maxDemandVolume = _maxDemandVolume;
        numberOfDemands = new uint256[](maxDemandVolume + 1);

        epochCapacity = _epochCapacity;
        epochDuration = _epochDuration;
        cumulativeCapacity = epochCapacity;
        epoch = 1;

        etherMultiplier = _etherMultiplier;

        uint256 deployedEthers = msg.value / (etherMultiplier * milliether);
        if (deployedEthers % epochCapacity == 0) {
            distributionEndBlock =
                blockOffset +
                (deployedEthers / epochCapacity) *
                epochDuration;
        } else {
            distributionEndBlock =
                blockOffset +
                ((deployedEthers / epochCapacity) + 1) *
                epochDuration;
        }
        claimEndBlock = distributionEndBlock + _expirationBlocks;

        enableWithdraw = _enableWithdraw;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function withdrawExpired() public onlyOwner {
        require(enableWithdraw, "Withdraw is disabled.");
        require(
            block.number > claimEndBlock,
            "Wait for the end of the distribution."
        );
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }

    function burnExpired() public onlyOwner {
        require(
            block.number > claimEndBlock,
            "Wait for the end of the distribution."
        );
        selfdestruct(payable(address(0)));
    }

    function addPermissionedUser(address payable _addr) public onlyOwner {
        // if the user does not exist, the id field should return the default value 0
        require(permissionedAddresses[_addr].id == 0, "User already exists.");
        numberOfUsers++; // user ids start from 1

        User storage currentUser = permissionedAddresses[_addr];
        currentUser.id = numberOfUsers;
        currentUser.addr = _addr;
    }

    function demand(uint16 volume) public {
        require(
            permissionedAddresses[msg.sender].id != 0,
            "User does not have the permission."
        );
        require(
            (volume > 0) &&
                (volume <= maxDemandVolume) &&
                (volume <= epochCapacity),
            "Invalid volume."
        );

        // stop collecting demands after the distribution ends
        require(block.number < distributionEndBlock, "Distribution is over.");

        updateState();
        require(
            permissionedAddresses[msg.sender].lastDemandEpoch < epoch,
            "Wait for the next epoch."
        );
        numberOfDemands[volume]++;
        totalDemand++;

        permissionedAddresses[msg.sender].demandedVolumes[epoch] = volume;
        permissionedAddresses[msg.sender].lastDemandEpoch = epoch;
    }

    function claim(uint256 epochNumber) public {
        require(
            permissionedAddresses[msg.sender].id != 0,
            "User does not have the permission."
        );

        // stop allowing claims after the distribution's ending + expirationBlocks
        require(block.number < claimEndBlock, "Distribution is over.");

        updateState();
        require(epochNumber < epoch, "You can only claim past epochs.");

        uint256 demandedVolume = permissionedAddresses[msg.sender]
            .demandedVolumes[epochNumber];

        require(
            demandedVolume != 0,
            "You do not have a demand for this epoch."
        );

        // send min(share, User.demanded) to User.addr
        uint256 share = shares[epochNumber];

        // first, update the balance of the user
        permissionedAddresses[msg.sender].demandedVolumes[epochNumber] = 0;

        // then, send the ether
        (bool success, ) = msg.sender.call{
            value: min(share, demandedVolume) * (etherMultiplier * milliether)
        }("");
        require(success, "Transfer failed.");
    }

    function claimBulk(uint256[] memory epochNumbers) public {
        require(
            permissionedAddresses[msg.sender].id != 0,
            "User does not have the permission."
        );

        require(
            epochNumbers.length <= 255,
            "You can only claim up to 255 epochs at once."
        );

        require(block.number < claimEndBlock, "Distribution is over.");
        updateState();

        uint256 totalClaim;

        uint16 demandedVolume;
        uint16 share;
        for (uint16 i = 0; i < epochNumbers.length; i++) {
            uint256 currentEpoch = epochNumbers[i];
            if (currentEpoch == 0) break;

            require(currentEpoch < epoch, "You can only claim past epochs.");

            demandedVolume = permissionedAddresses[msg.sender].demandedVolumes[
                currentEpoch
            ];
            require(
                demandedVolume != 0,
                "You do not have a demand for one of the epochs."
            );

            share = shares[currentEpoch];

            // first, update the balance of the user (in case of reentrancy)
            permissionedAddresses[msg.sender].demandedVolumes[currentEpoch] = 0;
            totalClaim += min(share, demandedVolume);
        }

        // then, send the ether
        (bool success, ) = msg.sender.call{
            value: totalClaim * (etherMultiplier * milliether)
        }("");
        require(success, "Transfer failed.");
    }

    function updateState() internal {
        uint256 currentEpoch = ((block.number - blockOffset) / epochDuration) +
            1;
        if (epoch < currentEpoch) {
            // if the current epoch is over
            uint256 epochDifference = currentEpoch - epoch;
            epoch = currentEpoch;

            uint16 share;
            uint256 distribution;
            (
                share,
                distribution
            ) = calculateShare();
            shares.push(share);
            cumulativeCapacity -= distribution; // subtract the distributed amount
            cumulativeCapacity += (epochCapacity) * epochDifference; // add the capacity of the new epoch

            totalDemand = 0;
            for (uint256 i = 0; i <= maxDemandVolume; i++) {
                numberOfDemands[i] = 0;
            }
        }
        // TODO: refund the remaining gas to the caller
    }

    function calculateShare()
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
         * Note: only called by updateState(), hence, assumes that the state is updated
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
