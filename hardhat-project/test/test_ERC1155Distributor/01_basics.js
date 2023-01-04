const { expect } = require("chai");
const { ethers } = require("hardhat");

const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const { deployERC1155Distributor, deployERC1155Resource } = require("../test_utils/utils");

const {
    DEFAULT_EPOCH_CAPACITY,
    DEFAULT_EPOCH_DURATION,
    DEFAULT_EXPIRATION_BLOCKS,
} = require("../test_utils/config");


describe("ERC1155Distributor basics", function () {

    let erc1155Resource;
    let erc1155Distributor;

    this.beforeAll(async function () {
        ({ erc1155Resource } = await deployERC1155Resource());
        ({ erc1155Distributor } = await deployERC1155Distributor(
            { _tokenContract: erc1155Resource.address })
        )
    });

    describe("Resource Contract Deployment", function () {
        it("Should assign the deployer as owner", async function () {
            let [owner, _] = await ethers.getSigners();
            expect(await erc1155Resource.owner()).to.equal(owner.address);
        });

        it("Should mint 3 * 100,000 tokens to the owner", async function () {
            let [owner, _] = await ethers.getSigners();
            for (let i = 0; i < 3; i++) {
                expect(await erc1155Resource.balanceOf(owner.address, i))
                    .to.equal(100_000);
            }
        });
    });

    describe("Distributor Deployment", function () {
        it("Should assign the deployer as owner", async function () {
            let [owner, _] = await ethers.getSigners();
            expect(await erc1155Distributor.owner()).to.equal(owner.address);
        });

        it("Should deploy with the correct parameters", async function () {
            expect(await erc1155Distributor.epochCapacity())
                .to.equal(DEFAULT_EPOCH_CAPACITY);
            expect(await erc1155Distributor.epochDuration())
                .to.equal(DEFAULT_EPOCH_DURATION);
            expect(await erc1155Distributor.expirationBlocks())
                .to.equal(DEFAULT_EXPIRATION_BLOCKS);

        });

        it("Should not define distribution end block", async function () {
            expect(await erc1155Distributor.distributionEndBlock())
                .to.equal(0);
        });

        it("Should disable ether multiplier", async function () {
            expect(await erc1155Distributor.etherMultiplier())
                .to.equal(1000);
        });
    });

    describe("Token deposit", function () {

        this.beforeAll(async function () {
            await mine(100);
        });

        it("Should deposit 100,000 tokens to the distributor", async function () {
            let [owner, _] = await ethers.getSigners();
            await erc1155Resource.connect(owner).setApprovalForAll(
                erc1155Distributor.address, true
            );
            await erc1155Distributor.connect(owner).deposit(
                100_000
            );
            expect(await erc1155Resource.balanceOf(erc1155Distributor.address, 0))
                .to.equal(100_000);
        });

        it("Should update block offset", async function () {
            expect(await erc1155Distributor.blockOffset())
                .to.equal(await ethers.provider.getBlockNumber());
        });

        it("Should calculate distribution & claim end block correctly", async function () {

            let deployedTokens = ethers.BigNumber.from(100_000);

            let distributionEndBlock;
            if (deployedTokens.mod(DEFAULT_EPOCH_CAPACITY).eq(0)) {
                distributionEndBlock = deployedTokens.div(DEFAULT_EPOCH_CAPACITY)
                    .mul(DEFAULT_EPOCH_DURATION);
            }
            else {
                distributionEndBlock = (deployedTokens.div(DEFAULT_EPOCH_CAPACITY)
                    .add(1)).mul(DEFAULT_EPOCH_DURATION);
            }

            distributionEndBlock = distributionEndBlock.add(
                await erc1155Distributor.blockOffset()
            );

            expect(await erc1155Distributor.distributionEndBlock())
                .to.equal(distributionEndBlock);
            expect(await erc1155Distributor.claimEndBlock())
                .to.equal(distributionEndBlock.add(DEFAULT_EXPIRATION_BLOCKS));
        });

    });
});