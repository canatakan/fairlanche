// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./PResourceDistributor.sol";
import "../../../lib/ShareCalculator.sol";

abstract contract PEqualResourceDistributor is PResourceDistributor {
    constructor(
        uint16 _maxDemandVolume,
        uint256 _epochCapacity,
        uint256 _epochDuration,
        uint16 _etherMultiplier,
        uint256 _expirationBlocks,
        bool _enableWithdraw
    )
        payable
        PResourceDistributor(
            _maxDemandVolume,
            _epochCapacity,
            _epochDuration,
            _etherMultiplier,
            _expirationBlocks,
            _enableWithdraw
        )
    {}

    function demand(uint16 volume) public virtual override {
        require(
            totalDemand < cumulativeCapacity,
            "Maximum capacity is reached for this epoch"
        );
        super.demand(volume);
    }

    function calculateShare()
        internal
        view
        virtual
        override
        returns (uint16 _share, uint256 _amount)
    {
        return
            ShareCalculator.calculateEqualShare(
                totalDemand,
                cumulativeCapacity
            );
    }
}
