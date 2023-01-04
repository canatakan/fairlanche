// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IResourceDistributor {
    function deposit(uint256 _amount) external;

    function withdrawExpired() external;

    function burnExpired() external;

    function demand(uint16 volume) external;

    function claim(uint256 epochNumber) external;

    function claimBulk(uint256[] memory epochNumbers) external;
}
