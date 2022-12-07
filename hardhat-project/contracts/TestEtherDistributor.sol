// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./EtherDistributor.sol";

contract TestEtherDistributor is EtherDistributor {
    /*
     * Inherits the main contract and exposes internal functions for testing.
     * There is also an additional function to see the user struct fields.
     */

    constructor(
        uint256 _epochCapacity,
        uint256 _epochDuration,
        bool _enableWithdraw
    )
        payable
        EtherDistributor(_epochCapacity, _epochDuration, _enableWithdraw)
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

    // define a view function to see user struct fields
    function getUser(address _addr)
        public
        view
        returns (
            uint256,
            address,
            uint256[DEMAND_EXPIRATION_TIME] memory,
            uint16[DEMAND_EXPIRATION_TIME] memory,
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
