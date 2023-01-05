//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AllowListViewer.sol";

contract DeploymentList is AllowListViewer {
    // admins and enabled addresses for contract deployment are stored here:
    address constant DEPLOYER_LIST = 0x0200000000000000000000000000000000000000;

    constructor() AllowListViewer(DEPLOYER_LIST) {}
}
