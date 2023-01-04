const { expect } = require("chai");
const { ethers } = require("hardhat");

const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const { deployERC1155Distributor, deployERC1155Resource } = require("../test_utils/utils");

const {
    DEFAULT_ERC1155_CONTRACT_ADDRESS,
    DEFAULT_EPOCH_DURATION,
} = require("../test_utils/config");

describe("ERC1155 transfers", function () {
    let erc1155Resource;
    let erc1155Distributor;

    this.beforeAll(async function () {
        if (DEFAULT_ERC1155_CONTRACT_ADDRESS === null){
            ({ erc1155Resource } = await deployERC1155Resource());
            ({ erc1155Distributor } = await deployERC1155Distributor(
                { _tokenContract: erc1155Resource.address })
            )
        }
        else {
            erc1155Resource = await ethers.getContractAt(
                "ERC20Resource",
                DEFAULT_ERC1155_CONTRACT_ADDRESS
            );
            ({ erc1155Distributor } = await deployERC1155Distributor());
        }

        let accounts = await ethers.getSigners();
        erc1155Distributor.addPermissionedUser(accounts[1].address);
        erc1155Distributor.addPermissionedUser(accounts[2].address);
        await mine(1);

        await erc1155Resource.connect(accounts[0]).setApprovalForAll(
            erc1155Distributor.address, true
        );
        await erc1155Distributor.connect(accounts[0]).deposit(
            100_000
        );
    });

    it("Should handle transfer correctly after claim", async function () {
        let accounts = await ethers.getSigners();
        await erc1155Distributor.connect(accounts[1]).demand(5);
        await mine(DEFAULT_EPOCH_DURATION);
        await erc1155Distributor.connect(accounts[1]).claim(1);
        expect(await erc1155Resource.balanceOf(accounts[1].address, 0))
            .to.equal(5);
    });

    it("Should handle multiple transfers correctly", async function () {
        let accounts = await ethers.getSigners();
        await erc1155Distributor.connect(accounts[2]).demand(5);
        await mine(DEFAULT_EPOCH_DURATION);
        await erc1155Distributor.connect(accounts[2]).demand(10);
        await mine(DEFAULT_EPOCH_DURATION);
        await erc1155Distributor.connect(accounts[2]).demand(15);
        await mine(DEFAULT_EPOCH_DURATION);
        await erc1155Distributor.connect(accounts[2]).claim(2);
        await erc1155Distributor.connect(accounts[2]).claim(3);
        await erc1155Distributor.connect(accounts[2]).claim(4);
        expect(await erc1155Resource.balanceOf(accounts[2].address, 0))
            .to.equal(30);
    });
});
