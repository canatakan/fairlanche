const hre = require("hardhat"); // Hardhat Runtime Environment

async function main() {
    const DeploymentList = await hre.ethers.getContractFactory("DeploymentList");
    const deploymentList = await DeploymentList.deploy();
    await deploymentList.deployed();
    console.log("DeploymentList is deployed to: " + deploymentList.address);

    const TxAllowList = await hre.ethers.getContractFactory("TxAllowList");
    const txAllowList = await TxAllowList.deploy();
    await txAllowList.deployed();
    console.log("TxAllowList is deployed to: " + txAllowList.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  