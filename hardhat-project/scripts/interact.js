const { ethers } = require("hardhat");

// the resource type is fetched from the config.js file
// by default, you interact with the latest deployed resource
const { RESOURCE_TYPE, IS_PERMISSIONED } = require("./config.js");

const INTERACT_CONFIG = {
  resourceType: RESOURCE_TYPE, // "native", "erc20" or "erc1155"
  isPermissioned: IS_PERMISSIONED, // true or false
  contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
};

async function interact({
  resourceType,
  isPermissioned,
  contractAddress,
}) {

  let distributorName, resourceName;

  switch (resourceType.toLowerCase()) {
    case "native":
      distributorName = "NativeDistributor";
      if (isPermissioned) distributorName = "PNativeDistributor";
      break;

    case "erc20":
      distributorName = "ERC20Distributor";
      if (isPermissioned) distributorName = "PERC20Distributor";
      resourceName = "ERC20Resource";
      break;

    case "erc1155":
      distributorName = "ERC1155Distributor";
      if (isPermissioned) distributorName = "PERC1155Distributor";
      resourceName = "ERC1155Resource";
      break;

    default:
      throw new Error("Invalid resource type");
  }

  const Distributor = await hre.ethers.getContractFactory(distributorName);
  const distributor = await Distributor.attach(contractAddress);

  // FOR ERC20 & ERC1155:
  // const resourceAddress = await distributor.token();
  // const resource = await ethers.getContractAt(resourceName, resourceAddress);

  const accounts = await ethers.getSigners();
  // await addPermissionedUser(distributor, accounts[0].address);
  // await addPermissionedUser(distributor, "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC");

  // FOR ERC20:
  // await approveERC20(resource, accounts[0], ethers.utils.parseEther("100000"));
  // await deposit(distributor, accounts[0], ethers.utils.parseEther("100000"));

  // FOR ERC1155:
  // await approveERC1155(resource, accounts[0]);
  // await deposit(distributor, accounts[0], 100_000);

  // await demand(distributor, accounts[0], 3);
}

async function main() {
  interact(INTERACT_CONFIG);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function addPermissionedUser(distributor, address) {
  const tx = await distributor.addPermissionedUser(address);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function demand(distributor, user, volume) {
  const tx = await distributor.connect(user).demand(volume);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function claim(distributor, user, epochNumber) {
  const tx = await distributor.connect(user).claim(epochNumber);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function claimBulk(distributor, user, epochNumbers) {
  const tx = await distributor.connect(user).claimBulk(epochNumbers);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function withdrawExpired(distributor) {
  const tx = await distributor.withdrawExpired();
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function burnExpired(distributor) {
  const tx = await distributor.burnExpired();
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

// ERC20 & ERC1155 specific
async function approveERC20(erc20Resource, user, volume) {
  const tx = await erc20Resource.connect(user)
    .approve(CONTRACT_ADDRESS, volume);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function approveERC1155(erc1155Resource, user) {
  const tx = await erc1155Resource.connect(user)
    .setApprovalForAll(CONTRACT_ADDRESS, true);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function deposit(ercDistributor, user, volume) {
  const tx = await ercDistributor.connect(user).deposit(volume);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}