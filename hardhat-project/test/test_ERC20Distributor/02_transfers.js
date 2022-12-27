const { expect } = require("chai");
const { ethers } = require("hardhat");

const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const { deployERC20Distributor, deployERC20Resource } = require("../test_utils/utils");

const {
    DEFAULT_EPOCH_DURATION,
    DEFAULT_ETHER_MULTIPLIER,
} = require("../test_utils/config");


describe("ERC20Distributor transfers", function () {

    let erc20Resource;
    let erc20Distributor;

    this.beforeAll(async function () {
        ({ erc20Resource } = await deployERC20Resource());
        ({ erc20Distributor } = await deployERC20Distributor(
            { _tokenContract: erc20Resource.address })
        )

        let accounts = await ethers.getSigners();
        erc20Distributor.addPermissionedUser(accounts[1].address);
        erc20Distributor.addPermissionedUser(accounts[2].address);
        await mine(1);

        await erc20Resource.approve(erc20Distributor.address, ethers.utils.parseEther("100000"));
        await erc20Distributor.deposit(ethers.utils.parseEther("100000"));
    });

    it("Should handle transfer correctly after claim", async function () {
        let accounts = await ethers.getSigners();
        await erc20Distributor.connect(accounts[1]).demand(5);
        await mine(DEFAULT_EPOCH_DURATION);
        await erc20Distributor.connect(accounts[1]).claim(1);
        expect(await erc20Resource.balanceOf(accounts[1].address))
            .to.equal(
                ethers.utils.parseEther("5").
                    mul(DEFAULT_ETHER_MULTIPLIER).div(1000)
            );
    });

    it("Should handle multiple transfers correctly", async function () {
        let accounts = await ethers.getSigners();
        await erc20Distributor.connect(accounts[2]).demand(5);
        await mine(DEFAULT_EPOCH_DURATION);
        await erc20Distributor.connect(accounts[2]).demand(10);
        await mine(DEFAULT_EPOCH_DURATION);
        await erc20Distributor.connect(accounts[2]).demand(15);
        await mine(DEFAULT_EPOCH_DURATION);
        await erc20Distributor.connect(accounts[2]).claim(2);
        await erc20Distributor.connect(accounts[2]).claim(3);
        await erc20Distributor.connect(accounts[2]).claim(4);
        expect(await erc20Resource.balanceOf(accounts[2].address))
            .to.equal(
                ethers.utils.parseEther("30").
                    mul(DEFAULT_ETHER_MULTIPLIER).div(1000)
            );
    });
});