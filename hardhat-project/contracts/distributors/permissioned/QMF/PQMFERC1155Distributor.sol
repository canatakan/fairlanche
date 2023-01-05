// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "../../abstract/permissioned/PQMFResourceDistributor.sol";

contract PQMFERC1155Distributor is PQMFResourceDistributor, ERC1155Receiver {
    IERC1155 public token;
    uint256 public tokenId;
    uint256 public expirationBlocks;
    bool public hasDeposited;

    constructor(
        address _tokenContract,
        uint256 _tokenId,
        uint16 _maxDemandVolume,
        uint256 _epochCapacity,
        uint256 _epochDuration,
        uint16 _etherMultiplier,
        uint256 _expirationBlocks,
        bool _enableWithdraw
    )
        PQMFResourceDistributor(
            _maxDemandVolume,
            _epochCapacity,
            _epochDuration,
            _etherMultiplier,
            _expirationBlocks,
            _enableWithdraw
        )
    {
        token = IERC1155(_tokenContract);
        tokenId = _tokenId;
        expirationBlocks = _expirationBlocks;
        hasDeposited = false;
        etherMultiplier = 1000; // disable ether multiplier
    }

    modifier depositCompleted() {
        require(
            hasDeposited,
            "Token deposit is not done, the contract is not active."
        );
        _;
    }

    function deposit(uint256 _amount) public virtual override onlyOwner {
        require(!hasDeposited, "Token deposit is already done.");
        require(
            _amount >= epochCapacity,
            "The contract must be funded with at least one epoch capacity."
        );

        token.safeTransferFrom(msg.sender, address(this), tokenId, _amount, "");

        blockOffset = block.number; // the distribution will now start!
        hasDeposited = true;
        updateEndingBlock();
    }

    function updateEndingBlock() private {
        /**
         * This function is called after the token deposit by the owner.
         * This process is done only once.
         */

        uint256 deployedTokens = token.balanceOf(address(this), tokenId);
        if (deployedTokens % epochCapacity == 0) {
            distributionEndBlock = (block.number +
                (deployedTokens / epochCapacity) *
                epochDuration);
        } else {
            distributionEndBlock = (block.number +
                ((deployedTokens / epochCapacity) + 1) *
                epochDuration);
        }

        claimEndBlock = distributionEndBlock + expirationBlocks;
    }

    function calculateEndingBlock()
        internal
        view
        virtual
        override
        returns (uint256)
    {
        /**
         * This function is not used. The actual calculation
         * is done in the updateEndingBlock function and the
         * result is stored in the contract later on.
         */
        return 0;
    }

    function handleTransfer(
        address _receiver,
        uint256 _weiAmount
    ) internal virtual override {
        /** 
         * This function will be called by the parent contract,
         * after the share calculation. The call amount will be
         * in wei, so it needs to be converted for the ERC1155 token.
         */
        _handleTransfer(_receiver, _weiAmount / (1 ether));
    }

    function _handleTransfer(
        address _receiver,
        uint256 _amount
    ) private {
        token.safeTransferFrom(address(this), _receiver, tokenId, _amount, "");
    }

    function withdrawExpired() public override onlyOwner {
        require(enableWithdraw, "Withdraw is disabled.");
        require(
            block.number > claimEndBlock,
            "Wait for the end of the distribution."
        );
        _handleTransfer(msg.sender, token.balanceOf(address(this), tokenId));
    }

    function burnExpired() public override onlyOwner {
        require(
            block.number > claimEndBlock,
            "Wait for the end of the distribution."
        );
        _handleTransfer(address(0), token.balanceOf(address(this), tokenId));
    }

    /**
     * Override distribution functions to require deposit completion.
     * The distribution and state changes should not be allowed
     * before the token deposit is completed.
     */

    function demand(uint16 volume) public virtual override depositCompleted {
        super.demand(volume);
    }

    function claim(
        uint256 epochNumber
    ) public virtual override depositCompleted {
        super.claim(epochNumber);
    }

    function claimBulk(
        uint256[] memory epochNumbers
    ) public virtual override depositCompleted {
        super.claimBulk(epochNumbers);
    }

    function updateState() internal virtual override depositCompleted {
        super.updateState();
    }

    function calculateShare()
        internal
        view
        override
        depositCompleted
        returns (uint16 _share, uint256 _amount)
    {
        return super.calculateShare();
    }

    // overrides for accepting ERC1155 tokens
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
