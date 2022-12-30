//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IAllowList.sol";
import "./AllowList.sol";

/**
 * @title DeploymentList
 * @dev This contract can be used to manage contract deployment permissions.
 */
contract DeploymentList is AllowList {
    // admins and enabled addresses for contract deployment are stored here:
    address constant DEPLOYER_LIST = 0x0200000000000000000000000000000000000000;

    constructor() AllowList(DEPLOYER_LIST) {}
}
