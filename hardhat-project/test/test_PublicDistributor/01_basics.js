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

describe("PublicDistributor contract basics", function () {

    let nativeDistributor;

    this.beforeAll(async function () {
        ({ nativeDistributor } = await deployNativeDistributor({ _isPublic: true }));
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