const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EtherDistributor contract", function () {

  this.beforeAll(async function () {
    this.EtherDistributor = await ethers.getContractFactory("EtherDistributor");
    this.epochCapacity = 100;
    this.epochDuration = 2000;
    this.deploymentValue = ethers.utils.parseEther("50.0");
    this.etherDistributor = await this.EtherDistributor.deploy(this.epochCapacity, this.epochDuration, { value: this.deploymentValue });
    await this.etherDistributor.deployed();
  });

  describe("Deployment", function () {
    it("Should assign the deployer as owner", async function () {
      const [owner, _] = await ethers.getSigners();
      expect(await this.etherDistributor.owner()).to.equal(owner.address);
    });

    it("Should deploy with the correct amount of Ethers", async function () {
      expect(await ethers.provider.getBalance(this.etherDistributor.address)).to.equal(this.deploymentValue);
    });

    it("Should deploy with the correct epoch capacity & duration", async function () {
      expect(await this.etherDistributor.epochCapacity()).to.equal(this.epochCapacity);
      expect(await this.etherDistributor.epochDuration()).to.equal(this.epochDuration);
    });
  });

  describe("User Registration", function () {
    it("Should add 5 permissioned users", async function () {
      const accounts = await ethers.getSigners();
      
      // register accounts 1-5, 0 is the owner
      for (i = 1; i < 6; i++) {
        await this.etherDistributor.addPermissionedUser(accounts[i].address);
      }

      // check that 5 users are registered
      expect(await this.etherDistributor.numberOfUsers()).to.equal(5);

      // check that 5 users are registered with the correct data
      for (i = 1; i < 6; i++) {
        const user =  await this.etherDistributor.permissionedAddresses((accounts[i].address)) 
        expect(user.id).to.equal(i);
        expect(user.addr).to.equal(accounts[i].address);
      }

      // check that some random accounts are not registered
      for (i = 6; i < 10; i++) {
        const user =  await this.etherDistributor.permissionedAddresses((accounts[i].address)) 
        expect(user.id).to.equal(0);
        expect(user.addr).to.equal("0x0000000000000000000000000000000000000000");
      }
    });

    it("Should fail while adding a user that is already registered", async function () {
      const accounts = await ethers.getSigners();
      await expect(this.etherDistributor.addPermissionedUser(accounts[1].address)).to.be.revertedWith("User already exists.");
    });

    it("Should fail when someone other than the owner tries to register a user", async function () {
      const accounts = await ethers.getSigners();
      await expect(this.etherDistributor.connect(accounts[1]).addPermissionedUser(accounts[9].address)).to.be.revertedWith("Only owner can call this function.");
    });
  });
});