const hre = require("hardhat"); // Hardhat Runtime Environment

const {
  RESOURCE_TYPE,
  NATIVE_DEPLOYMENT_PARAMS,
  ERC20_DEPLOYMENT_PARAMS,
  ERC1155_DEPLOYMENT_PARAMS,
  ERC20_RESOURCE_PARAMS,
  ERC1155_RESOURCE_PARAMS,
} = require("./config.js");

async function deploy(contractName = "NativeDistributor") {

  let Distributor, distributor, tokenContractAddress;

  switch (contractName.toLowerCase()) {
    case "nativedistributor":
      contractName = "NativeDistributor";
      Distributor = await hre.ethers.getContractFactory(contractName);
      distributor = await Distributor.deploy(
        NATIVE_DEPLOYMENT_PARAMS._maxDemandVolume,
        NATIVE_DEPLOYMENT_PARAMS._epochCapacity,
        NATIVE_DEPLOYMENT_PARAMS._epochDuration,
        NATIVE_DEPLOYMENT_PARAMS._etherMultiplier,
        NATIVE_DEPLOYMENT_PARAMS._expirationBlocks,
        NATIVE_DEPLOYMENT_PARAMS._enableWithdraw,
        { value: NATIVE_DEPLOYMENT_PARAMS._value }
      );
      break;

    case "erc20distributor":
      tokenContractAddress = ERC20_DEPLOYMENT_PARAMS._tokenContract;
      if (tokenContractAddress === null) {
        // first deploy the token contract and get the address:
        let ERC20 = await hre.ethers.getContractFactory("ERC20Resource");
        let erc20 = await ERC20.deploy(
          ERC20_RESOURCE_PARAMS._name,
          ERC20_RESOURCE_PARAMS._symbol,
          ERC20_RESOURCE_PARAMS._premintSupply,
          ERC20_RESOURCE_PARAMS._maximumSupply
        );
        await erc20.deployed();
        tokenContractAddress = erc20.address;
        console.log("ERC20Resource is deployed to: " + tokenContractAddress);
      }
      contractName = "ERC20Distributor";
      Distributor = await hre.ethers.getContractFactory(contractName);
      distributor = await Distributor.deploy(
        tokenContractAddress,
        ERC20_DEPLOYMENT_PARAMS._maxDemandVolume,
        ERC20_DEPLOYMENT_PARAMS._epochCapacity,
        ERC20_DEPLOYMENT_PARAMS._epochDuration,
        ERC20_DEPLOYMENT_PARAMS._etherMultiplier,
        ERC20_DEPLOYMENT_PARAMS._expirationBlocks,
        ERC20_DEPLOYMENT_PARAMS._enableWithdraw
      );
      break;

    case "erc1155distributor":
      tokenContractAddress = ERC1155_DEPLOYMENT_PARAMS._tokenContract;
      if (tokenContractAddress === null) {
        // first deploy the token contract and get the address:
        let ERC1155 = await hre.ethers.getContractFactory("ERC1155Resource");
        let erc1155 = await ERC1155.deploy(
          ERC1155_RESOURCE_PARAMS._name,
          ERC1155_RESOURCE_PARAMS._symbol,
          ERC1155_RESOURCE_PARAMS._uri,
          ERC1155_RESOURCE_PARAMS._premintIds,
          ERC1155_RESOURCE_PARAMS._premintSupplies,
          ERC1155_RESOURCE_PARAMS._maximumSupplies
        );
        await erc1155.deployed();
        tokenContractAddress = erc1155.address;
        console.log("ERC1155Resource is deployed to: " + tokenContractAddress);
      }
      contractName = "ERC1155Distributor";
      Distributor = await hre.ethers.getContractFactory(contractName);
      distributor = await Distributor.deploy(
        tokenContractAddress,
        ERC1155_DEPLOYMENT_PARAMS._tokenId,
        ERC1155_DEPLOYMENT_PARAMS._maxDemandVolume,
        ERC1155_DEPLOYMENT_PARAMS._epochCapacity,
        ERC1155_DEPLOYMENT_PARAMS._epochDuration,
        ERC1155_DEPLOYMENT_PARAMS._etherMultiplier,
        ERC1155_DEPLOYMENT_PARAMS._expirationBlocks,
        ERC1155_DEPLOYMENT_PARAMS._enableWithdraw
      );
      break;

    default:
      throw new Error("This contract name is not supported:" + contractName);
  }

  if (distributor === undefined) {
    throw new Error("distributor is undefined");
  }

  await distributor.deployed();
  console.log(contractName, "is deployed to:", distributor.address);
}

async function main() {
  await deploy(RESOURCE_TYPE + "Distributor");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
