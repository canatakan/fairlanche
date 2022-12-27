const { expect } = require("chai");
const { ethers } = require("hardhat");

const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const { deployERC20Distributor, deployERC20Resource } = require("../test_utils/utils");

const {
    DEFAULT_EPOCH_CAPACITY,
    DEFAULT_EPOCH_DURATION,
    DEFAULT_ETHER_MULTIPLIER,
    DEFAULT_EXPIRATION_BLOCKS,
} = require("../test_utils/config");


describe("ERC20Distributor basics", function () {

    let erc20Resource;
    let erc20Distributor;

    this.beforeAll(async function () {
        ({ erc20Resource } = await deployERC20Resource());
        ({ erc20Distributor } = await deployERC20Distributor(
            { _tokenContract: erc20Resource.address })
        )
    });

    describe("Resource Contract Deployment", function () {
        it("Should assign the deployer as owner", async function () {
            let [owner, _] = await ethers.getSigners();
            expect(await erc20Resource.owner()).to.equal(owner.address);
        });

        it("Should mint 100,000 tokens to the distributor", async function () {
            let [owner, _] = await ethers.getSigners();
            expect(await erc20Resource.balanceOf(owner.address))
                .to.equal(ethers.utils.parseEther("100000"));
        });
    });

    describe("Distributor Deployment", function () {
        it("Should assign the deployer as owner", async function () {
            let [owner, _] = await ethers.getSigners();
            expect(await erc20Distributor.owner()).to.equal(owner.address);
        });

        it("Should deploy with the correct parameters", async function () {
            expect(await erc20Distributor.epochCapacity())
                .to.equal(DEFAULT_EPOCH_CAPACITY);
            expect(await erc20Distributor.epochDuration())
                .to.equal(DEFAULT_EPOCH_DURATION);
            expect(await erc20Distributor.etherMultiplier())
                .to.equal(DEFAULT_ETHER_MULTIPLIER);
            expect(await erc20Distributor.expirationBlocks())
                .to.equal(DEFAULT_EXPIRATION_BLOCKS);
            expect(await erc20Distributor.token())
                .to.equal(erc20Resource.address);
        });

        it("Should not define distribution end block", async function () {
            expect(await erc20Distributor.distributionEndBlock())
                .to.equal(0);
        });
    });

    describe("Token deposit", function () {

        this.beforeAll(async function () {
            await mine(100);
        });

        it("Should deposit 100,000 tokens to the distributor", async function () {
            let [owner, _] = await ethers.getSigners();
            await erc20Resource.connect(owner).approve(
                erc20Distributor.address, ethers.utils.parseEther("100000")
            );
            await erc20Distributor.connect(owner).deposit(
                ethers.utils.parseEther("100000")
            );
            expect(await erc20Resource.balanceOf(erc20Distributor.address))
                .to.equal(ethers.utils.parseEther("100000"));
        });

        it("Should update block offset", async function () {
            expect(await erc20Distributor.blockOffset())
                .to.equal(await ethers.provider.getBlockNumber());
        });

        it("Should calculate distribution & claim end block correctly", async function () {

            let deployedEthers = ethers.BigNumber.from(100000)
                .mul(ethers.BigNumber.from(1000))
                .div(ethers.BigNumber.from(DEFAULT_ETHER_MULTIPLIER));

            let distributionEndBlock;
            if (deployedEthers.mod(DEFAULT_EPOCH_CAPACITY).eq(0)) {
                distributionEndBlock = deployedEthers.div(DEFAULT_EPOCH_CAPACITY)
                    .mul(DEFAULT_EPOCH_DURATION);
            }
            else {
                distributionEndBlock = (deployedEthers.div(DEFAULT_EPOCH_CAPACITY)
                    .add(1)).mul(DEFAULT_EPOCH_DURATION).add(1);
            }

            distributionEndBlock = distributionEndBlock.add(await erc20Distributor.blockOffset());

            expect(await erc20Distributor.distributionEndBlock())
                .to.equal(distributionEndBlock);
            expect(await erc20Distributor.claimEndBlock())
                .to.equal(distributionEndBlock.add(DEFAULT_EXPIRATION_BLOCKS));
        });

    });
});