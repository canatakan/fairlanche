// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IResourceDistributor.sol";
import "../../lib/ShareCalculator.sol";
import "../../miscellaneous/GasRefunder.sol";

/**
 * @title ResourceDistributor
 * @dev In this contract, permissioned addresses do not exist,
 * and anyone can interact with the contract functions. If the
 * subnet is already permissioned and no additional restrictions
 * are needed, this contract can be used.
 */
abstract contract ResourceDistributor is
    Ownable,
    IResourceDistributor,
    GasRefunder
{
    event Demand(address indexed _from, uint256 _epoch, uint16 _volume);
    event Claim(address indexed _from, uint256 _epoch, uint16 _share);
    event Share(uint256 indexed _epoch, uint16 _share, uint256 _distribution);

    uint256 public constant milliether = 1e15; // 0.001 ether

    uint16 public maxDemandVolume;
    uint16 public etherMultiplier;

    uint256 public distributionEndBlock;
    uint256 public claimEndBlock;
    bool public enableWithdraw;

    struct User {
        mapping(uint256 => uint16) demandedVolumes; // volume demanded for each epoch
        uint256 lastDemandEpoch;
    }

    mapping(address => User) public users;

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

        blockOffset = block.number;

        maxDemandVolume = _maxDemandVolume;
        numberOfDemands = new uint256[](maxDemandVolume + 1);

        epochCapacity = _epochCapacity;
        epochDuration = _epochDuration;
        cumulativeCapacity = epochCapacity;
        epoch = 1;
        shares.push(0);

        etherMultiplier = _etherMultiplier;
        enableWithdraw = _enableWithdraw;

        distributionEndBlock = calculateEndingBlock();
        claimEndBlock = distributionEndBlock + _expirationBlocks;
    }

    function calculateEndingBlock() internal view virtual returns (uint256);

    function handleTransfer(
        address _receiver,
        uint256 _amount
    ) internal virtual;

    function deposit(uint256 _amount) public virtual;

    function withdrawExpired() public virtual;

    function burnExpired() public virtual;

    function demand(uint16 volume) public virtual {
        require(
            (volume > 0) &&
                (volume <= maxDemandVolume) &&
                (volume <= epochCapacity),
            "Invalid volume."
        );

        // stop collecting demands after the distribution ends
        require(block.number < distributionEndBlock, "Demand period is over.");

        updateState();
        require(
            users[msg.sender].lastDemandEpoch < epoch,
            "Wait for the next epoch."
        );
        numberOfDemands[volume]++;
        totalDemand++;

        users[msg.sender].demandedVolumes[epoch] = volume;
        users[msg.sender].lastDemandEpoch = epoch;

        emit Demand(msg.sender, epoch, volume);
    }

    function claim(uint256 epochNumber) public virtual {
        // stop allowing claims after the distribution's ending + expirationBlocks
        require(block.number < claimEndBlock, "Claim period is over.");

        updateState();
        require(epochNumber < epoch, "You can only claim past epochs.");

        uint16 demandedVolume = users[msg.sender]
            .demandedVolumes[epochNumber];

        require(
            demandedVolume != 0,
            "You do not have a demand for this epoch."
        );

        // send min(share, User.demanded) to User.addr
        uint16 share = shares[epochNumber];

        // first, update the balance of the user
        users[msg.sender].demandedVolumes[epochNumber] = 0;

        // then, send the transfer
        handleTransfer(
            msg.sender,
            min(share, demandedVolume) * (etherMultiplier * milliether)
        );

        emit Claim(msg.sender, epochNumber, uint16(min(share, demandedVolume)));
    }

    function claimBulk(uint256[] memory epochNumbers) public virtual {
        require(
            epochNumbers.length <= 255,
            "You can only claim up to 255 epochs at once."
        );

        require(block.number < claimEndBlock, "Claim period is over.");
        updateState();

        uint256 totalClaim;

        uint16 demandedVolume;
        uint16 share;
        for (uint16 i = 0; i < epochNumbers.length; i++) {
            uint256 currentEpoch = epochNumbers[i];
            require(currentEpoch < epoch, "You can only claim past epochs.");

            demandedVolume = users[msg.sender].demandedVolumes[currentEpoch];
            require(
                demandedVolume != 0,
                "You do not have a demand for one of the epochs."
            );

            share = shares[currentEpoch];

            // first, update the balance of the user (in case of reentrancy)
            users[msg.sender].demandedVolumes[currentEpoch] = 0;
            totalClaim += min(share, demandedVolume);

            emit Claim(
                msg.sender,
                currentEpoch,
                uint16(min(share, demandedVolume))
            );
        }

        // then send the transfer:
        handleTransfer(msg.sender, totalClaim * (etherMultiplier * milliether));
    }

    function updateState() internal virtual {
        uint256 currentEpoch = ((block.number - blockOffset) / epochDuration) +
            1;
        if (epoch < currentEpoch) {
            // if the current epoch is over
            
            uint256 startGas = gasleft();

            uint16 share;
            uint256 distribution;
            (share, distribution) = calculateShare();
            
            emit Share(currentEpoch, share, distribution);

            uint256 epochDifference = currentEpoch - epoch;
            epoch = currentEpoch;

            shares.push(share);

            for (uint256 i = 0; i < epochDifference - 1; i++) {
                // add 0 shares for the epochs that are skipped
                shares.push(0);
            }

            cumulativeCapacity -= distribution; // subtract the distributed amount
            cumulativeCapacity += (epochCapacity) * epochDifference; // add the capacity of the new epoch

            totalDemand = 0;
            for (uint256 i = 0; i <= maxDemandVolume; i++) {
                numberOfDemands[i] = 0;
            }

            uint256 gasUsed = startGas - gasleft();
            uint256 gasPrice = tx.gasprice;
            
            // +500 for the gas used in the calculations
            uint256 gasCost = (500 + gasUsed) * gasPrice;
            
            refunds[msg.sender] += gasCost;
        }
    }

    function calculateShare()
        internal
        view
        virtual
        returns (uint16 _share, uint256 _amount);

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
