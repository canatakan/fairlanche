const { expect } = require("chai");
const { ethers } = require("hardhat");

const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");


const { deployNativeDistributor } = require("../test_utils/utils");
const {
    DEFAULT_EPOCH_CAPACITY,
    DEFAULT_EPOCH_DURATION,
    DEFAULT_ETHER_MULTIPLIER,
    DEFAULT_EXPIRATION_BLOCKS,
    DEFAULT_DEPLOYMENT_VALUE,
} = require("../test_utils/config");

describe("NativeDistributor contract basics", function () {

    let nativeDistributor;

    this.beforeAll(async function () {
        ({ nativeDistributor } = await deployNativeDistributor());
    });

    describe("Deployment", function () {
        it("Should assign the deployer as owner", async function () {
            let [owner, _] = await ethers.getSigners();
            expect(await nativeDistributor.owner()).to.equal(owner.address);
        });

        it("Should deploy with the correct amount of Ethers", async function () {
            expect(await ethers.provider.getBalance(nativeDistributor.address)).
                to.equal(ethers.utils.parseEther(DEFAULT_DEPLOYMENT_VALUE.toString()));
        });

        it("Should deploy with the correct epoch capacity & duration", async function () {
            expect(await nativeDistributor.epochCapacity()).
                to.equal(DEFAULT_EPOCH_CAPACITY);
            expect(await nativeDistributor.epochDuration()).
                to.equal(DEFAULT_EPOCH_DURATION);
        });

        it("Should calculate distribution & claim end block correctly", async function () {

            let deployedEthers = ethers.BigNumber.from(DEFAULT_DEPLOYMENT_VALUE)
                .mul(ethers.BigNumber.from(1000))
                .div(ethers.BigNumber.from(DEFAULT_ETHER_MULTIPLIER));

            let distributionEndBlock;
            if (deployedEthers.mod(DEFAULT_EPOCH_CAPACITY).eq(0)) {
                distributionEndBlock = deployedEthers.div(DEFAULT_EPOCH_CAPACITY)
                    .mul(DEFAULT_EPOCH_DURATION);
            }
            else {
                distributionEndBlock = (deployedEthers.div(DEFAULT_EPOCH_CAPACITY)
                    .add(1)).mul(DEFAULT_EPOCH_DURATION);
            }

            distributionEndBlock = distributionEndBlock.add(await nativeDistributor.blockOffset());

            expect(await nativeDistributor.distributionEndBlock())
                .to.equal(distributionEndBlock);
            expect(await nativeDistributor.claimEndBlock())
                .to.equal(distributionEndBlock.add(DEFAULT_EXPIRATION_BLOCKS));
        });
    });

    describe("User Registration", function () {
        it("Should add 5 permissioned users", async function () {
            let accounts = await ethers.getSigners();

            // register accounts 1-5, 0 is the owner
            for (i = 1; i < 6; i++) {
                await nativeDistributor.addPermissionedUser(accounts[i].address);
            }

            // check that 5 users are registered
            expect(await nativeDistributor.numberOfUsers()).to.equal(5);

            // check that 5 users are registered with the correct data
            for (i = 1; i < 6; i++) {
                let user = await nativeDistributor.permissionedAddresses((accounts[i].address))
                expect(user.id).to.equal(i);
                expect(user.addr).to.equal(accounts[i].address);
            }

            // check that some random accounts are not registered
            for (i = 6; i < 10; i++) {
                let user = await nativeDistributor.permissionedAddresses((accounts[i].address))
                expect(user.id).to.equal(0);
                expect(user.addr).to.equal("0x0000000000000000000000000000000000000000");
            }
        });

        it("Should fail while adding a user that is already registered", async function () {
            let accounts = await ethers.getSigners();
            await expect(nativeDistributor.addPermissionedUser(accounts[1].address)).
                to.be.revertedWith("User already exists.");
        });

        it("Should fail when someone other than the owner tries to register a user", async function () {
            let accounts = await ethers.getSigners();
            await expect(nativeDistributor.connect(accounts[1]).addPermissionedUser(accounts[9].address)).
                to.be.revertedWith("Only owner can call this function.");
        });
    });

    describe("Epochs", function () {
        it("Should start with epoch 1", async function () {
            expect(await nativeDistributor.epoch()).to.equal(1);
        });

        it("Should update epoch after epochDuration", async function () {
            // mine 1 epoch and update state
            await mine(await nativeDistributor.epochDuration());
            await nativeDistributor._updateState();

            // check if the desired time has actually passed
            let blockOffset = await nativeDistributor.blockOffset();
            let latestBlock = await time.latestBlock()
            let currentEpoch = parseInt((latestBlock - blockOffset) / DEFAULT_EPOCH_DURATION) + 1
            expect(currentEpoch).to.equal(2);

            // check that if the epoch has been updated in the contract storage
            expect(await nativeDistributor.epoch()).to.equal(currentEpoch);
        });

        it("Should update epoch after multiple epochDurations", async function () {
            // mine 5 epoch and update state
            await mine(await nativeDistributor.epochDuration() * 5);
            await nativeDistributor._updateState();

            // check if the desired time has actually passed
            let blockOffset = await nativeDistributor.blockOffset();
            let latestBlock = await time.latestBlock()
            let currentEpoch = parseInt((latestBlock - blockOffset) / DEFAULT_EPOCH_DURATION) + 1
            expect(currentEpoch).to.equal(7);

            // check that if the epoch has been updated in the contract storage
            expect(await nativeDistributor.epoch()).to.equal(currentEpoch);
        });

        it("Should not change epoch after blocks less than epochDuration", async function () {
            // mine blocks < epochDuration and update state
            await mine(22);
            await nativeDistributor._updateState();

            // check that if the epoch is changed in the contract storage
            expect(await nativeDistributor.epoch()).to.equal(7);
        });
    });
});