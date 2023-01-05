//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IAllowList.sol";

/// A view contract for the precompiled AllowList contract
contract AllowListViewer {
  // Precompiled Allow List Contract Address
  IAllowList private allowList;

  uint256 constant STATUS_NONE = 0;
  uint256 constant STATUS_ENABLED = 1;
  uint256 constant STATUS_ADMIN = 2;

  constructor(address precompileAddr) {
    allowList = IAllowList(precompileAddr);
  }

  modifier onlyEnabled() {
    require(isEnabled(msg.sender), "The address is not enabled");
    _;
  }

  modifier onlyAdmin() {
    require(isAdmin(msg.sender), "The address is not an admin");
    _;
  }

  function isAdmin(address addr) public view returns (bool) {
    uint256 result = allowList.readAllowList(addr);
    return result == STATUS_ADMIN;
  }

  function isEnabled(address addr) public view returns (bool) {
    uint256 result = allowList.readAllowList(addr);
    return result != STATUS_NONE;
  }

}