const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, mine, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const DEFAULT_EPOCH_CAPACITY = 50;
const DEFAULT_EPOCH_DURATION = 2000;
const DEFAULT_DEPLOYMENT_VALUE = ethers.utils.parseEther("250.0");

describe("EtherDistributor contract basics", function () {

  let EtherDistributor;
  let etherDistributor;

  this.beforeAll(async function () {
    ({ EtherDistributor, etherDistributor } = await deployDistributor(DEFAULT_EPOCH_CAPACITY, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE));
  });

  describe("Deployment", function () {
    it("Should assign the deployer as owner", async function () {
      const [owner, _] = await ethers.getSigners();
      expect(await etherDistributor.owner()).to.equal(owner.address);
    });

    it("Should deploy with the correct amount of Ethers", async function () {
      expect(await ethers.provider.getBalance(etherDistributor.address)).to.equal(DEFAULT_DEPLOYMENT_VALUE);
    });

    it("Should deploy with the correct epoch capacity & duration", async function () {
      expect(await etherDistributor.epochCapacity()).to.equal(DEFAULT_EPOCH_CAPACITY);
      expect(await etherDistributor.epochDuration()).to.equal(DEFAULT_EPOCH_DURATION);
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
      const currentEpoch = parseInt((latestBlock - blockOffset) / DEFAULT_EPOCH_DURATION) + 1
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
      const currentEpoch = parseInt((latestBlock - blockOffset) / DEFAULT_EPOCH_DURATION) + 1
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

    let etherDistributor;

    this.beforeAll(async function () {
      ({ etherDistributor } = await deployDistributor(DEFAULT_EPOCH_CAPACITY, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE));
      const accounts = await ethers.getSigners();
      await etherDistributor.addPermissionedUser(accounts[1].address);
    });


    it("Registered user makes simple demand", async function () {
      const accounts = await ethers.getSigners();
      const user = accounts[1];
      const amount = 10;
      await etherDistributor.connect(user).demand(amount);
      const currentEpoch = await etherDistributor.epoch();
      const userInfo = await etherDistributor.getUser(user.address);
      expect(userInfo[3][currentEpoch]).to.equal(amount);
      // Last Demand Epoch: console.log("User info: ", userInfo[4]); #Correct
    });

    it("Registered user makes demand with amount > epochCapacity", async function () {
      const accounts = await ethers.getSigners();
      const user = accounts[1];
      const amount = DEFAULT_EPOCH_CAPACITY + 10;
      await expect(etherDistributor.connect(user).demand(amount)).to.be.revertedWith("Invalid volume.");
    });

    // Registered user makes another demand in the same epoch (should fail)
    it("Registered user makes demand in the same epoch", async function () {
      const accounts = await ethers.getSigners();
      const user = accounts[1];
      const amount = 10;
      await expect(etherDistributor.connect(user).demand(amount)).to.be.revertedWith("Wait for the next epoch.");
    });

    // Registered user makes another demand in the next epoch
    it("Registered user makes demand in the next epoch", async function () {
      const accounts = await ethers.getSigners();
      const user = accounts[1];
      const amount = 10;
      await mine(await etherDistributor.epochDuration());
      await etherDistributor._updateState();
      await etherDistributor.connect(user).demand(amount);
      const currentEpoch = await etherDistributor.epoch();
      const userInfo = await etherDistributor.getUser(user.address);
      expect(userInfo[3][currentEpoch]).to.equal(amount);
    });

    // TODO: Claims

  });

  describe("Demand with multiple users", function () {

    async function permissionedDeploymentFixture() {
      let EtherDistributor;
      let etherDistributor;
      ({ EtherDistributor, etherDistributor } = await deployDistributor(DEFAULT_EPOCH_CAPACITY, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE));
      const accounts = await ethers.getSigners();
      for (i = 1; i < 20; i++) {
        etherDistributor.addPermissionedUser(accounts[i].address);
      }
      await mine(1);
      return { EtherDistributor, etherDistributor };
    }

    describe("Single epoch", function () {

      describe("Share updates", function () {

        it("Should be able to update the share 1 epoch later", async function () {
          const { etherDistributor } = await loadFixture(permissionedDeploymentFixture, 1);
          await demandBulk(etherDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(DEFAULT_EPOCH_DURATION);
          await etherDistributor._updateState();

          // check that the share is correctly stored in the array
          const share = await etherDistributor.shares(1);
          expect(share).to.equal(6);
        });

        it("Should be able to update the share multiple epochs later", async function () {
          const { etherDistributor } = await loadFixture(permissionedDeploymentFixture);
          await demandBulk(etherDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(DEFAULT_EPOCH_DURATION * 5);
          await etherDistributor._updateState();

          // check that the share is correctly stored in the array
          const share = await etherDistributor.shares(1);
          expect(share).to.equal(6);
        });

        it("Should not update the share before the epoch is over", async function () {
          const { etherDistributor } = await loadFixture(permissionedDeploymentFixture);
          await demandBulk(etherDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(22);
          await etherDistributor._updateState();

          // check that the share is correctly stored in the array
          const share = await etherDistributor.shares(1);
          expect(share).to.equal(0);
        });
      });

      describe("Share and distribution calculations", function () {

        const customEpochCapacities = [50, 48, 90, 5, 1];

        it("50: [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]", async function () {
          const customEpochCapacity = customEpochCapacities[0];
          const { etherDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE);
          const accounts = await ethers.getSigners();
          for (i = 1; i <= 13; i++) {
            etherDistributor.addPermissionedUser(accounts[i].address);
          }
          await mine(1);

          await demandBulk(etherDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(DEFAULT_EPOCH_DURATION);
          await etherDistributor._updateState();

          // check that the share is correctly stored in the array
          const share = await etherDistributor.shares(1);
          expect(share).to.equal(6);

          // check whether the distribution is 49
          expect(await etherDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + 1);
        });

        it("48: [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]", async function () {
          const customEpochCapacity = customEpochCapacities[1];
          const { etherDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE);
          const accounts = await ethers.getSigners();
          for (i = 1; i <= 13; i++) {
            etherDistributor.addPermissionedUser(accounts[i].address);
          }
          await mine(1);
          await demandBulk(etherDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(DEFAULT_EPOCH_DURATION);
          await etherDistributor._updateState();

          // check that the share is correctly stored in the array
          const share = await etherDistributor.shares(1);
          expect(share).to.equal(5);

          // check whether the distribution is 45
          expect(await etherDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + 3);
        });

        it("90: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]", async function () {
          const customEpochCapacity = customEpochCapacities[2];
          const { etherDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE);
          const accounts = await ethers.getSigners();
          for (i = 1; i <= 10; i++) {
            etherDistributor.addPermissionedUser(accounts[i].address);
          }
          await mine(1);

          await demandBulk(etherDistributor, await ethers.getSigners(), [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
          await mine(DEFAULT_EPOCH_DURATION);
          await etherDistributor._updateState();

          // check that the share is correctly stored in the array
          const share = await etherDistributor.shares(1);
          expect(share).to.equal(9);

          // check whether the distribution is 90, no excessives
          expect(await etherDistributor.cumulativeCapacity()).to.equal(customEpochCapacity);
        });

        it("5: [5, 2, 2, 5, 1]", async function () {
          const customEpochCapacity = customEpochCapacities[3];
          const { etherDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE);
          const accounts = await ethers.getSigners();
          for (i = 1; i <= 5; i++) {
            etherDistributor.addPermissionedUser(accounts[i].address);
          }
          await mine(1);

          await demandBulk(etherDistributor, await ethers.getSigners(), [5, 2, 2, 5, 1]);
          await mine(DEFAULT_EPOCH_DURATION);
          await etherDistributor._updateState();

          // check that the share is correctly stored in the array
          const share = await etherDistributor.shares(1);
          expect(share).to.equal(1);

          // check whether the distribution is 5, no excessives
          expect(await etherDistributor.cumulativeCapacity()).to.equal(customEpochCapacity);
        });

        it("1: [1, 1, 1, ... , 1]", async function () {
          const customEpochCapacity = customEpochCapacities[3];
          const { etherDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE);
          const accounts = await ethers.getSigners();
          for (i = 1; i <= 19; i++) {
            etherDistributor.addPermissionedUser(accounts[i].address);
          }
          await mine(1);

          const demandArray = [];
          for (i = 0; i < 19; i++) {
            demandArray.push(1);
          }
          await demandBulk(etherDistributor, await ethers.getSigners(), demandArray);

          await mine(DEFAULT_EPOCH_DURATION);
          await etherDistributor._updateState();

          // check that the share is correctly stored in the array
          const share = await etherDistributor.shares(1);
          expect(share).to.equal(0);

          // check whether the distribution is 0, all balance to the next epoch
          expect(await etherDistributor.cumulativeCapacity()).to.equal(customEpochCapacity * 2);
        });
      });
    });

    describe("Cumulative with multiple epochs", function () {
      it("Should apply Calculation 1 for 2 epochs", async function () {
        const customEpochCapacity = 50;
        const { etherDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE);
        const accounts = await ethers.getSigners();
        for (i = 1; i <= 13; i++) {
          etherDistributor.addPermissionedUser(accounts[i].address);
        }
        await mine(1);

        await demandBulk(etherDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
        await mine(DEFAULT_EPOCH_DURATION);
        await etherDistributor._updateState();

        // cumulativeCapacity = 50, share = 6, distribution = 49, excess = 1
        var share = await etherDistributor.shares(1);
        expect(share).to.equal(6);
        // new cumulativeCapacity = 50 + 1 (excess) = 51
        expect(await etherDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + 1);
        
        await demandBulk(etherDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
        await mine(DEFAULT_EPOCH_DURATION);
        await etherDistributor._updateState();
        
        // cumulativeCapacity = 51, share = 6, distribution = 49, excess = 2
        var share = await etherDistributor.shares(2);
        expect(share).to.equal(6);
        // new cumulativeCapacity = 50 + 2 (excess) = 52
        expect(await etherDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + 2);
      });

      it("Should apply Calculation 2 for 5 epochs", async function () {
        const customEpochCapacity = 48;
        const { etherDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE);
        const accounts = await ethers.getSigners();
        for (i = 1; i <= 13; i++) {
          etherDistributor.addPermissionedUser(accounts[i].address);
        }
        await mine(1);

        /*
        * Epoch 1: cumulativeCapacity = 48, share = 5, distribution = 45, excess = 3
        * Epoch 2: cumulativeCapacity = 51, share = 6, distribution = 49, excess = 2
        * Epoch 3: cumulativeCapacity = 50, share = 6, distribution = 49, excess = 1
        * Epoch 4: cumulativeCapacity = 49, share = 6, distribution = 49, excess = 0
        * Epoch 5: cumulativeCapacity = 48, share = 5, distribution = 45, excess = 3
        */
        const expectedShares = [5, 6, 6, 6, 5];
        const excessAmounts = [3, 2, 1, 0, 3];
        for (j = 0; j < 5; j++) {
          await demandBulk(etherDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(DEFAULT_EPOCH_DURATION);
          await etherDistributor._updateState();

          var share = await etherDistributor.shares(j + 1);
          expect(share).to.equal(expectedShares[j]);
          // new cumulativeCapacity = epochCapacity + excessAmount
          expect(await etherDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + excessAmounts[j]);
        }
      });

    });

    async function demandBulk(etherDistributor, accounts, demandArray) {
      for (i = 0; i < Math.min(accounts.length - 1, demandArray.length); i++) {
        await etherDistributor.connect(accounts[i + 1]).demand(demandArray[i]);
      }
    }

  });

  describe("Demand & claim multiple users", function () {
  });

});

async function deployDistributor(epochCapacity, epochDuration, deploymentValue) {
  EtherDistributor = await ethers.getContractFactory("EtherDistributor");
  etherDistributor = await EtherDistributor.deploy(epochCapacity, epochDuration, { value: deploymentValue });
  await etherDistributor.deployed();
  return { EtherDistributor, etherDistributor };
}
