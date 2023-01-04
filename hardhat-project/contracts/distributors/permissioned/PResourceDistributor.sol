// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../../allowance/Permissioned.sol";
import "../public/ResourceDistributor.sol";

abstract contract PResourceDistributor is Permissioned, ResourceDistributor {
    constructor(
        uint16 _maxDemandVolume,
        uint256 _epochCapacity,
        uint256 _epochDuration,
        uint16 _etherMultiplier,
        uint256 _expirationBlocks,
        bool _enableWithdraw
    )
        payable
        ResourceDistributor(
            _maxDemandVolume,
            _epochCapacity,
            _epochDuration,
            _etherMultiplier,
            _expirationBlocks,
            _enableWithdraw
        )
    {}

    function demand(uint16 volume) public virtual override onlyRegistered {
        super.demand(volume);
    }

    function claim(uint256 epochNumber) public virtual override onlyRegistered {
        super.claim(epochNumber);
    }

    function claimBulk(
        uint256[] memory epochNumbers
    ) public virtual override onlyRegistered {
        super.claimBulk(epochNumbers);
    }
}
