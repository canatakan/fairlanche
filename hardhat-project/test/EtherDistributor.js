const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");

const EPOCH_CAPACITY = 2;
const EPOCH_DURATION = 2000;
const DEPLOYMENT_VALUE = ethers.utils.parseEther("50.0");

describe("EtherDistributor contract basics", function () {

  let EtherDistributor;
  let etherDistributor;

  this.beforeAll(async function () {
    ({ EtherDistributor, etherDistributor } = await deployDistributor(EtherDistributor, etherDistributor));
  });

  describe("Deployment", function () {
    it("Should assign the deployer as owner", async function () {
      const [owner, _] = await ethers.getSigners();
      expect(await etherDistributor.owner()).to.equal(owner.address);
    });

    it("Should deploy with the correct amount of Ethers", async function () {
      expect(await ethers.provider.getBalance(etherDistributor.address)).to.equal(DEPLOYMENT_VALUE);
    });

    it("Should deploy with the correct epoch capacity & duration", async function () {
      expect(await etherDistributor.epochCapacity()).to.equal(EPOCH_CAPACITY);
      expect(await etherDistributor.epochDuration()).to.equal(EPOCH_DURATION);
    });
  });

  describe("User Registration", function () {
    it("Should add 5 permissioned users", async function () {
      const accounts = await ethers.getSigners();

      // register accounts 1-5, 0 is the owner
      for (i = 1; i < 6; i++) {
        await etherDistributor.addPermissionedUser(accounts[i].address);
      }

      // check that 5 users are registered
      expect(await etherDistributor.numberOfUsers()).to.equal(5);

      // check that 5 users are registered with the correct data
      for (i = 1; i < 6; i++) {
        const user = await etherDistributor.permissionedAddresses((accounts[i].address))
        expect(user.id).to.equal(i);
        expect(user.addr).to.equal(accounts[i].address);
      }

      // check that some random accounts are not registered
      for (i = 6; i < 10; i++) {
        const user = await etherDistributor.permissionedAddresses((accounts[i].address))
        expect(user.id).to.equal(0);
        expect(user.addr).to.equal("0x0000000000000000000000000000000000000000");
      }
    });

    it("Should fail while adding a user that is already registered", async function () {
      const accounts = await ethers.getSigners();
      await expect(etherDistributor.addPermissionedUser(accounts[1].address)).to.be.revertedWith("User already exists.");
    });

    it("Should fail when someone other than the owner tries to register a user", async function () {
      const accounts = await ethers.getSigners();
      await expect(etherDistributor.connect(accounts[1]).addPermissionedUser(accounts[9].address)).to.be.revertedWith("Only owner can call this function.");
    });
  });

  describe("Epochs", function () {
    it("Should start with epoch 1", async function () {
      expect(await etherDistributor.epoch()).to.equal(1);
    });

    it("Should update epoch after epochDuration", async function () {
      // mine 1 epoch and update state
      await mine(await etherDistributor.epochDuration());
      await etherDistributor._updateState();

      // check if the desired time has actually passed
      const blockOffset = await etherDistributor.blockOffset();
      const latestBlock = await time.latestBlock()
      const currentEpoch = parseInt((latestBlock - blockOffset) / EPOCH_DURATION) + 1
      expect(currentEpoch).to.equal(2);

      // check that if the epoch has been updated in the contract storage
      expect(await etherDistributor.epoch()).to.equal(currentEpoch);
    });

    it("Should update epoch after multiple epochDurations", async function () {
      // mine 5 epoch and update state
      await mine(await etherDistributor.epochDuration() * 5);
      await etherDistributor._updateState();

      // check if the desired time has actually passed
      const blockOffset = await etherDistributor.blockOffset();
      const latestBlock = await time.latestBlock()
      const currentEpoch = parseInt((latestBlock - blockOffset) / EPOCH_DURATION) + 1
      expect(currentEpoch).to.equal(7);

      // check that if the epoch has been updated in the contract storage
      expect(await etherDistributor.epoch()).to.equal(currentEpoch);
    });

    it("Should not change epoch after blocks less than epochDuration", async function () {
      // mine blocks < epochDuration and update state
      await mine(22);
      await etherDistributor._updateState();

      // check that if the epoch is changed in the contract storage
      expect(await etherDistributor.epoch()).to.equal(7);
    });
  });
});

describe("EtherDistributor contract demand and claim functionality", async function () {

  describe("Demand & claim with single user", function () {

    let EtherDistributor;
    let etherDistributor;

    this.beforeAll(async function () {
      ({ EtherDistributor, etherDistributor } = await deployDistributor(EtherDistributor, etherDistributor));
      const accounts = await ethers.getSigners();
      await etherDistributor.addPermissionedUser(accounts[1].address);
    });

    // YOUR TESTS GO HERE, USING LOCAL VARS ABOVE:
    // it(...) { ... }
    // EXAMPLE:
    it("CHECK USER COUNT, IT SHOULD BE 1", async function () {
      expect(await etherDistributor.numberOfUsers()).to.equal(1); // this is a new contract
    });
  });

  describe("Demand with multiple users", function () {  
  
    let EtherDistributor;
    let etherDistributor;

    this.beforeAll(async function () {
      ({ EtherDistributor, etherDistributor } = await deployDistributor(EtherDistributor, etherDistributor));
      const accounts = await ethers.getSigners();
      await etherDistributor.addPermissionedUser(accounts[7].address);
      await etherDistributor.addPermissionedUser(accounts[2].address);
      await etherDistributor.addPermissionedUser(accounts[3].address);
    });

    // YOUR TESTS GO HERE, USING LOCAL VARS ABOVE:
    // it(...) { ... }
    // EXAMPLE:
    it("CHECK USER COUNT, IT SHOULD BE 3", async function () {
      expect(await etherDistributor.numberOfUsers()).to.equal(3); // this is a new contract
    });
  });

  describe("Demand & claim multiple users", function () {
  });
});

async function deployDistributor(EtherDistributor, etherDistributor) {
  EtherDistributor = await ethers.getContractFactory("EtherDistributor");
  etherDistributor = await EtherDistributor.deploy(EPOCH_CAPACITY, EPOCH_DURATION, { value: DEPLOYMENT_VALUE });
  await etherDistributor.deployed();
  return { EtherDistributor, etherDistributor };
}
