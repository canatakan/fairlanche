const hre = require("hardhat"); // Hardhat Runtime Environment

const {
  ERC20_RESOURCE_PARAMS,
  ERC1155_RESOURCE_PARAMS,
} = require("./config.js");

async function deployTokens() {
  const ERC20 = await hre.ethers.getContractFactory("ERC20Resource");
  const ERC1155 = await hre.ethers.getContractFactory("ERC1155Resource");

  const erc20 = await ERC20.deploy(
    ERC20_RESOURCE_PARAMS._name,
    ERC20_RESOURCE_PARAMS._symbol,
    ERC20_RESOURCE_PARAMS._premintSupply,
    ERC20_RESOURCE_PARAMS._maximumSupply
  );
  await erc20.deployed();
  console.log("ERC20 is deployed to:", erc20.address);

  const erc1155 = await ERC1155.deploy(
    ERC1155_RESOURCE_PARAMS._name,
    ERC1155_RESOURCE_PARAMS._symbol,
    ERC1155_RESOURCE_PARAMS._uri,
    ERC1155_RESOURCE_PARAMS._premintIds,
    ERC1155_RESOURCE_PARAMS._premintSupplies,
    ERC1155_RESOURCE_PARAMS._maximumSupplies,
  );
  await erc1155.deployed();
  console.log("ERC1155 is deployed to:", erc1155.address);
}

async function main() {
  await deployTokens();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
