//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AllowList.sol";

/**
 * @title TxAllowList
 * @dev This contract can be used to manage transaction permissions.
 */
contract TxAllowList is AllowList {
    // admins and enabled addresses for transactions are stored here:
    address constant TRANSACTOR_LIST =
        0x0200000000000000000000000000000000000002;

    constructor() AllowList(TRANSACTOR_LIST) {}
}
