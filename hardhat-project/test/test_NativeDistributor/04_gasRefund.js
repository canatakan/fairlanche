const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const { deployNativeDistributor } = require("../test_utils/utils");

const {
    DEFAULT_EPOCH_DURATION,
    DEFAULT_DEPLOYMENT_VALUE,
} = require("../test_utils/config");

describe("NativeDistributor gas refunds", function () {

    let nativeDistributor;

    this.beforeAll(async function () {
        ({ nativeDistributor } = await deployNativeDistributor());
    });

    describe("Deposit & withdrawals", function () {

        it("Should allow the owner send Ether to GasRefunder", async function () {
            let [owner, _] = await ethers.getSigners();
            await owner.sendTransaction({
                to: nativeDistributor.address,
                value: ethers.utils.parseEther("1"),
            });
            expect(await ethers.provider.getBalance(nativeDistributor.address)).
                to.equal(
                    ethers.utils.parseEther("1").add(
                        ethers.utils.parseEther(DEFAULT_DEPLOYMENT_VALUE.toString())
                    )
                );
            expect(await nativeDistributor.refundAllocation()).
                to.equal(ethers.utils.parseEther("1"));
        });

        it("Should allow the owner withdraw Ether from GasRefunder", async function () {
            let [owner, _] = await ethers.getSigners();
            let balanceBefore = await ethers.provider.getBalance(owner.address);
            let tx = await nativeDistributor.withdrawRefundAllocation(
                ethers.utils.parseEther("0.4")
            );

            let txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
            let gasUsed = txReceipt.gasUsed;
            let gasPrice = tx.gasPrice;
            let gasCost = gasUsed.mul(gasPrice);

            expect(await ethers.provider.getBalance(owner.address)).
                to.equal(
                    balanceBefore.add(ethers.utils.parseEther("0.4")).sub(
                        gasCost
                    )
                );
            expect(await nativeDistributor.refundAllocation()).
                to.equal(ethers.utils.parseEther("0.6"));
        });

        it("Should not allow withdrawals more than refundAllocation", async function () {
            await expect(
                nativeDistributor.withdrawRefundAllocation(
                    ethers.utils.parseEther("0.7")
                )
            ).to.be.revertedWith(
                "GasRefunder: You cannot withdraw more than the refund allocation"
            );
        });

        it("Should not allow other accounts to deposit to GasRefunder", async function () {
            let [_, other] = await ethers.getSigners();
            await expect(
                other.sendTransaction({
                    to: nativeDistributor.address,
                    value: ethers.utils.parseEther("0.1"),
                })
            ).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("Should not allow other accounts to withdraw from GasRefunder", async function () {
            let [_, other] = await ethers.getSigners();
            await expect(
                nativeDistributor.connect(other).withdrawRefundAllocation(
                    ethers.utils.parseEther("0.1")
                )
            ).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });
    });

    describe("Refund claims", function () {

        it("Should allow a user to claim their gas refund", async function () {
            let [_, user] = await ethers.getSigners();
            await nativeDistributor.addPermissionedUser(user.address);
            mine(DEFAULT_EPOCH_DURATION); // move to the next epoch

            let balanceBefore = await ethers.provider.getBalance(user.address);

            // a demand will trigger updateState()
            let tx = await nativeDistributor.connect(user).demand(1);
            let txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
            let gasUsed = txReceipt.gasUsed;
            let gasPrice = tx.gasPrice;
            let gasCost = gasUsed.mul(gasPrice);

            // refund is not zero & a little less than the total gas cost
            let refund = await nativeDistributor.refunds(user.address)
            expect(refund).to.not.equal(0);
            expect(refund).to.be.lt(gasCost);

            // claim the refund
            tx = await nativeDistributor.connect(user).claimRefund();
            txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
            gasUsed = txReceipt.gasUsed;
            gasPrice = tx.gasPrice;
            gasCost = gasCost.add(gasUsed.mul(gasPrice));

            // refund is now zero
            expect(await nativeDistributor.refunds(user.address)).
                to.equal(0);

            // refund allocation is reduced by the refund
            expect(await nativeDistributor.refundAllocation()).
                to.equal(
                    ethers.utils.parseEther("0.6").sub(refund)
                );

            // balance is increased by the refund
            expect(await ethers.provider.getBalance(user.address)).
                to.equal(
                    balanceBefore.add(refund).sub(gasCost)
                );
        });

        it("Should revert for users without a refund", async function () {
            let [owner, _, other] = await ethers.getSigners();
            await expect(
                nativeDistributor.connect(other).claimRefund()
            ).to.be.revertedWith(
                "GasRefunder: No refund available"
            );
        });
    });
});