const CONTRACT_ADDRESS = "0x66C695a59C8F748A792bfD6C447627664995d577";

async function main() {
  const EtherDistributor = await hre.ethers.getContractFactory("EtherDistributor");
  const etherDistributor = await EtherDistributor.attach(CONTRACT_ADDRESS);

  // const accounts = await ethers.getSigners();
  // await addPermissionedUser(etherDistributor, accounts[0].address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function addPermissionedUser(etherDistributor, address) {
  const tx = await etherDistributor.addPermissionedUser(address);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function demand(etherDistributor, user, volume) {
  const tx = await etherDistributor.connect(user).demand(volume);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function claim(etherDistributor, user, epochNumber) {
  const tx = await etherDistributor.connect(user).claim(epochNumber);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function claimAll(etherDistributor, user) {
  const tx = await etherDistributor.connect(user).claimAll();
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function withdrawExpired(etherDistributor) {
  const tx = await etherDistributor.withdrawExpired();
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}