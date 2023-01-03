// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./PResourceDistributor.sol";

contract PNativeDistributor is PResourceDistributor {
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
    {
        require(
            msg.value >= _epochCapacity * (_etherMultiplier * milliether),
            "The contract must be funded with at least one epoch capacity."
        );
    }

    function calculateEndingBlock()
        internal
        view
        virtual
        override
        returns (uint256)
    {
        uint256 deployedEthers = msg.value / (etherMultiplier * milliether);
        if (deployedEthers % epochCapacity == 0) {
            return (blockOffset +
                (deployedEthers / epochCapacity) *
                epochDuration);
        } else {
            return (blockOffset +
                ((deployedEthers / epochCapacity) + 1) *
                epochDuration);
        }
    }

    function handleTransfer(address _receiver, uint256 _amount)
        internal
        virtual
        override
    {
        (bool success, ) = _receiver.call{value: _amount}("");
        require(success, "Transfer failed.");
    }

    function withdrawExpired() public override onlyOwner {
        require(enableWithdraw, "Withdraw is disabled.");
        require(
            block.number > claimEndBlock,
            "Wait for the end of the distribution."
        );
        handleTransfer(msg.sender, address(this).balance);
    }

    function burnExpired() public override onlyOwner {
        require(
            block.number > claimEndBlock,
            "Wait for the end of the distribution."
        );
        selfdestruct(payable(address(0)));
    }

    function deposit(uint256) public virtual override onlyOwner {
        revert(
            "Deposits are not allowed for native asset distribution contracts."
        );
    }
}
