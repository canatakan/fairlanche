const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, mine, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const DEFAULT_EPOCH_CAPACITY = 50;
const DEFAULT_EPOCH_DURATION = 2000;
const DEFAULT_DEPLOYMENT_VALUE = 250;

async function deployDistributor(
  epochCapacity = DEFAULT_EPOCH_CAPACITY,
  epochDuration = DEFAULT_EPOCH_DURATION,
  deploymentValue = DEFAULT_DEPLOYMENT_VALUE,
  enableWithdrawal = false
) {
  NativeDistributor = await ethers.getContractFactory("TestNativeDistributor");
  nativeDistributor = await NativeDistributor.deploy(
    epochCapacity,
    epochDuration,
    enableWithdrawal,
    { value: ethers.utils.parseEther(deploymentValue + "") }
  );
  await nativeDistributor.deployed();
  return { NativeDistributor, nativeDistributor };
}

async function permissionedDeploymentFixture() {
  let NativeDistributor;
  let nativeDistributor;
  ({ NativeDistributor, nativeDistributor } = await deployDistributor());
  const accounts = await ethers.getSigners();
  for (i = 1; i < 20; i++) {
    nativeDistributor.addPermissionedUser(accounts[i].address);
  }
  await mine(1);
  return { NativeDistributor, nativeDistributor };
}

async function demandBulk(nativeDistributor, accounts, demandArray) {
  for (i = 0; i < Math.min(accounts.length - 1, demandArray.length); i++) {
    await nativeDistributor.connect(accounts[i + 1]).demand(demandArray[i]);
  }
}

describe("NativeDistributor contract basics", function () {

  let nativeDistributor;

  this.beforeAll(async function () {
    ({ nativeDistributor } = await deployDistributor());
  });

  describe("Deployment", function () {
    it("Should assign the deployer as owner", async function () {
      const [owner, _] = await ethers.getSigners();
      expect(await nativeDistributor.owner()).to.equal(owner.address);
    });

    it("Should deploy with the correct amount of Ethers", async function () {
      expect(await ethers.provider.getBalance(nativeDistributor.address)).to.equal(ethers.utils.parseEther(DEFAULT_DEPLOYMENT_VALUE.toString()));
    });

    it("Should deploy with the correct epoch capacity & duration", async function () {
      expect(await nativeDistributor.epochCapacity()).to.equal(DEFAULT_EPOCH_CAPACITY);
      expect(await nativeDistributor.epochDuration()).to.equal(DEFAULT_EPOCH_DURATION);
    });

    it("Should calculate distribution end block correctly", async function () {
      expect(await nativeDistributor.distributionEndBlock()).to.equal((await time.latestBlock()) +
        Math.ceil(DEFAULT_DEPLOYMENT_VALUE / DEFAULT_EPOCH_CAPACITY) * DEFAULT_EPOCH_DURATION);
    });
  });

  describe("User Registration", function () {
    it("Should add 5 permissioned users", async function () {
      const accounts = await ethers.getSigners();

      // register accounts 1-5, 0 is the owner
      for (i = 1; i < 6; i++) {
        await nativeDistributor.addPermissionedUser(accounts[i].address);
      }

      // check that 5 users are registered
      expect(await nativeDistributor.numberOfUsers()).to.equal(5);

      // check that 5 users are registered with the correct data
      for (i = 1; i < 6; i++) {
        const user = await nativeDistributor.permissionedAddresses((accounts[i].address))
        expect(user.id).to.equal(i);
        expect(user.addr).to.equal(accounts[i].address);
      }

      // check that some random accounts are not registered
      for (i = 6; i < 10; i++) {
        const user = await nativeDistributor.permissionedAddresses((accounts[i].address))
        expect(user.id).to.equal(0);
        expect(user.addr).to.equal("0x0000000000000000000000000000000000000000");
      }
    });

    it("Should fail while adding a user that is already registered", async function () {
      const accounts = await ethers.getSigners();
      await expect(nativeDistributor.addPermissionedUser(accounts[1].address)).to.be.revertedWith("User already exists.");
    });

    it("Should fail when someone other than the owner tries to register a user", async function () {
      const accounts = await ethers.getSigners();
      await expect(nativeDistributor.connect(accounts[1]).addPermissionedUser(accounts[9].address)).to.be.revertedWith("Only owner can call this function.");
    });
  });

  describe("Epochs", function () {
    it("Should start with epoch 1", async function () {
      expect(await nativeDistributor.epoch()).to.equal(1);
    });

    it("Should update epoch after epochDuration", async function () {
      // mine 1 epoch and update state
      await mine(await nativeDistributor.epochDuration());
      await nativeDistributor._updateState();

      // check if the desired time has actually passed
      const blockOffset = await nativeDistributor.blockOffset();
      const latestBlock = await time.latestBlock()
      const currentEpoch = parseInt((latestBlock - blockOffset) / DEFAULT_EPOCH_DURATION) + 1
      expect(currentEpoch).to.equal(2);

      // check that if the epoch has been updated in the contract storage
      expect(await nativeDistributor.epoch()).to.equal(currentEpoch);
    });

    it("Should update epoch after multiple epochDurations", async function () {
      // mine 5 epoch and update state
      await mine(await nativeDistributor.epochDuration() * 5);
      await nativeDistributor._updateState();

      // check if the desired time has actually passed
      const blockOffset = await nativeDistributor.blockOffset();
      const latestBlock = await time.latestBlock()
      const currentEpoch = parseInt((latestBlock - blockOffset) / DEFAULT_EPOCH_DURATION) + 1
      expect(currentEpoch).to.equal(7);

      // check that if the epoch has been updated in the contract storage
      expect(await nativeDistributor.epoch()).to.equal(currentEpoch);
    });

    it("Should not change epoch after blocks less than epochDuration", async function () {
      // mine blocks < epochDuration and update state
      await mine(22);
      await nativeDistributor._updateState();

      // check that if the epoch is changed in the contract storage
      expect(await nativeDistributor.epoch()).to.equal(7);
    });
  });
});

describe("NativeDistributor contract demand & claim functionality", async function () {

  describe("Single user", function () {

    let nativeDistributor;

    this.beforeAll(async function () {
      ({ nativeDistributor } = await deployDistributor());
      const accounts = await ethers.getSigners();
      await nativeDistributor.addPermissionedUser(accounts[1].address);
    });

    describe("Demand", function () {
      // A non registered user makes a simple demand (should fail)
      it("Should fail when non-permissioned user tries to demand", async function () {
        const accounts = await ethers.getSigners();
        const user = accounts[2];
        const amount = 10;
        await expect(nativeDistributor.connect(user).demand(amount)).to.be.revertedWith("User does not have the permission.");
      });

      // A registered user makes a simple demand
      it("Should make simple demand", async function () {
        const accounts = await ethers.getSigners();
        const user = accounts[1];
        const amount = 10;
        await nativeDistributor.connect(user).demand(amount);
        const currentEpoch = await nativeDistributor.epoch();
        const userInfo = await nativeDistributor.getUser(user.address);
        expect(userInfo[3][currentEpoch]).to.equal(amount);
        // Last Demand Epoch: console.log("User info: ", userInfo[4]); #Correct
      });

      // A registered user makes a demand with a value greater than the MAX_DEMAND_VALUE
      it("Should fail for the demands with a value greater than the MAX_DEMAND_VALUE", async function () {
        const accounts = await ethers.getSigners();
        const user = accounts[1];
        const MAX_DEMAND_VOLUME = await nativeDistributor.MAX_DEMAND_VOLUME();
        await expect(nativeDistributor.connect(user).demand(MAX_DEMAND_VOLUME + 1)).to.be.revertedWith("Invalid volume.");
      });

      // A registered user makes a demand with a value greater than the EPOCH_CAPACITY
      it("Should fail for the demands with a value greater than the epochCapacity", async function () {
        const accounts = await ethers.getSigners();
        const user = accounts[1];
        const epochCapacity = await nativeDistributor.epochCapacity();
        await expect(nativeDistributor.connect(user).demand(epochCapacity + 1)).to.be.revertedWith("Invalid volume.");
      });

      // A registered user makes another demand in the same epoch (should fail)
      it("Should fail when the user makes multiple demands in the same epoch", async function () {
        const accounts = await ethers.getSigners();
        const user = accounts[1];
        const amount = 10;
        await expect(nativeDistributor.connect(user).demand(amount)).to.be.revertedWith("Wait for the next epoch.");
      });

      // A registered user makes another demand in the next epoch
      it("Should be able to make another demand in Epoch 2", async function () {
        const accounts = await ethers.getSigners();
        const user = accounts[1];
        const amount = 10;
        await mine(await nativeDistributor.epochDuration());
        await nativeDistributor._updateState();
        await nativeDistributor.connect(user).demand(amount);
        const currentEpoch = await nativeDistributor.epoch();
        const userInfo = await nativeDistributor.getUser(user.address);
        expect(userInfo[3][currentEpoch]).to.equal(amount);
      });
    });

    describe("Claim single share", function () {
      // A registered user makes a claim of what he/she has demanded in epoch 2
      it("Should be able to make the claim of Epoch 2", async function () {

        const accounts = await ethers.getSigners();
        const user = accounts[1];

        const userBalanceInitial = await ethers.provider.getBalance(user.address);

        const claimEpoch = 2;
        await mine(await nativeDistributor.epochDuration());
        await nativeDistributor._updateState();
        const userInfo = await nativeDistributor.getUser(user.address);
        const epochShare = await nativeDistributor.shares(claimEpoch);
        //console.log("Epoch share: ", epochShare); #Correct
        const claimAmount = Math.min(userInfo[3][claimEpoch], epochShare);

        // claim and get the transaction receipt
        const tx = await nativeDistributor.connect(user).claim(claimEpoch);
        const userBalance = await ethers.provider.getBalance(user.address);
        const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const gasUsed = txReceipt.gasUsed;
        const gasPrice = tx.gasPrice;
        const gasCost = gasUsed.mul(gasPrice);

        const userInfoAfterClaim = await nativeDistributor.getUser(user.address);
        expect(userInfoAfterClaim[3][claimEpoch]).to.equal(0);

        // convert claim amount to wei
        const claimAmountWei = ethers.utils.parseEther(claimAmount.toString());
        // check the final user balance is equal to the initial balance + claim amount - gas cost
        expect(userBalance).to.equal(userBalanceInitial.add(claimAmountWei).sub(gasCost));

      });

      it("Should fail when the user tries to claim for the same epoch twice", async function () {
        const accounts = await ethers.getSigners();
        await expect(nativeDistributor.connect(accounts[1]).claim(2)).to.be.revertedWith("You do not have a demand for this epoch.");
      });

      // A registered user makes the claim of what he/she has demanded in epoch 1 after DEMAND_EXPIRATION_TIME + 1 (should fail)
      it("Should fail when the user tries to claim after the DEMAND_EXPIRATION_TIME", async function () {
        const accounts = await ethers.getSigners();
        const user = accounts[1];
        const claimEpoch = 1;
        const DEMAND_EXPIRATION_TIME = await nativeDistributor.DEMAND_EXPIRATION_TIME();
        await mine((DEMAND_EXPIRATION_TIME + 1) * await nativeDistributor.epochDuration());
        await nativeDistributor._updateState();
        await expect(nativeDistributor.connect(user).claim(claimEpoch)).to.be.revertedWith("Epoch is too old.");
      });
    });

    describe("Claim all shares", function () {
      // A registered user makes multiple demands in different epochs first, then after some epoch he/she calls claimAll function
      it("Should allow the user to make multiple demands then claim all", async function () {
        ({ nativeDistributor } = await deployDistributor());
        const accounts = await ethers.getSigners();
        const user = accounts[4];
        await nativeDistributor.addPermissionedUser(user.address);

        const currentEpoch = await nativeDistributor.epoch();
        expect(currentEpoch).to.equal(1);

        const initialBalance = await ethers.provider.getBalance(user.address);
        expect(initialBalance).to.equal(ethers.utils.parseEther("10000"));

        const amount = 10;
        const epochs = 5;
        const claimEpochs = [2, 3, 4, 5, 6];
        const claimAmounts = [10, 10, 10, 10, 10];

        // make demands in different epochs
        for (let i = 0; i < epochs; i++) {
          await nativeDistributor.connect(user).demand(amount);
          await mine(await nativeDistributor.epochDuration());
          await nativeDistributor._updateState();
        }

        await mine(50 * await nativeDistributor.epochDuration());
        await nativeDistributor._updateState();

        const userBalanceInitial = await ethers.provider.getBalance(user.address);

        const tx = await nativeDistributor.connect(user).claimAll();
        const userBalance = await ethers.provider.getBalance(user.address);

        const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const gasUsed = txReceipt.gasUsed;
        const gasPrice = tx.gasPrice;
        const gasCost = gasUsed.mul(gasPrice);

        const userInfoAfterClaim = await nativeDistributor.getUser(user.address);

        for (let i = 0; i < epochs; i++) {
          expect(userInfoAfterClaim[3][claimEpochs[i]]).to.equal(0);
        }
        // convert claim amount to wei
        var claimAmountWei = ethers.utils.parseEther("0");
        for (let i = 0; i < epochs; i++) {
          claimAmountWei = claimAmountWei.add(ethers.utils.parseEther(claimAmounts[i].toString()));
          //console.log("claimAmountWei: ", claimAmountWei.toString());
        }
        // check the final user balance is equal to the initial balance + claim amount - gas cost
        expect(userBalance).to.equal(userBalanceInitial.add(claimAmountWei).sub(gasCost));
      });

      // A registered user makes multiple demands in epochs 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, and 120.
      //  Then he/she calls claimAll function at epoch 130. Should be able to claim only last 100 epochs' demands.
      it("Should not include expired demands in claimAll()", async function () {
        ({ nativeDistributor } = await deployDistributor(3, DEFAULT_EPOCH_DURATION, 600, false));
        const accounts = await ethers.getSigners();
        const user = accounts[10];
        await nativeDistributor.addPermissionedUser(user.address);

        const currentEpoch = await nativeDistributor.epoch();
        expect(currentEpoch).to.equal(1);

        const initialBalance = await ethers.provider.getBalance(user.address);
        expect(initialBalance).to.equal(ethers.utils.parseEther("10000"));

        const amount = 2;
        const epochs = 12;

        // make demands in different epochs
        for (let i = 0; i < epochs; i++) {
          await mine(10 * await nativeDistributor.epochDuration());
          await nativeDistributor._updateState();
          await nativeDistributor.connect(user).demand(amount); // 11, 21, 31, 41, 51, 61, 71, 81, 91, 101, 111, 121 ...
        }

        await mine(55 * await nativeDistributor.epochDuration()); // claimAll at epoch 176
        await nativeDistributor._updateState();

        const currentEpochAfterDemand = await nativeDistributor.epoch();
        expect(currentEpochAfterDemand).to.equal(176);

        //console.log("currentEpochAfterDemand: ", currentEpochAfterDemand.toString());

        const userBalanceInitial = await ethers.provider.getBalance(user.address);
        //console.log("userBalanceInitial: ", userBalanceInitial.toString());

        const tx = await nativeDistributor.connect(user).claimAll();
        const userBalance = await ethers.provider.getBalance(user.address);
        // ClaimAll at epoch 176 so should only get demands from epoch 76 to 176 which includes 81, 91, 101, 111, 121. (=> 50)

        const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const gasUsed = txReceipt.gasUsed;
        const gasPrice = tx.gasPrice;
        const gasCost = gasUsed.mul(gasPrice);

        // check the final user balance is equal to the initial balance + claim amount ( 5 * 2 = 10) - gas cost
        expect(userBalance).to.equal(userBalanceInitial.add(ethers.utils.parseEther("10")).sub(gasCost));
      });

      // A registered user makes 100 demands starting from epoch 1 to epoch 100. Then he/she calls claimAll function at epoch 101. Should be able to claim all demands.
      it("Should allow the user to make max number of demands then claim all", async function () {
        ({ nativeDistributor } = await deployDistributor(5, DEFAULT_EPOCH_DURATION, 1000, false));
        const accounts = await ethers.getSigners();
        const user = accounts[8];
        await nativeDistributor.addPermissionedUser(user.address);

        const currentEpoch = await nativeDistributor.epoch();
        expect(currentEpoch).to.equal(1);

        const initialBalance = await ethers.provider.getBalance(user.address);
        expect(initialBalance).to.equal(ethers.utils.parseEther("10000"));

        const amount = 1;
        const epochs = 100;

        // make demands in different epochs
        for (let i = 0; i < epochs; i++) {
          await nativeDistributor.connect(user).demand(amount);
          await mine(await nativeDistributor.epochDuration());
          await nativeDistributor._updateState();
        }
        //printUserInfo demand array
        //console.log("demand array: ", (await nativeDistributor.getUser(user.address))[3]);
        // expect the current epoch to be 101
        const currentEpochAfterDemand = await nativeDistributor.epoch();
        expect(currentEpochAfterDemand).to.equal(101);

        const userBalanceInitial = await ethers.provider.getBalance(user.address);

        const tx = await nativeDistributor.connect(user).claimAll();
        const userBalance = await ethers.provider.getBalance(user.address);

        const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const gasUsed = txReceipt.gasUsed;
        const gasPrice = tx.gasPrice;
        const gasCost = gasUsed.mul(gasPrice);
        // print users demand array
        const userInfoAfterClaim = await nativeDistributor.getUser(user.address);
        //console.log("userInfoAfterClaim: ", userInfoAfterClaim[3]);

        // check the final user balance is equal to the initial balance + claim amount (100) - gas cost  
        expect(userBalance).to.equal(userBalanceInitial.add(ethers.utils.parseEther("99")).sub(gasCost));
      });
    });

  });



  describe("Multiple users", function () {

    describe("Demand", function () {

      describe("Single epoch (Independent)", function () {

        describe("Share updates", function () {

          it("Should be able to update the share 1 epoch later", async function () {
            const { nativeDistributor } = await loadFixture(permissionedDeploymentFixture);
            await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
            await mine(DEFAULT_EPOCH_DURATION);
            await nativeDistributor._updateState();

            // check that the share is correctly stored in the array
            const share = await nativeDistributor.shares(1);
            expect(share).to.equal(6);
          });

          it("Should be able to update the share multiple epochs later", async function () {
            const { nativeDistributor } = await loadFixture(permissionedDeploymentFixture);
            await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
            await mine(DEFAULT_EPOCH_DURATION * 5);
            await nativeDistributor._updateState();

            // check that the share is correctly stored in the array
            const share = await nativeDistributor.shares(1);
            expect(share).to.equal(6);
          });

          it("Should not update the share before the epoch is over", async function () {
            const { nativeDistributor } = await loadFixture(permissionedDeploymentFixture);
            await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
            await mine(22);
            await nativeDistributor._updateState();

            // check that the share is correctly stored in the array
            const share = await nativeDistributor.shares(1);
            expect(share).to.equal(0);
          });
        });

        describe("Share and distribution calculations", function () {

          const customEpochCapacities = [50, 48, 90, 5, 1];

          it("50: [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]", async function () {
            const customEpochCapacity = customEpochCapacities[0];
            const { nativeDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE);
            const accounts = await ethers.getSigners();
            for (i = 1; i <= 13; i++) {
              nativeDistributor.addPermissionedUser(accounts[i].address);
            }
            await mine(1);

            await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
            await mine(DEFAULT_EPOCH_DURATION);
            await nativeDistributor._updateState();

            // check that the share is correctly stored in the array
            const share = await nativeDistributor.shares(1);
            expect(share).to.equal(6);

            // check whether the distribution is 49
            expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + 1);
          });

          it("48: [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]", async function () {
            const customEpochCapacity = customEpochCapacities[1];
            const { nativeDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE);
            const accounts = await ethers.getSigners();
            for (i = 1; i <= 13; i++) {
              nativeDistributor.addPermissionedUser(accounts[i].address);
            }
            await mine(1);
            await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
            await mine(DEFAULT_EPOCH_DURATION);
            await nativeDistributor._updateState();

            // check that the share is correctly stored in the array
            const share = await nativeDistributor.shares(1);
            expect(share).to.equal(5);

            // check whether the distribution is 45
            expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + 3);
          });

          it("90: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]", async function () {
            const customEpochCapacity = customEpochCapacities[2];
            const { nativeDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE);
            const accounts = await ethers.getSigners();
            for (i = 1; i <= 10; i++) {
              nativeDistributor.addPermissionedUser(accounts[i].address);
            }
            await mine(1);

            await demandBulk(nativeDistributor, await ethers.getSigners(), [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
            await mine(DEFAULT_EPOCH_DURATION);
            await nativeDistributor._updateState();

            // check that the share is correctly stored in the array
            const share = await nativeDistributor.shares(1);
            expect(share).to.equal(9);

            // check whether the distribution is 90, no excessives
            expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity);
          });

          it("5: [5, 2, 2, 5, 1]", async function () {
            const customEpochCapacity = customEpochCapacities[3];
            const { nativeDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE);
            const accounts = await ethers.getSigners();
            for (i = 1; i <= 5; i++) {
              nativeDistributor.addPermissionedUser(accounts[i].address);
            }
            await mine(1);

            await demandBulk(nativeDistributor, await ethers.getSigners(), [5, 2, 2, 5, 1]);
            await mine(DEFAULT_EPOCH_DURATION);
            await nativeDistributor._updateState();

            // check that the share is correctly stored in the array
            const share = await nativeDistributor.shares(1);
            expect(share).to.equal(1);

            // check whether the distribution is 5, no excessives
            expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity);
          });

          it("1: [1, 1, 1, ... , 1]", async function () {
            const customEpochCapacity = customEpochCapacities[3];
            const { nativeDistributor } = await deployDistributor(customEpochCapacity);
            const accounts = await ethers.getSigners();
            for (i = 1; i <= 19; i++) {
              nativeDistributor.addPermissionedUser(accounts[i].address);
            }
            await mine(1);

            const demandArray = [];
            for (i = 0; i < 19; i++) {
              demandArray.push(1);
            }
            await demandBulk(nativeDistributor, await ethers.getSigners(), demandArray);

            await mine(DEFAULT_EPOCH_DURATION);
            await nativeDistributor._updateState();

            // check that the share is correctly stored in the array
            const share = await nativeDistributor.shares(1);
            expect(share).to.equal(0);

            // check whether the distribution is 0, all balance to the next epoch
            expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity * 2);
          });
        });
      });

      describe("Multiple epochs (Cumulative)", function () {
        it("Should apply Calculation 1 for 2 epochs", async function () {
          const customEpochCapacity = 50;
          const { nativeDistributor } = await deployDistributor(customEpochCapacity);
          const accounts = await ethers.getSigners();
          for (i = 1; i <= 13; i++) {
            nativeDistributor.addPermissionedUser(accounts[i].address);
          }
          await mine(1);

          await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(DEFAULT_EPOCH_DURATION);
          await nativeDistributor._updateState();

          // cumulativeCapacity = 50, share = 6, distribution = 49, excess = 1
          var share = await nativeDistributor.shares(1);
          expect(share).to.equal(6);
          // new cumulativeCapacity = 50 + 1 (excess) = 51
          expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + 1);

          await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(DEFAULT_EPOCH_DURATION);
          await nativeDistributor._updateState();

          // cumulativeCapacity = 51, share = 6, distribution = 49, excess = 2
          var share = await nativeDistributor.shares(2);
          expect(share).to.equal(6);
          // new cumulativeCapacity = 50 + 2 (excess) = 52
          expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + 2);
        });

        it("Should apply Calculation 2 for 5 epochs", async function () {
          const customEpochCapacity = 48;
          const { nativeDistributor } = await deployDistributor(customEpochCapacity);
          const accounts = await ethers.getSigners();
          for (i = 1; i <= 13; i++) {
            nativeDistributor.addPermissionedUser(accounts[i].address);
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
            await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
            await mine(DEFAULT_EPOCH_DURATION);
            await nativeDistributor._updateState();

            var share = await nativeDistributor.shares(j + 1);
            expect(share).to.equal(expectedShares[j]);
            // new cumulativeCapacity = epochCapacity + excessAmount
            expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + excessAmounts[j]);
          }
        });

        it("Should apply Calculation 3 for 50 epochs", async function () {
          const customEpochCapacity = 90;
          const { nativeDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, 4500, false);
          const accounts = await ethers.getSigners();
          for (i = 1; i <= 10; i++) {
            nativeDistributor.addPermissionedUser(accounts[i].address);
          }
          await mine(1);

          // the capacity is never sufficient, so there is never an excess
          for (j = 0; j < 50; j++) {
            await demandBulk(nativeDistributor, await ethers.getSigners(), [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
            await mine(DEFAULT_EPOCH_DURATION);
            await nativeDistributor._updateState();

            var share = await nativeDistributor.shares(j + 1);
            expect(share).to.equal(9);
            expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity);
          }
        });

      });

    });

    describe("Claim", function () {

      describe("Claim single share", function () {

        const demandArray = [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7];
        let nativeDistributor;
        this.beforeAll(async function () {
          ({ nativeDistributor } = await loadFixture(permissionedDeploymentFixture));
          await demandBulk(nativeDistributor, await ethers.getSigners(), demandArray);
        });

        it("Should allow everyone to claim their calculated shares", async function () {
          await mine(DEFAULT_EPOCH_DURATION);
          await nativeDistributor._updateState();
          const accounts = await ethers.getSigners();
          const claimEpoch = 1;
          const expectedUserShares = [1, 1, 1, 2, 2, 3, 5, 5, 5, 6, 6, 6, 6]; // for capacity 50
          for (i = 1; i <= 13; i++) {
            const share = await nativeDistributor.shares(claimEpoch);

            const userInfo = await nativeDistributor.getUser(accounts[i].address);
            const userDemand = userInfo[3][claimEpoch];
            expect(userDemand).to.equal(demandArray[i - 1]); // demand is correct

            const userShare = Math.min(share, userDemand);
            expect(userShare).to.equal(expectedUserShares[i - 1]); // calculated share is correct

            const initialBalance = await ethers.provider.getBalance(accounts[i].address);

            const tx = await nativeDistributor.connect(accounts[i]).claim(claimEpoch);
            const userBalance = await ethers.provider.getBalance(accounts[i].address);
            const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
            const gasUsed = txReceipt.gasUsed;
            const gasPrice = tx.gasPrice;
            const gasCost = gasUsed.mul(gasPrice);

            const userInfoAfterClaim = await nativeDistributor.getUser(accounts[i].address);
            expect(userInfoAfterClaim[3][claimEpoch]).to.equal(0); // demand is reset to 0

            const claimAmountWei = ethers.utils.parseEther(userShare.toString());
            expect(userBalance).to.equal(initialBalance.add(claimAmountWei).sub(gasCost)); // transfer is correct
          }
        });

        it("Should not allow anyone without a share to claim", async function () {
          const accounts = await ethers.getSigners();
          const userInfo = await nativeDistributor.getUser(accounts[19].address);
          const userDemand = userInfo[3][1];
          expect(userDemand).to.equal(0); // demand is 0
          await expect(nativeDistributor.connect(accounts[19]).claim(1)).to.be.revertedWith("You do not have a demand for this epoch.");
        });
      });


      describe("Claim all shares", function () {

        const demandArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let nativeDistributor;
        this.beforeAll(async function () {
          ({ nativeDistributor } = await deployDistributor(55, DEFAULT_EPOCH_DURATION, 2000, false));
          const accounts = await ethers.getSigners();
          for (i = 1; i <= 10; i++) {
            nativeDistributor.addPermissionedUser(accounts[i].address);
          }
        });

        it("Should allow everyone to call claimAll() after 10 epochs of demanding", async function () {
          const accounts = await ethers.getSigners();

          /*
           * Demands for 10 epochs:
           * Epoch 1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
           * Epoch 2: [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
           * Epoch 3: [3, 4, 5, 6, 7, 8, 9, 10, 1, 2]
           * ...
           * 
           * Shares will be same as well. Everyone gets
           * what they demanded since the capacity is 
           * exactly 55.
           * 
           * Overall, everyone should get 55 shares.
           */

          for (i = 0; i < 10; i++) { // keep demanding for 10 epochs
            for (j = 0; j < 10; j++) { // all 10 users demand
              await nativeDistributor.connect(accounts[j + 1]).demand(demandArray[(j + i) % 10]);
            }
            await mine(DEFAULT_EPOCH_DURATION); // move to the next epoch
          }

          // check demands before claiming
          for (i = 1; i <= 10; i++) {
            const userInfo = await nativeDistributor.getUser(accounts[i].address);
            for (j = 1; j <= 10; j++) {
              expect(userInfo[3][j]).to.equal(demandArray[(i + j - 2) % 10]);
            }
          }

          for (i = 1; i <= 10; i++) {
            const initialBalance = await ethers.provider.getBalance(accounts[i].address);
            const tx = await nativeDistributor.connect(accounts[i]).claimAll();
            const userBalance = await ethers.provider.getBalance(accounts[i].address);
            const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
            const gasUsed = txReceipt.gasUsed;
            const gasPrice = tx.gasPrice;
            const gasCost = gasUsed.mul(gasPrice);
            const claimAmountWei = ethers.utils.parseEther("55.0");
            expect(userBalance).to.equal(initialBalance.add(claimAmountWei).sub(gasCost)); // transfer is correct
          }
        });
      });
    });
  });
});