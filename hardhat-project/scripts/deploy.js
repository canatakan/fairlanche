const hre = require("hardhat"); // Hardhat Runtime Environment

async function main() {
  const NativeDistributor = await hre.ethers.getContractFactory("NativeDistributor");
  const nativeDistributor = await NativeDistributor.deploy(
    1,
    1000,
    true,
    { value: ethers.utils.parseEther("1") }
  );
  await nativeDistributor.deployed();
  console.log("NativeDistributor deployed to:", nativeDistributor.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
