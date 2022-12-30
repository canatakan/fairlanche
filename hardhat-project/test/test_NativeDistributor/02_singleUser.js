const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const { deployNativeDistributor } = require("../test_utils/utils");
const {
    DEFAULT_ETHER_MULTIPLIER,
} = require("../test_utils/config");

describe("Single user Demand & Claim", function () {

    let nativeDistributor;

    this.beforeAll(async function () {
        ({ nativeDistributor } = await deployNativeDistributor());
        let accounts = await ethers.getSigners();
        await nativeDistributor.addPermissionedUser(accounts[1].address);
    });

    describe("Demand", function () {
        // A non registered user makes a simple demand (should fail)
        it("Should fail when non-permissioned user tries to demand", async function () {
            let accounts = await ethers.getSigners();
            let user = accounts[2];
            let amount = 10;
            await expect(nativeDistributor.connect(user).demand(amount))
                .to.be.revertedWith("User does not have the permission.");
        });

        // A registered user makes a simple demand
        it("Should make simple demand", async function () {
            let accounts = await ethers.getSigners();
            let user = accounts[1];
            let amount = 10;
            await nativeDistributor.connect(user).demand(amount);
            let currentEpoch = await nativeDistributor.epoch();
            let userInfo = await nativeDistributor.getUser(user.address, [currentEpoch]);
            expect(userInfo[2][0]).to.equal(amount);
        });

        // A registered user makes a demand with a value greater than the maxDemandVolume
        it("Should fail for the demands with a value greater than the maxDemandVolume", async function () {
            let accounts = await ethers.getSigners();
            let user = accounts[1];
            let maxDemandVolume = await nativeDistributor.maxDemandVolume();
            await expect(nativeDistributor.connect(user).demand(maxDemandVolume + 1))
                .to.be.revertedWith("Invalid volume.");
        });

        // A registered user makes a demand with a value greater than the EPOCH_CAPACITY
        it("Should fail for the demands with a value greater than the epochCapacity", async function () {
            let accounts = await ethers.getSigners();
            let user = accounts[1];
            let epochCapacity = await nativeDistributor.epochCapacity();
            await expect(nativeDistributor.connect(user).demand(epochCapacity + 1))
                .to.be.revertedWith("Invalid volume.");
        });

        // A registered user makes another demand in the same epoch (should fail)
        it("Should fail when the user makes multiple demands in the same epoch", async function () {
            let accounts = await ethers.getSigners();
            let user = accounts[1];
            let amount = 10;
            await expect(nativeDistributor.connect(user).demand(amount))
                .to.be.revertedWith("Wait for the next epoch.");
        });

        // A registered user makes another demand in the next epoch
        it("Should be able to make another demand in Epoch 2", async function () {
            let accounts = await ethers.getSigners();
            let user = accounts[1];
            let amount = 10;
            await mine(await nativeDistributor.epochDuration());
            await nativeDistributor._updateState();
            await nativeDistributor.connect(user).demand(amount);
            let currentEpoch = await nativeDistributor.epoch();
            let userInfo = await nativeDistributor.getUser(user.address, [currentEpoch]);
            expect(userInfo[2][0]).to.equal(amount);
        });
    });

    describe("Claim single share", function () {

        it("Should be able to make the claim of Epoch 2", async function () {

            let accounts = await ethers.getSigners();
            let user = accounts[1];

            let userBalanceInitial = await ethers.provider.getBalance(user.address);

            let claimEpoch = 2;
            await mine(await nativeDistributor.epochDuration());
            await nativeDistributor._updateState();
            let userInfo = await nativeDistributor.getUser(user.address, [claimEpoch]);
            let epochShare = await nativeDistributor.shares(claimEpoch);
            let claimAmount = Math.min(userInfo[2][0], epochShare);

            // claim and get the transaction receipt
            let tx = await nativeDistributor.connect(user).claim(claimEpoch);
            let userBalance = await ethers.provider.getBalance(user.address);
            let txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
            let gasUsed = txReceipt.gasUsed;
            let gasPrice = tx.gasPrice;
            let gasCost = gasUsed.mul(gasPrice);

            let userInfoAfterClaim = await nativeDistributor.getUser(user.address, [claimEpoch]);
            expect(userInfoAfterClaim[2][0]).to.equal(0);

            // convert claim amount to wei
            let claimAmountWei = ethers.utils.parseEther(claimAmount.toString());
            // check the final user balance is equal to the initial balance + claim amount - gas cost
            expect(userBalance).to.equal(userBalanceInitial
                .add(claimAmountWei
                    .mul(DEFAULT_ETHER_MULTIPLIER).div(1000)
                ).sub(gasCost));
        });

        it("Should fail when the user tries to claim for the same epoch twice", async function () {
            let accounts = await ethers.getSigners();
            await expect(nativeDistributor.connect(accounts[1]).claim(2))
                .to.be.revertedWith("You do not have a demand for this epoch.");
        });

        it("Should fail when the user tries to claim after the contract is inactive", async function () {
            let accounts = await ethers.getSigners();
            let user = accounts[1];
            let claimEpoch = 1;
            let claimEndBlock = await nativeDistributor.claimEndBlock();
            await mine(claimEndBlock - (await ethers.provider.getBlockNumber()) + 1);
            await nativeDistributor._updateState();
            await expect(nativeDistributor.connect(user).claim(claimEpoch))
                .to.be.revertedWith("Claim period is over.");
        });
    });

});

describe("Single user Demand & Claim Bulk", function () {

    it("Should allow the user to make multiple demands then claim all", async function () {
        let { nativeDistributor } = await deployNativeDistributor();
        let accounts = await ethers.getSigners();
        let user = accounts[4];
        await nativeDistributor.addPermissionedUser(user.address);

        let currentEpoch = await nativeDistributor.epoch();
        expect(currentEpoch).to.equal(1);

        let amount = 10;
        let epochs = 5;
        let claimEpochs = [1, 2, 3, 4, 5];
        let claimAmounts = [10, 10, 10, 10, 10];

        // make demands in different epochs
        for (let i = 0; i < epochs; i++) {
            await nativeDistributor.connect(user).demand(amount);
            await mine(await nativeDistributor.epochDuration());
            await nativeDistributor._updateState();
        }

        let initialBalance = await ethers.provider.getBalance(user.address);

        let tx = await nativeDistributor.connect(user).claimBulk(claimEpochs);
        let finalBalance = await ethers.provider.getBalance(user.address);

        let txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
        let gasUsed = txReceipt.gasUsed;
        let gasPrice = tx.gasPrice;
        let gasCost = gasUsed.mul(gasPrice);


        let userInfoAfterClaim = await nativeDistributor.getUser(user.address, claimEpochs);
        for (let i = 0; i < epochs; i++) {
            expect(userInfoAfterClaim[2][i]).to.equal(0);
        }
        // convert claim amount to wei
        var claimAmountWei = ethers.utils.parseEther("0");
        for (let i = 0; i < epochs; i++) {
            claimAmountWei = claimAmountWei.add(ethers.utils.parseEther(claimAmounts[i].toString()));
        }

        // check the final user balance is equal to the initial balance + claim amount - gas cost
        expect(finalBalance).to.equal(initialBalance
            .add(
                claimAmountWei.mul(DEFAULT_ETHER_MULTIPLIER).div(1000)
            ).sub(gasCost));
    });

    it("Should allow the user to make demands in all epochs, then claim all", async function () {
        /**
         * 1000 ETH / 5 unit per epoch = 100 epochs
         */
        let { nativeDistributor } = await deployNativeDistributor(
            { _epochCapacity: 5, _value: ethers.utils.parseEther("500") }
        );
        let accounts = await ethers.getSigners();
        let user = accounts[8];
        await nativeDistributor.addPermissionedUser(user.address);

        let currentEpoch = await nativeDistributor.epoch();
        expect(currentEpoch).to.equal(1);


        let amount = 1;
        let epochs = 100;

        // make demands in different epochs
        for (let i = 0; i < epochs; i++) {
            await nativeDistributor.connect(user).demand(amount);
            await mine(await nativeDistributor.epochDuration());
            await nativeDistributor._updateState();
        }

        let demandArray = new Array(epochs);
        for (let i = 0; i < epochs; ++i) demandArray[i] = (i + 1);

        // expect the current epoch to be 101
        let currentEpochAfterDemand = await nativeDistributor.epoch();
        expect(currentEpochAfterDemand).to.equal(101);

        let userBalanceInitial = await ethers.provider.getBalance(user.address);

        let tx = await nativeDistributor.connect(user).claimBulk(demandArray);
        let userBalance = await ethers.provider.getBalance(user.address);

        let txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
        let gasUsed = txReceipt.gasUsed;
        let gasPrice = tx.gasPrice;
        let gasCost = gasUsed.mul(gasPrice);

        // check the final user balance is equal to the initial balance + claim amount (100) - gas cost  
        expect(userBalance).to.equal(userBalanceInitial
            .add(
                ethers.utils.parseEther("100")
                    .mul(DEFAULT_ETHER_MULTIPLIER).div(1000)
            ).sub(gasCost));
    });

    it("Should not allow the user to call claimBulk() after the claim period ends", async function () {
        /**
         * 10 ETH / 5 unit per epoch = 2 epochs
         */
        let { nativeDistributor } = await deployNativeDistributor({ _epochCapacity: 5, _expirationBlocks: 13, _value: ethers.utils.parseEther("10") });
        let accounts = await ethers.getSigners();
        let user = accounts[9];
        await nativeDistributor.addPermissionedUser(user.address);

        await nativeDistributor.connect(user).demand(1);
        await mine(await nativeDistributor.epochDuration());
        await nativeDistributor._updateState();

        await nativeDistributor.connect(user).demand(3);
        await mine(await nativeDistributor.epochDuration());
        await nativeDistributor._updateState();

        let currentEpoch = await nativeDistributor.epoch();
        expect(currentEpoch).to.equal(3);

        await mine(13); // claim period should definitely end

        expect(nativeDistributor.connect(user).claimBulk([1, 2])).to.be.revertedWith("Claim period is over.");
    });
});
