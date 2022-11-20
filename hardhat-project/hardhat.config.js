require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
};

task("accounts", "Prints the list of accounts with balances", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    const balance = ethers.utils.formatEther(await account.getBalance());
    console.log(account.address, "(" + balance + " ETH)");
  }
});
