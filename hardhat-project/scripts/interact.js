const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
  const NativeDistributor = await hre.ethers.getContractFactory("NativeDistributor");
  const nativeDistributor = await NativeDistributor.attach(CONTRACT_ADDRESS);

  // const accounts = await ethers.getSigners();
  // await addPermissionedUser(nativeDistributor, accounts[0].address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function addPermissionedUser(nativeDistributor, address) {
  const tx = await nativeDistributor.addPermissionedUser(address);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function demand(nativeDistributor, user, volume) {
  const tx = await nativeDistributor.connect(user).demand(volume);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function claim(nativeDistributor, user, epochNumber) {
  const tx = await nativeDistributor.connect(user).claim(epochNumber);
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function claimAll(nativeDistributor, user) {
  const tx = await nativeDistributor.connect(user).claimAll();
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function withdrawExpired(nativeDistributor) {
  const tx = await nativeDistributor.withdrawExpired();
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}

async function burnExpired(nativeDistributor) {
  const tx = await nativeDistributor.burnExpired();
  await tx.wait();
  console.log("Transaction receipt:");
  console.log(tx);
}