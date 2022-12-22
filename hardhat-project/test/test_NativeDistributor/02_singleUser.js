const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const { deployDistributor } = require("../test_utils/utils");
const {
    DEFAULT_EPOCH_DURATION,
    DEFAULT_ETHER_MULTIPLIER,
} = require("../test_utils/constants");

describe("Single user", function () {

    let nativeDistributor;

    this.beforeAll(async function () {
        ({ nativeDistributor } = await deployDistributor());
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
            // Last Demand Epoch: console.log("User info: ", userInfo[4]);
        });

        // A registered user makes a demand with a value greater than the maxDemandVolume
        it("Should fail for the demands with a value greater than the maxDemandVolume", async function () {
            let accounts = await ethers.getSigners();
            let user = accounts[1];
            let maxDemandVolume = await nativeDistributor.maxDemandVolume();
            await expect(nativeDistributor.connect(user).demand(maxDemandVolume + 1)).to.be.revertedWith("Invalid volume.");
        });

        // A registered user makes a demand with a value greater than the EPOCH_CAPACITY
        it("Should fail for the demands with a value greater than the epochCapacity", async function () {
            let accounts = await ethers.getSigners();
            let user = accounts[1];
            let epochCapacity = await nativeDistributor.epochCapacity();
            await expect(nativeDistributor.connect(user).demand(epochCapacity + 1)).to.be.revertedWith("Invalid volume.");
        });

        // A registered user makes another demand in the same epoch (should fail)
        it("Should fail when the user makes multiple demands in the same epoch", async function () {
            let accounts = await ethers.getSigners();
            let user = accounts[1];
            let amount = 10;
            await expect(nativeDistributor.connect(user).demand(amount)).to.be.revertedWith("Wait for the next epoch.");
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
        // A registered user makes a claim of what he/she has demanded in epoch 2
        it("Should be able to make the claim of Epoch 2", async function () {

            let accounts = await ethers.getSigners();
            let user = accounts[1];

            let userBalanceInitial = await ethers.provider.getBalance(user.address);

            let claimEpoch = 2;
            await mine(await nativeDistributor.epochDuration());
            await nativeDistributor._updateState();
            let userInfo = await nativeDistributor.getUser(user.address, [claimEpoch]);
            let epochShare = await nativeDistributor.shares(claimEpoch);
            //console.log("Epoch share: ", epochShare); #Correct
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
            expect(userBalance).to.equal(userBalanceInitial.add(claimAmountWei).sub(gasCost));

        });

        it("Should fail when the user tries to claim for the same epoch twice", async function () {
            let accounts = await ethers.getSigners();
            await expect(nativeDistributor.connect(accounts[1]).claim(2)).to.be.revertedWith("You do not have a demand for this epoch.");
        });

        // A registered user makes the claim of what he/she has demanded in epoch 1 after DEMAND_EXPIRATION_TIME + 1 (should fail)
        it("Should fail when the user tries to claim after the DEMAND_EXPIRATION_TIME", async function () {
            let accounts = await ethers.getSigners();
            let user = accounts[1];
            let claimEpoch = 1;
            let DEMAND_EXPIRATION_TIME = await nativeDistributor.DEMAND_EXPIRATION_TIME();
            await mine((DEMAND_EXPIRATION_TIME + 1) * await nativeDistributor.epochDuration());
            await nativeDistributor._updateState();
            await expect(nativeDistributor.connect(user).claim(claimEpoch)).to.be.revertedWith("Epoch is too old.");
        });
    });

    describe("Claim all shares", function () {
        // A registered user makes multiple demands in different epochs first, then after some epoch he/she calls claimAll function
        it("Should allow the user to make multiple demands then claim all", async function () {
            ({ nativeDistributor } = await deployDistributor());
            let accounts = await ethers.getSigners();
            let user = accounts[4];
            await nativeDistributor.addPermissionedUser(user.address);

            let currentEpoch = await nativeDistributor.epoch();
            expect(currentEpoch).to.equal(1);

            let initialBalance = await ethers.provider.getBalance(user.address);
            expect(initialBalance).to.equal(ethers.utils.parseEther("10000"));

            let amount = 10;
            let epochs = 5;
            let claimEpochs = [2, 3, 4, 5, 6];
            let claimAmounts = [10, 10, 10, 10, 10];

            // make demands in different epochs
            for (let i = 0; i < epochs; i++) {
                await nativeDistributor.connect(user).demand(amount);
                await mine(await nativeDistributor.epochDuration());
                await nativeDistributor._updateState();
            }

            await mine(50 * await nativeDistributor.epochDuration());
            await nativeDistributor._updateState();

            let userBalanceInitial = await ethers.provider.getBalance(user.address);

            let tx = await nativeDistributor.connect(user).claimAll();
            let userBalance = await ethers.provider.getBalance(user.address);

            let txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
            let gasUsed = txReceipt.gasUsed;
            let gasPrice = tx.gasPrice;
            let gasCost = gasUsed.mul(gasPrice);

            let userInfoAfterClaim = await nativeDistributor.getUser(user.address);

            for (let i = 0; i < epochs; i++) {
                expect(userInfoAfterClaim[3][claimEpochs[i]]).to.equal(0);
            }
            // convert claim amount to wei
            var claimAmountWei = ethers.utils.parseEther("0");
            for (let i = 0; i < epochs; i++) {
                claimAmountWei = claimAmountWei.add(ethers.utils.parseEther(claimAmounts[i].toString()));
                //console.log("claimAmountWei: ", claimAmountWei.toString());
            }
            // check the final user balance is equal to the initial balance + claim amount - gas cost
            expect(userBalance).to.equal(userBalanceInitial.add(claimAmountWei).sub(gasCost));
        });

        // A registered user makes multiple demands in epochs 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, and 120.
        //  Then he/she calls claimAll function at epoch 130. Should be able to claim only last 100 epochs' demands.
        it("Should not include expired demands in claimAll()", async function () {
            let customDeploymentParams = {
                epochDuration: 10,
                demandExpirationTime: 100,
            };

            ({ nativeDistributor } = await deployDistributor(3, DEFAULT_EPOCH_DURATION, 600, false));
            let accounts = await ethers.getSigners();
            let user = accounts[10];
            await nativeDistributor.addPermissionedUser(user.address);

            let currentEpoch = await nativeDistributor.epoch();
            expect(currentEpoch).to.equal(1);

            let initialBalance = await ethers.provider.getBalance(user.address);
            expect(initialBalance).to.equal(ethers.utils.parseEther("10000"));

            let amount = 2;
            let epochs = 12;

            // make demands in different epochs
            for (let i = 0; i < epochs; i++) {
                await mine(10 * await nativeDistributor.epochDuration());
                await nativeDistributor._updateState();
                await nativeDistributor.connect(user).demand(amount); // 11, 21, 31, 41, 51, 61, 71, 81, 91, 101, 111, 121 ...
            }

            await mine(55 * await nativeDistributor.epochDuration()); // claimAll at epoch 176
            await nativeDistributor._updateState();

            let currentEpochAfterDemand = await nativeDistributor.epoch();
            expect(currentEpochAfterDemand).to.equal(176);

            //console.log("currentEpochAfterDemand: ", currentEpochAfterDemand.toString());

            let userBalanceInitial = await ethers.provider.getBalance(user.address);
            //console.log("userBalanceInitial: ", userBalanceInitial.toString());

            let tx = await nativeDistributor.connect(user).claimAll();
            let userBalance = await ethers.provider.getBalance(user.address);
            // ClaimAll at epoch 176 so should only get demands from epoch 76 to 176 which includes 81, 91, 101, 111, 121. (=> 50)

            let txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
            let gasUsed = txReceipt.gasUsed;
            let gasPrice = tx.gasPrice;
            let gasCost = gasUsed.mul(gasPrice);

            // check the final user balance is equal to the initial balance + claim amount ( 5 * 2 = 10) - gas cost
            expect(userBalance).to.equal(userBalanceInitial.add(ethers.utils.parseEther("10")).sub(gasCost));
        });

        // A registered user makes 100 demands starting from epoch 1 to epoch 100. Then he/she calls claimAll function at epoch 101. Should be able to claim all demands.
        it("Should allow the user to make max number of demands then claim all", async function () {
            ({ nativeDistributor } = await deployDistributor(5, DEFAULT_EPOCH_DURATION, 1000, false));
            let accounts = await ethers.getSigners();
            let user = accounts[8];
            await nativeDistributor.addPermissionedUser(user.address);

            let currentEpoch = await nativeDistributor.epoch();
            expect(currentEpoch).to.equal(1);

            let initialBalance = await ethers.provider.getBalance(user.address);
            expect(initialBalance).to.equal(ethers.utils.parseEther("10000"));

            let amount = 1;
            let epochs = 100;

            // make demands in different epochs
            for (let i = 0; i < epochs; i++) {
                await nativeDistributor.connect(user).demand(amount);
                await mine(await nativeDistributor.epochDuration());
                await nativeDistributor._updateState();
            }
            //printUserInfo demand array
            //console.log("demand array: ", (await nativeDistributor.getUser(user.address))[3]);
            // expect the current epoch to be 101
            let currentEpochAfterDemand = await nativeDistributor.epoch();
            expect(currentEpochAfterDemand).to.equal(101);

            let userBalanceInitial = await ethers.provider.getBalance(user.address);

            let tx = await nativeDistributor.connect(user).claimAll();
            let userBalance = await ethers.provider.getBalance(user.address);

            let txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
            let gasUsed = txReceipt.gasUsed;
            let gasPrice = tx.gasPrice;
            let gasCost = gasUsed.mul(gasPrice);
            // print users demand array
            let userInfoAfterClaim = await nativeDistributor.getUser(user.address);
            //console.log("userInfoAfterClaim: ", userInfoAfterClaim[3]);

            // check the final user balance is equal to the initial balance + claim amount (100) - gas cost  
            expect(userBalance).to.equal(userBalanceInitial.add(ethers.utils.parseEther("99")).sub(gasCost));
        });
    });

});
