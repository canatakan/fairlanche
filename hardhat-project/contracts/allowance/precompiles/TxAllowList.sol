//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AllowListViewer.sol";

contract TxAllowList is AllowListViewer {
    // admins and enabled addresses for transactions are stored here:
    address constant TRANSACTOR_LIST =
        0x0200000000000000000000000000000000000002;

    constructor() AllowListViewer(TRANSACTOR_LIST) {}
}
