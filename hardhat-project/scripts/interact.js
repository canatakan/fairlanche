const CONTRACT_ADDRESS = "0x320747f4D026A08919DDa6fD3ed6B703a060e67B";

async function main() {
  const NativeDistributor = await hre.ethers.getContractFactory("NativeDistributor");
  const nativeDistributor = await NativeDistributor.attach(CONTRACT_ADDRESS);

  // const accounts = await ethers.getSigners();
  // await addPermissionedUser(nativeDistributor, accounts[0].address);
  // await addPermissionedUser(nativeDistributor, "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC");
  // await demand(nativeDistributor, accounts[0], 3);
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

async function claimBulk(nativeDistributor, user, epochNumbers) {
  const tx = await nativeDistributor.connect(user).claimBulk(epochNumbers);
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