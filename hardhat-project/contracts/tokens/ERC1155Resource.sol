// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/// @custom:security-contact can.ugur@boun.edu.tr
contract ERC1155Resource is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply {
    string public name;
    string public symbol;

    uint256[] public maximumSupplies;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _uri,
        uint256[] memory _premintIds,
        uint256[] memory _premintAmounts,
        uint256[] memory _maximumSupplies
    ) ERC1155(_uri) {
        name = _name;
        symbol = _symbol;
        maximumSupplies = _maximumSupplies;
        _mintBatch(msg.sender, _premintIds, _premintAmounts, "");
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        require(
            amount + totalSupply(id) <= maximumSupplies[id],
            "ERC1155Resource: mint amount exceeds maximum supply"
        );
        _mint(account, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOwner {
        for (uint256 i = 0; i < ids.length; i++) {
            require(
                amounts[i] + totalSupply(ids[i]) <= maximumSupplies[ids[i]],
                "ERC1155Resource: mint amount exceeds maximum supply"
            );
        }
        _mintBatch(to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
