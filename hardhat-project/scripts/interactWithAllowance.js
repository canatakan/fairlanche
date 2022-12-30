const DEPLOYMENT_LIST_ADDRESS = "0xCC4702b8E660417B470709065Ac35D3C0fD62Dc9";
const TX_ALLOWLIST_ADDRESS = "0xb7cB1C18E7f82522609654cDe843619Cf621C12b";

const { ethers } = require("hardhat");

async function main() {

    const DeploymentList = await hre.ethers.getContractFactory("DeploymentList");
    const deploymentList = await DeploymentList.attach(DEPLOYMENT_LIST_ADDRESS);

    const TxAllowList = await hre.ethers.getContractFactory("TxAllowList");
    const txAllowList = await TxAllowList.attach(TX_ALLOWLIST_ADDRESS);

    const accounts = await ethers.getSigners();
    // console.log("isAdmin: " + await isAdmin(deploymentList, accounts[0].address));
    // console.log("isAdmin: " + await isAdmin(txAllowList, accounts[0].address));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function isAdmin(allowList, addr) {
    const isAdmin = await allowList.isAdmin(addr);
    return isAdmin;
}

async function isEnabled(allowList, addr) {
    const isEnabled = await allowList.isEnabled(addr);
    return isEnabled;
}

async function setAdmin(allowList, addr) {
    const tx = await allowList.setAdmin(addr);
    await tx.wait();
    console.log("Transaction receipt:");
    console.log(tx);
}

async function setEnabled(allowList, addr) {
    const tx = await allowList.setEnabled(addr);
    await tx.wait();
    console.log("Transaction receipt:");
    console.log(tx);
}

async function revoke(allowList, addr) {
    const tx = await allowList.revoke(addr);
    await tx.wait();
    console.log("Transaction receipt:");
    console.log(tx);
}