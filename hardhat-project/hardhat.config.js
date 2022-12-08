require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

const dotenv = require("dotenv")
dotenv.config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      accounts: {
        count: 20,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [process.env.AVALANCHE_TEST_PRIVATE_KEY],
      chainId: 43113,
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: [process.env.AVALANCHE_PRIVATE_KEY],
      chainId: 43114,
    },
  },

  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      avalanche: process.env.SNOWTRACE_API_KEY,
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY,
    }
  },
};

task("accounts", "Prints the list of accounts with balances", async (_, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const balance = ethers.utils.formatEther(await account.getBalance());
    console.log("[" + i + "]", account.address, "(" + balance + " ETH)");
  }
});
