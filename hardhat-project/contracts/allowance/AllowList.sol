//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IAllowList.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// AllowList is a base contract to use AllowList precompile capabilities.
contract AllowList is Ownable {
  // Precompiled Allow List Contract Address
  IAllowList private allowList;

  uint256 constant STATUS_NONE = 0;
  uint256 constant STATUS_ENABLED = 1;
  uint256 constant STATUS_ADMIN = 2;

  constructor(address precompileAddr) Ownable() {
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

  function setAdmin(address addr) public virtual onlyOwner {
    _setAdmin(addr);
  }

  function _setAdmin(address addr) private {
    allowList.setAdmin(addr);
  }

  function setEnabled(address addr) public virtual onlyOwner {
    _setEnabled(addr);
  }

  function _setEnabled(address addr) private {
    allowList.setEnabled(addr);
  }

  function revoke(address addr) public virtual onlyOwner {
    _revoke(addr);
  }

  function _revoke(address addr) private {
    require(msg.sender != addr, "You cannot revoke your own role");
    allowList.setNone(addr);
  }
}