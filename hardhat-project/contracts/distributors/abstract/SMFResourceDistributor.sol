// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./ResourceDistributor.sol";
import "../../lib/ShareCalculator.sol";

abstract contract SMFResourceDistributor is ResourceDistributor {
    mapping(uint256 => uint16[]) epochDemands;

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

    function demand(uint16 volume) public virtual override {
        super.demand(volume);
        epochDemands[epoch].push(volume);
    }

    function calculateShare()
        internal
        view
        virtual
        override
        returns (uint16 _share, uint256 _amount)
    {
        return
            ShareCalculator.calculateSMFShare(
                maxDemandVolume,
                epochDemands[epoch],
                cumulativeCapacity
            );
    }
}
