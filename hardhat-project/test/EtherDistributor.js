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

describe("EtherDistributor contract demand & claim functionality", async function () {

  describe("Single user", function () {
    
    let etherDistributor;

    this.beforeAll(async function () {
      ({ etherDistributor } = await deployDistributor(DEFAULT_EPOCH_CAPACITY, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE));
      const accounts = await ethers.getSigners();
      await etherDistributor.addPermissionedUser(accounts[1].address);
    });

    //Non registered user makes simple demand (should fail)
    it("Should fail when non-permissioned user tries to demand", async function () {
      const accounts = await ethers.getSigners();
      const user = accounts[2];
      const amount = 10;
      await expect(etherDistributor.connect(user).demand(amount)).to.be.revertedWith("User does not have the permission.");
    });

    // Registered user makes simple demand in epoch 1
    it("Should make simple demand", async function () {
      const accounts = await ethers.getSigners();
      const user = accounts[1];
      const amount = 10;
      await etherDistributor.connect(user).demand(amount);
      const currentEpoch = await etherDistributor.epoch();
      const userInfo = await etherDistributor.getUser(user.address);
      expect(userInfo[3][currentEpoch]).to.equal(amount);
      // Last Demand Epoch: console.log("User info: ", userInfo[4]); #Correct
    });

    // BELOW TWO TESTS ARE SUBJECT TO CHANGE 
    //--------------------------------------------------------------------------------
    // Registered user makes a demand with a value greater than the MAX_DEMAND_VALUE
    it("Should fail for the demands with a value greater than the MAX_DEMAND_VALUE", async function () {
      const accounts = await ethers.getSigners();
      const user = accounts[1];
      const MAX_DEMAND_VOLUME = await etherDistributor.MAX_DEMAND_VOLUME();
      // make a demand with a value greater than the MAX_DEMAND_VALUE
      await expect(etherDistributor.connect(user).demand(MAX_DEMAND_VOLUME + 1)).to.be.revertedWith("Invalid volume.");
    });

    // Registered user makes a demand with a value greater than the EPOCH_CAPACITY
    it("Should fail for the demands with a value greater than the epochCapacity", async function () {
      const accounts = await ethers.getSigners();
      const user = accounts[1];
      const amount = DEFAULT_EPOCH_CAPACITY + 10;
      await expect(etherDistributor.connect(user).demand(amount)).to.be.revertedWith("Invalid volume.");
    });
    //--------------------------------------------------------------------------------

    // Registered user makes another demand in the same epoch (should fail)
    it("Should fail when the user makes multiple demands in the same epoch", async function () {
      const accounts = await ethers.getSigners();
      const user = accounts[1];
      const amount = 10;
      await expect(etherDistributor.connect(user).demand(amount)).to.be.revertedWith("Wait for the next epoch.");
    });

    // Registered user makes another demand in the next epoch (2)
    it("Should be able to make another demand in Epoch 2", async function () {
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

    // Registered user makes the claim of the epoch 2 in epoch 3
    it("Should be able to make the claim of Epoch 2", async function () {

      const accounts = await ethers.getSigners();
      const user = accounts[1];

      const userBalanceInitial = await ethers.provider.getBalance(user.address);

      const claimEpoch = 2;
      await mine(await etherDistributor.epochDuration());
      await etherDistributor._updateState();
      // Get the claim amount
      const userInfo = await etherDistributor.getUser(user.address);
      //claim amount is min of (demandedValue and calculateShare[claimepoch])
      const epochShare = await etherDistributor.shares(claimEpoch);
      //console.log("Epoch share: ", epochShare); #Correct
      const claimAmount = Math.min(userInfo[3][claimEpoch], epochShare);

      // Claim and get the transaction receipt
      const tx = await etherDistributor.connect(user).claim(claimEpoch);
      const userBalance = await ethers.provider.getBalance(user.address);
      const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
      const gasUsed = txReceipt.gasUsed;
      const gasPrice = tx.gasPrice;
      const gasCost = gasUsed.mul(gasPrice);

      // check the userInfo[3]claimEpoch is 0
      const userInfoAfterClaim = await etherDistributor.getUser(user.address);
      expect(userInfoAfterClaim[3][claimEpoch]).to.equal(0);

      // convert claim amount to wei
      const claimAmountWei = ethers.utils.parseEther(claimAmount.toString());
      // check the final user balance is equal to the initial balance + claim amount - gas cost
      expect(userBalance).to.equal(userBalanceInitial.add(claimAmountWei).sub(gasCost));

    });

    // Registered user makes the claim of the epoch 1 after DEMAND_EXPIRATION_TIME + 1 (should fail)
    it("Should fail when the user tries to claim after the DEMAND_EXPIRATION_TIME", async function () {
      const accounts = await ethers.getSigners();
      const user = accounts[1];
      const claimEpoch = 1;
      const DEMAND_EXPIRATION_TIME = await etherDistributor.DEMAND_EXPIRATION_TIME();
      await mine((DEMAND_EXPIRATION_TIME + 1) * await etherDistributor.epochDuration());
      await etherDistributor._updateState();
      await expect(etherDistributor.connect(user).claim(claimEpoch)).to.be.revertedWith("Epoch is too old.");
    });
    
    // Registered user makes multiple demands in different epoch first, then after some epoch he calls claimAll function
    it("Should allow the user to make multiple demands then claim all", async function () {
      ({ etherDistributor } = await deployDistributor(DEFAULT_EPOCH_CAPACITY, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE));
      const accounts = await ethers.getSigners();
      const user = accounts[4];
      await etherDistributor.addPermissionedUser(user.address);

      const currentEpoch = await etherDistributor.epoch();
      expect(currentEpoch).to.equal(1); // epoch number is 1
      
      const initialBalance = await ethers.provider.getBalance(user.address);
      expect(initialBalance).to.equal(ethers.utils.parseEther("10000")); // initial balance is 10k ether

      const amount = 10;
      const epochs = 5;
      const claimEpochs = [2, 3, 4, 5, 6];
      const claimAmounts = [10, 10, 10, 10, 10];

      // make demands in different epochs
      for (let i = 0; i < epochs; i++) {
        // mine 1 epoch
        await etherDistributor.connect(user).demand(amount);
        await mine(await etherDistributor.epochDuration());
        await etherDistributor._updateState();
      } 

      // Print the user demand array
      //const userInfo = await etherDistributor.getUser(user.address);
      //console.log("User demand array: ", userInfo[3]);


      // Mine 50 epochs 
      await mine(50 * await etherDistributor.epochDuration());
      await etherDistributor._updateState();

      const userBalanceInitial = await ethers.provider.getBalance(user.address);

      
      // Claim all and get the transaction receipt
      const tx = await etherDistributor.connect(user).claimAll();
      const userBalance = await ethers.provider.getBalance(user.address);

      const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
      const gasUsed = txReceipt.gasUsed;
      const gasPrice = tx.gasPrice;
      const gasCost = gasUsed.mul(gasPrice);


      const userInfoAfterClaim = await etherDistributor.getUser(user.address);

      for (let i = 0; i < epochs; i++) {
        expect(userInfoAfterClaim[3][claimEpochs[i]]).to.equal(0);
      }
      // convert claim amount to wei
      let claimAmountWei = ethers.utils.parseEther("0");
      for (let i = 0; i < epochs; i++) {
        claimAmountWei = claimAmountWei.add(ethers.utils.parseEther(claimAmounts[i].toString()));
        //console.log("claimAmountWei: ", claimAmountWei.toString());
      }
      // check the final user balance is equal to the initial balance + claim amount - gas cost
      expect(userBalance).to.equal(userBalanceInitial.add(claimAmountWei).sub(gasCost));
    });
  });

  describe("Multiple users", function () {

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
  
    async function demandBulk(etherDistributor, accounts, demandArray) {
      for (i = 0; i < Math.min(accounts.length - 1, demandArray.length); i++) {
        await etherDistributor.connect(accounts[i + 1]).demand(demandArray[i]);
      }
    }
  
    describe("Demand", function () {
  
      describe("Single epoch (Independent)", function () {
  
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
  
      describe("Multiple epochs (Cumulative)", function () {
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
  
        it("Should apply Calculation 3 for 50 epochs", async function () {
          const customEpochCapacity = 90;
          const { etherDistributor } = await deployDistributor(customEpochCapacity, DEFAULT_EPOCH_DURATION, DEFAULT_DEPLOYMENT_VALUE);
          const accounts = await ethers.getSigners();
          for (i = 1; i <= 10; i++) {
            etherDistributor.addPermissionedUser(accounts[i].address);
          }
          await mine(1);
  
          // the capacity is never sufficient, so there is never an excess
          for (j = 0; j < 50; j++) {
            await demandBulk(etherDistributor, await ethers.getSigners(), [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
            await mine(DEFAULT_EPOCH_DURATION);
            await etherDistributor._updateState();
  
            var share = await etherDistributor.shares(j + 1);
            expect(share).to.equal(9);
            expect(await etherDistributor.cumulativeCapacity()).to.equal(customEpochCapacity);
          }
        });
  
      });
  
    });
  
    describe("Claim", function () {      
        
      const demandArray =  [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7];
      let etherDistributor;
      this.beforeAll(async function () {
        ({ etherDistributor } = await loadFixture(permissionedDeploymentFixture));
        await demandBulk(etherDistributor, await ethers.getSigners(), demandArray);
      });
  
      describe("Claim single share", function () {
        it("Should allow everyone to claim their calculated shares", async function () {
          await mine(DEFAULT_EPOCH_DURATION);
          await etherDistributor._updateState(); 
          const accounts = await ethers.getSigners();
          const claimEpoch = 1;
          const expectedUserShares = [1, 1, 1, 2, 2, 3, 5, 5, 5, 6, 6, 6, 6]; // for capacity 50
          for (i = 1; i <= 13; i++) {
            const share = await etherDistributor.shares(claimEpoch);
            
            const userInfo =  await etherDistributor.getUser(accounts[i].address);
            const userDemand = userInfo[3][claimEpoch];
            expect(userDemand).to.equal(demandArray[i - 1]); // demand is correct
            
            const userShare = Math.min(share, userDemand);
            expect(userShare).to.equal(expectedUserShares[i - 1]); // calculated share is correct
  
            const initialBalance = await ethers.provider.getBalance(accounts[i].address);
  
            const tx = await etherDistributor.connect(accounts[i]).claim(claimEpoch);
            const userBalance = await ethers.provider.getBalance(accounts[i].address);
            const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
            const gasUsed = txReceipt.gasUsed;
            const gasPrice = tx.gasPrice;
            const gasCost = gasUsed.mul(gasPrice);
  
            const userInfoAfterClaim = await etherDistributor.getUser(accounts[i].address);
            expect(userInfoAfterClaim[3][claimEpoch]).to.equal(0); // demand is reset to 0
  
            const claimAmountWei = ethers.utils.parseEther(userShare.toString());
            expect(userBalance).to.equal(initialBalance.add(claimAmountWei).sub(gasCost)); // transfer is correct
          }
        });
  
        it("Should not allow anyone without a share to claim", async function () {
          const accounts = await ethers.getSigners();
          const userInfo = await etherDistributor.getUser(accounts[19].address);
          const userDemand = userInfo[3][1];
          expect(userDemand).to.equal(0); // demand is 0
          await expect(etherDistributor.connect(accounts[19]).claim(1)).to.be.revertedWith("You do not have a demand for this epoch.");
        });
      });
  
      describe("Claim all", function () {
  
      });
    });
  });
});

async function deployDistributor(epochCapacity, epochDuration, deploymentValue) {
  EtherDistributor = await ethers.getContractFactory("EtherDistributor");
  etherDistributor = await EtherDistributor.deploy(epochCapacity, epochDuration, { value: deploymentValue });
  await etherDistributor.deployed();
  return { EtherDistributor, etherDistributor };
}
