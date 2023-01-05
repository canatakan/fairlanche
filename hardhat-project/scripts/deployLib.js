const hre = require("hardhat"); // Hardhat Runtime Environment

async function main() {
    let Heapified = await hre.ethers.getContractFactory("Heapified");
    let heapified = await Heapified.deploy();
    await heapified.deployed();

    console.log("Heapified deployed to:", heapified.address);

    let SC = await hre.ethers.getContractFactory(
        "ShareCalculator",
        { libraries: { Heapified: heapified.address } }
    );
    let sc = await SC.deploy();
    await sc.deployed();

    console.log("ShareCalculator deployed to:", sc.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
