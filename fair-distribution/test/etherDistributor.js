const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("EtherDistributor");

    const hardhatToken = await Token.deploy();

    const owner_ = await hardhatToken.owner();
    expect(await hardhatToken.owner()).to.equal(owner_);
  });
});