const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EtherDistributor contract", function () {
  it("Should assign the deployer as owner", async function () {
    const [owner, _] = await ethers.getSigners();
    const EtherDistributor = await ethers.getContractFactory("EtherDistributor");
    const etherDistributor = await EtherDistributor.deploy();
    expect(await etherDistributor.owner()).to.equal(owner.address);
  });
});