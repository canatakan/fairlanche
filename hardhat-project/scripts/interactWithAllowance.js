const DEPLOYER_LIST = "0x0200000000000000000000000000000000000000";
const TX_ALLOWLIST = "0x0200000000000000000000000000000000000002";

const { ethers } = require("hardhat");

async function main() {

    // use the precompiled contract to manage the allowlists
    const deployerList = await hre.ethers.getContractAt("IAllowList", DEPLOYER_LIST);
    const txAllowList = await hre.ethers.getContractAt("IAllowList", TX_ALLOWLIST);

    const accounts = await ethers.getSigners();

    console.log(await isAdmin(deployerList, accounts[0].address));
    console.log(await isAdmin(txAllowList, accounts[0].address));

    console.log(await isAdmin(deployerList, accounts[0].address));
    console.log(await isEnabled(deployerList, accounts[0].address));

    //await setNone(deployerList, accounts[0], "0x0b5e872A84D28C440775681f054EF7B00a178fa3");
    //await setAdmin(txAllowList, accounts[0], "0x0b5e872A84D28C440775681f054EF7B00a178fa3");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function isAdmin(allowList, addr) {
    return await allowList.readAllowList(addr) == 2;
}

async function isEnabled(allowList, addr) {
    return await allowList.readAllowList(addr) != 0;
}

async function readAllowList(allowList, addr) {
    return await allowList.readAllowList(addr);
}

async function setAdmin(allowList, user, addr) {
    const tx = await allowList.connect(user).setAdmin(addr);
    await tx.wait();
    console.log("Transaction receipt:");
    console.log(tx)
}

async function setEnabled(allowList, user, addr) {
    const tx = await allowList.connect(user).setEnabled(addr);
    await tx.wait();
    console.log("Transaction receipt:");
    console.log(tx)
}

async function setNone(allowList, user, addr) {
    const tx = await allowList.connect(user).setNone(addr);
    await tx.wait();
    console.log("Transaction receipt:");
    console.log(tx)
}
