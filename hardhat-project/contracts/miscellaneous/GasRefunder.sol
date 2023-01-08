// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

contract GasRefunder is Ownable {
    event Refund(address indexed _to, uint256 _amount);

    mapping(address => uint256) public refunds;
    uint256 public refundAllocation;

    constructor() {}

    receive() external payable onlyOwner {
        refundAllocation += msg.value;
    }

    function withdrawRefundAllocation(uint256 amount) external onlyOwner {
        require(
            refundAllocation >= amount,
            "GasRefunder: You cannot withdraw more than the refund allocation"
        );
        refundAllocation -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdraw failed");
    }

    function claimRefund() external {
        uint256 amount = refunds[msg.sender];
        require(amount > 0, "GasRefunder: No refund available");
        require(
            refundAllocation >= amount,
            "GasRefunder: Refund allocation is insufficient"
        );
        refundAllocation -= amount;
        refunds[msg.sender] = 0;
        emit Refund(msg.sender, amount);
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund failed");
    }
}
