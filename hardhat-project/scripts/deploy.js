const hre = require("hardhat"); // Hardhat Runtime Environment

const DEPLOYMENT_PARAMS = {
  _contractName: "NativeDistributor",
  _maxDemandVolume: 3,
  _epochCapacity: 5,
  _epochDuration: 300,
  _etherMultiplier: 1,
  _expirationBlocks: 3000,
  _enableWithdraw: true,
  _value: ethers.utils.parseEther("1"),
};

async function main() {
  const Distributor = await hre.ethers.getContractFactory(DEPLOYMENT_PARAMS._contractName);
  const distributor = await Distributor.deploy(
    DEPLOYMENT_PARAMS._maxDemandVolume,
    DEPLOYMENT_PARAMS._epochCapacity,
    DEPLOYMENT_PARAMS._epochDuration,
    DEPLOYMENT_PARAMS._etherMultiplier,
    DEPLOYMENT_PARAMS._expirationBlocks,
    DEPLOYMENT_PARAMS._enableWithdraw,
    { value: DEPLOYMENT_PARAMS._value }
  );
  await distributor.deployed();
  console.log(`${DEPLOYMENT_PARAMS._contractName} is deployed to:`, distributor.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
