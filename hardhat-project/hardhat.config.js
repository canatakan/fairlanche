require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

const fs = require('fs');
const readline = require('readline');

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

// add positional param:
task("deploy", "Runs the deploy script")
  .addPositionalParam(
    "resource",
    "The resource type to deploy distribution contract for. Can be 'native', 'erc20' or 'erc1155'",
    "native",
    types.string
  )
  .setAction(async ({ resource }) => {

    resource = resource.toLowerCase();
    if (!["native", "erc20", "erc1155"].includes(resource)) {
      throw new Error("Invalid resource type");
    }

    // the following is a hack to replace the RESOURCE_TYPE variable in the config.js file
    // this is done because hardhat doesn't support running scripts with arguments
    let rl = readline.createInterface({
      input: fs.createReadStream('./scripts/config.js'),
      console: false,
    });

    rl.on("line", (line) => {
      if (line.includes("RESOURCE_TYPE")) {
        let newLine = line.replace(/native|erc20|erc1155/, resource);
        let newContent = fs.readFileSync('./scripts/config.js').toString().replace(line, newLine);
        fs.writeFileSync('./scripts/config.js', newContent);
        rl.close();
        return;
      }
    });

    await hre.run("run", { script: "./scripts/deploy.js" });
  });

task("interact", "Runs the interact script", async (_, hre) => {
  await hre.run("run", { script: "./scripts/interact.js" });
});