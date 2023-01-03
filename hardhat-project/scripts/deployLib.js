const hre = require("hardhat"); // Hardhat Runtime Environment

async function main() {
    let Lib = await hre.ethers.getContractFactory("ShareCalculator");
    let lib = await Lib.deploy();
    await lib.deployed();
    console.log("ShareCalculator deployed to:", lib.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
