const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EtherDistributor contract", function () {

  this.beforeAll(async function () {
    this.EtherDistributor = await ethers.getContractFactory("EtherDistributor");
    this.deploymentValue = ethers.utils.parseEther("50.0");
    this.etherDistributor = await this.EtherDistributor.deploy({ value: this.deploymentValue });
    await this.etherDistributor.deployed();
    console.log("EtherDistributor deployed to:", this.etherDistributor.address);
  });

  describe("Deployment", function () {
    it("Should assign the deployer as owner", async function () {
      const [owner, _] = await ethers.getSigners();
      expect(await this.etherDistributor.owner()).to.equal(owner.address);
    });

    it("Should deploy with the correct amount of Ethers", async function () {
      expect(await ethers.provider.getBalance(this.etherDistributor.address)).to.equal(this.deploymentValue);
    });

  });

});