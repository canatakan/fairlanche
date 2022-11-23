const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, mine, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");


describe("EtherDistributor contract basics", function () {

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
        const user = await this.etherDistributor.permissionedAddresses((accounts[i].address))
        expect(user.id).to.equal(i);
        expect(user.addr).to.equal(accounts[i].address);
      }

      // check that some random accounts are not registered
      for (i = 6; i < 10; i++) {
        const user = await this.etherDistributor.permissionedAddresses((accounts[i].address))
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

  describe("Epochs", function () {
    it("Should start with epoch 1", async function () {
      expect(await this.etherDistributor.epoch()).to.equal(1);
    });

    it("Should update epoch after epochDuration", async function () {
      // mine 1 epoch and update state
      await mine(await this.etherDistributor.epochDuration());
      await this.etherDistributor._updateState();

      // check if the desired time has actually passed
      const blockOffset = await this.etherDistributor.blockOffset();
      const latestBlock = await time.latestBlock()
      const currentEpoch = parseInt((latestBlock - blockOffset) / this.epochDuration) + 1
      expect(currentEpoch).to.equal(2);

      // check that if the epoch has been updated in the contract storage
      expect(await this.etherDistributor.epoch()).to.equal(currentEpoch);
    });

    it("Should update epoch after multiple epochDurations", async function () {
      // mine 5 epoch and update state
      await mine(await this.etherDistributor.epochDuration() * 5);
      await this.etherDistributor._updateState();

      // check if the desired time has actually passed
      const blockOffset = await this.etherDistributor.blockOffset();
      const latestBlock = await time.latestBlock()
      const currentEpoch = parseInt((latestBlock - blockOffset) / this.epochDuration) + 1
      expect(currentEpoch).to.equal(7);

      // check that if the epoch has been updated in the contract storage
      expect(await this.etherDistributor.epoch()).to.equal(currentEpoch);
    });

    it("Should not change epoch after blocks less than epochDuration", async function () {
      // mine blocks < epochDuration and update state
      await mine(22);
      await this.etherDistributor._updateState();

      // check that if the epoch is changed in the contract storage
      expect(await this.etherDistributor.epoch()).to.equal(7);
    });
  });
});

describe("EtherDistributor contract demand and claim functionality", async function () {

  async function deploycontractFixture() {
    const EtherDistributor = await ethers.getContractFactory("EtherDistributor");
    const epochCapacity = 100;
    const epochDuration = 2000;
    const deploymentValue = ethers.utils.parseEther("50.0");
    const etherDistributor = await EtherDistributor.deploy(epochCapacity, epochDuration, { value: deploymentValue });
    await etherDistributor.deployed();

    return { etherDistributor, EtherDistributor, epochCapacity, epochDuration, deploymentValue };
  }

  // Permissioned user fixture
  async function permissionedUserFixture() {
    const { etherDistributor, EtherDistributor, epochCapacity, epochDuration, deploymentValue } = await loadFixture(deploycontractFixture);
    const accounts = await ethers.getSigners();

    // register accounts 1-5, 0 is the owner
    for (i = 1; i < 6; i++) {
      await etherDistributor.addPermissionedUser(accounts[i].address);
    }
    return etherDistributor;
  }
  // define it and test if user is registered
  it("Check that 5 user is registered", async function () {
    const etherDistributor = await loadFixture(permissionedUserFixture);
    const accounts = await ethers.getSigners();

    // check that 5 users are registered
    expect(await etherDistributor.numberOfUsers()).to.equal(5);

    // check that 5 users are registered with the correct data
    for (i = 1; i < 6; i++) {
      const user = await etherDistributor.permissionedAddresses((accounts[i].address))
      expect(user.id).to.equal(i);
      expect(user.addr).to.equal(accounts[i].address);
    }
  });
});

