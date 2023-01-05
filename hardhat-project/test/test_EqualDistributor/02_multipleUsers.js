const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const {
  deployNativeDistributor,
  demandBulk,
} = require("../test_utils/utils");

const {
  DEFAULT_EPOCH_DURATION,
  DEFAULT_ETHER_MULTIPLIER,
} = require("../test_utils/config");

describe("EqualDistributor multiple users", function () {

  describe("Demand", function () {

    describe("Single epoch (Independent)", function () {

      describe("Share updates", function () {

        it("Should be able to update the share 1 epoch later", async function () {
          let { nativeDistributor } = await deployNativeDistributor(
            {
              _isPermissioned: false,
              _algorithm: "Equal",
            }
          );
          await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(DEFAULT_EPOCH_DURATION);
          await nativeDistributor._updateState();

          // check that the share is correctly stored in the array
          let share = await nativeDistributor.shares(1);
          expect(share).to.equal(3);
        });

        it("Should be able to update the share multiple epochs later", async function () {
          let { nativeDistributor } = await deployNativeDistributor(
            {
              _isPermissioned: false,
              _algorithm: "Equal"
            }
          );
          await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(DEFAULT_EPOCH_DURATION * 5);
          await nativeDistributor._updateState();

          // check that the share is correctly stored in the array
          let share = await nativeDistributor.shares(1);
          expect(share).to.equal(3);
        });

        it("Should not update the share before the epoch is over", async function () {
          let { nativeDistributor } = await deployNativeDistributor(
            {
              _isPermissioned: false,
              _algorithm: "Equal"
            }
          );
          await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(22);
          await nativeDistributor._updateState();

          // check that new share is not stored in the array
          let shares = await nativeDistributor.getShares();
          expect(shares.length).to.equal(1);
        });
      });

      describe("Share and distribution calculations", function () {

        const customEpochCapacities = [50, 38, 90, 5, 1];

        it("50: [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]", async function () {
          let customEpochCapacity = customEpochCapacities[0];
          let { nativeDistributor } = await deployNativeDistributor(
            {
              _isPermissioned: false,
              _algorithm: "Equal",
              _epochCapacity: customEpochCapacity
            }
          );

          await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(DEFAULT_EPOCH_DURATION);
          await nativeDistributor._updateState();

          // check that the share is correctly stored in the array
          let share = await nativeDistributor.shares(1);

          // expect share to be 50 / 13 = 3
          expect(share).to.equal(3);

          // check whether the distribution is 13 * 3 = 39
          expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + 11);
        });

        it("38: [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]", async function () {
          let customEpochCapacity = customEpochCapacities[1];
          let { nativeDistributor } = await deployNativeDistributor(
            {
              _isPermissioned: false,
              _algorithm: "Equal",
              _epochCapacity: customEpochCapacity
            }
          );

          await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
          await mine(DEFAULT_EPOCH_DURATION);
          await nativeDistributor._updateState();

          // check that the share is correctly stored in the array
          let share = await nativeDistributor.shares(1);

          // expect share to be 38 / 13 = 2
          expect(share).to.equal(2);

          // check whether the distribution is 13 * 2 = 26
          expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + 12);
        });

        it("90: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]", async function () {
          let customEpochCapacity = customEpochCapacities[2];
          let { nativeDistributor } = await deployNativeDistributor(
            {
              _isPermissioned: false,
              _algorithm: "Equal",
              _epochCapacity: customEpochCapacity
            }
          );

          await demandBulk(nativeDistributor, await ethers.getSigners(), [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
          await mine(DEFAULT_EPOCH_DURATION);
          await nativeDistributor._updateState();

          // check that the share is correctly stored in the array
          let share = await nativeDistributor.shares(1);
          expect(share).to.equal(9);

          // check whether the distribution is 90, no excessives
          expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity);
        });

        it("5: [5, 2, 2, 5, 1]", async function () {
          let customEpochCapacity = customEpochCapacities[3];
          let { nativeDistributor } = await deployNativeDistributor(
            {
              _isPermissioned: false,
              _algorithm: "Equal",
              _epochCapacity: customEpochCapacity
            }
          );

          await demandBulk(nativeDistributor, await ethers.getSigners(), [5, 2, 2, 5, 1]);
          await mine(DEFAULT_EPOCH_DURATION);
          await nativeDistributor._updateState();

          // check that the share is correctly stored in the array
          let share = await nativeDistributor.shares(1);
          expect(share).to.equal(1);

          // check whether the distribution is 5, no excessives
          expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity);
        });

        it("1: [1, 1, 1, ... , 1]", async function () {
          let customEpochCapacity = customEpochCapacities[4];
          let { nativeDistributor } = await deployNativeDistributor(
            {
              _isPermissioned: false,
              _algorithm: "Equal",
              _epochCapacity: customEpochCapacity
            }
          );

          let accounts = await ethers.getSigners();
          for (i = 0; i < 19; i++) {
            if (i == 0) {
              await nativeDistributor.connect(accounts[i + 1]).demand(1);
            } else {
              // the capacity is just 1, so only the first demand will be accepted
              await expect(nativeDistributor.connect(accounts[i + 1]).demand(1))
                .to.be.revertedWith("Maximum capacity is reached for this epoch");
            }
          }

          await mine(DEFAULT_EPOCH_DURATION);
          await nativeDistributor._updateState();

          // check that the share is correctly stored in the array
          let share = await nativeDistributor.shares(1);
          expect(share).to.equal(1);

          // check whether the distribution is 1, no excessives
          expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity);
        });
      });
    });

    describe("Multiple epochs (Cumulative)", function () {
      it("Should apply Calculation 1 for 2 epochs", async function () {
        let customEpochCapacity = 50;
        let { nativeDistributor } = await deployNativeDistributor(
          {
            _isPermissioned: false,
            _algorithm: "Equal",
            _epochCapacity: customEpochCapacity
          }
        );

        await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
        await mine(DEFAULT_EPOCH_DURATION);
        await nativeDistributor._updateState();

        // cumulativeCapacity = 50, share = 3, distribution = 39, excess = 11
        var share = await nativeDistributor.shares(1);
        expect(share).to.equal(3);
        // new cumulativeCapacity = 50 + 11 (excess) = 61
        expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + 11);

        await demandBulk(nativeDistributor, await ethers.getSigners(), [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7]);
        await mine(DEFAULT_EPOCH_DURATION);
        await nativeDistributor._updateState();

        // cumulativeCapacity = 61, share = 4, distribution = 52, excess = 9
        var share = await nativeDistributor.shares(2);
        expect(share).to.equal(4);
        // new cumulativeCapacity = 50 + 9 (excess) = 59
        expect(await nativeDistributor.cumulativeCapacity()).to.equal(customEpochCapacity + 9);
      });

      it("Should apply Calculation 2 for 5 epochs", async function () {
        let customEpochCapacity = 38;
        let { nativeDistributor } = await deployNativeDistributor(
          {
            _isPermissioned: false,
            _algorithm: "Equal",
            _epochCapacity: customEpochCapacity
          }
        );

        /*
        * Epoch 1: cumulativeCapacity = 38, share = 2, distribution = 26, excess = 12
        * Epoch 2: cumulativeCapacity = 50, share = 3, distribution = 39, excess = 11
        * Epoch 3: cumulativeCapacity = 49, share = 3, distribution = 39, excess = 10
        * Epoch 4: cumulativeCapacity = 48, share = 3, distribution = 39, excess = 9
        * Epoch 5: cumulativeCapacity = 47, share = 3, distribution = 39, excess = 8
        */
        let expectedShares = [2, 3, 3, 3, 3];
        let excessAmounts = [12, 11, 10, 9, 8];
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
        let customEpochCapacity = 90;
        let { nativeDistributor } = await deployNativeDistributor(
          {
            _isPermissioned: false,
            _algorithm: "Equal",
            _epochCapacity: customEpochCapacity,
            _value: ethers.utils.parseEther("4500")
          }
        );

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

      let demandArray = [1, 1, 1, 2, 2, 3, 5, 5, 5, 7, 7, 7, 7];
      let nativeDistributor;
      this.beforeAll(async function () {
        ({ nativeDistributor } = await deployNativeDistributor({ _isPermissioned: false }));
        await demandBulk(nativeDistributor, await ethers.getSigners(), demandArray);
      });

      it("Should allow everyone to claim their calculated shares", async function () {
        await mine(DEFAULT_EPOCH_DURATION);
        await nativeDistributor._updateState();
        let accounts = await ethers.getSigners();
        let claimEpoch = 1;
        let expectedUserShares = [1, 1, 1, 2, 2, 3, 5, 5, 5, 6, 6, 6, 6]; // for capacity 50
        for (i = 1; i <= 13; i++) {
          let share = await nativeDistributor.shares(claimEpoch);

          let userInfo = await nativeDistributor.getUser(accounts[i].address, [claimEpoch]);
          let userDemand = userInfo[0][0];
          expect(userDemand).to.equal(demandArray[i - 1]); // demand is correct

          let userShare = Math.min(share, userDemand);
          expect(userShare).to.equal(expectedUserShares[i - 1]); // calculated share is correct

          let initialBalance = await ethers.provider.getBalance(accounts[i].address);

          let tx = await nativeDistributor.connect(accounts[i]).claim(claimEpoch);
          let userBalance = await ethers.provider.getBalance(accounts[i].address);
          let txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
          let gasUsed = txReceipt.gasUsed;
          let gasPrice = tx.gasPrice;
          let gasCost = gasUsed.mul(gasPrice);

          let userInfoAfterClaim = await nativeDistributor.getUser(accounts[i].address, [claimEpoch]);
          expect(userInfoAfterClaim[0][0]).to.equal(0); // demand is reset to 0

          let claimAmountWei = ethers.utils.parseEther(userShare.toString());
          expect(userBalance).to.equal(initialBalance.add(
            claimAmountWei.mul(DEFAULT_ETHER_MULTIPLIER).div(1000)
          ).sub(gasCost)); // transfer is correct
        }
      });

      it("Should not allow anyone without a share to claim", async function () {
        let accounts = await ethers.getSigners();
        let userInfo = await nativeDistributor.getUser(accounts[19].address, [1]);
        let userDemand = userInfo[0][0];
        expect(userDemand).to.equal(0); // demand is 0
        await expect(nativeDistributor.connect(accounts[19]).claim(1))
          .to.be.revertedWith("You do not have a demand for this epoch.");
      });
    });
  });
});