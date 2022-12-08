const hre = require("hardhat"); // Hardhat Runtime Environment

async function main() {
  const EtherDistributor = await hre.ethers.getContractFactory("EtherDistributor");
  const etherDistributor = await EtherDistributor.deploy(
    1,
    1000,
    true,
    { value: ethers.utils.parseEther("1") }
  );
  await etherDistributor.deployed();
  console.log("EtherDistributor deployed to:", etherDistributor.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
