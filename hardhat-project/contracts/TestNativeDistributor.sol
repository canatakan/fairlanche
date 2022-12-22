// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./NativeDistributor.sol";

contract TestNativeDistributor is NativeDistributor {
    /*
     * Inherits the main contract and exposes internal functions for testing.
     * There is also an additional function to see the user struct fields.
     */

    constructor(
        uint16 _maxDemandVolume,
        uint256 _epochCapacity,
        uint256 _epochDuration,
        uint16 _etherMultiplier,
        uint256 _expirationBlocks,
        bool _enableWithdraw
    )
        payable
        NativeDistributor(
            _maxDemandVolume,
            _epochCapacity,
            _epochDuration,
            _etherMultiplier,
            _expirationBlocks,
            _enableWithdraw
        )
    {}

    function _updateState() public {
        super.updateState();
    }

    function _calculateShare()
        public
        view
        returns (uint16 _share, uint256 _amount)
    {
        return super.calculateShare();
    }

    function _min(uint256 a, uint256 b) public pure returns (uint256) {
        return super.min(a, b);
    }
}
