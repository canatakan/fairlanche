const hre = require("hardhat"); // Hardhat Runtime Environment

const DEPLOYMENT_PARAMS = {
  _contractName: "NativeDistributor",
  _maxDemandVolume: 3,
  _epochCapacity: 5,
  _epochDuration: 1000,
  _etherMultiplier: 1,
  _expirationBlocks: 10000,
  _enableWithdraw: true,
  _value: ethers.utils.parseEther("1"),
};

async function main() {
  const NativeDistributor = await hre.ethers.getContractFactory(DEPLOYMENT_PARAMS._contractName);
  const nativeDistributor = await NativeDistributor.deploy(
    DEPLOYMENT_PARAMS._maxDemandVolume,
    DEPLOYMENT_PARAMS._epochCapacity,
    DEPLOYMENT_PARAMS._epochDuration,
    DEPLOYMENT_PARAMS._etherMultiplier,
    DEPLOYMENT_PARAMS._expirationBlocks,
    DEPLOYMENT_PARAMS._enableWithdraw,
    { value: DEPLOYMENT_PARAMS._value }
  );
  await nativeDistributor.deployed();
  console.log(`${DEPLOYMENT_PARAMS._contractName} is deployed to:`, nativeDistributor.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
