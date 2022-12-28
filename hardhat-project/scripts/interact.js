const CONTRACT_ADDRESS = "0xd40723d8d583729a93ec9C67e4bfC03568c649B0";

const { ethers } = require("hardhat");
const { RESOURCE_TYPE } = require("./config.js");

async function main() {

  let distributorName, resourceName;
  switch (RESOURCE_TYPE.toLowerCase()) {
    case "native":
      distributorName = "NativeDistributor";
      break;

    case "erc20":
      distributorName = "ERC20Distributor";
      resourceName = "ERC20Resource";
      break;

    case "erc1155":
      distributorName = "ERC1155Distributor";
      resourceName = "ERC1155Resource";
      break;
  }

  const Distributor = await hre.ethers.getContractFactory(distributorName);
  const distributor = await Distributor.attach(CONTRACT_ADDRESS);
  // const resourceAddress = await distributor.token();
  // const resource = await ethers.getContractAt(resourceName, resourceAddress);

  const accounts = await ethers.getSigners();
  // await addPermissionedUser(distributor, accounts[0].address);
  // await addPermissionedUser(distributor, "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC");
  // await approveERC1155(resource, accounts[0]);
  // await deposit(distributor, accounts[0], 10_000);
  // await demand(distributor, accounts[0], 3);
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