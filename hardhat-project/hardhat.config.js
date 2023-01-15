require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

const fs = require('fs');
const readline = require('readline');

const dotenv = require("dotenv")
dotenv.config()

const { nodeIP, nodePort } = require("../subnet/ready-to-run/configs/config.js");
const data = require('../subnet/ready-to-run/configs/precompiledGenesis.json');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      accounts: {
        count: 20,
        accountsBalance: "100000000000000000000000",
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
    subnet: {
      url: "http://" + nodeIP + ":" + nodePort + "/ext/bc/" +
        "RDetPA9sXKTyrao84aJ3MgmiDna6DZhuWsgAMkFM7wU1LFfa1" + "/rpc",
      accounts: [process.env.AVALANCHE_TEST_PRIVATE_KEY],
      chainId: data["config"]["chainId"],
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

task("deploy", "Runs the deploy script")
  .addPositionalParam(
    "resource",
    "The resource type to deploy distribution contract for. Can be 'native', 'erc20' or 'erc1155'",
    "native",
    types.string
  )
  .addPositionalParam(
    "isPermissioned",
    "Whether the distribution contract will be public or not. \
    Should be 'public' or 'false', any other value will be considered 'permissioned'",
    "",
    types.string
  )
  .setAction(async ({ resource, isPermissioned }) => {

    resource = resource.toLowerCase();
    if (!["native", "erc20", "erc1155", "allowance", "lib", "tokens"].includes(resource)) {
      throw new Error("Invalid resource type");
    }

    if (resource == 'allowance') {
      await hre.run("run", { script: "./scripts/deployAllowance.js" });
      return;
    } else if (resource == 'lib') {
      await hre.run("run", { script: "./scripts/deployLib.js" });
      return;
    } else if (resource == 'tokens') {
      await hre.run("run", { script: "./scripts/deployTokens.js" });
      return;
    }

    if (isPermissioned.toLowerCase() == "public"
      || isPermissioned.toLowerCase() == "false") {
      isPermissioned = false;
    } else {
      isPermissioned = true;
    }

    await deployResourceContract(resource, isPermissioned);
  });

task("interact", "Runs the interact script")
  .addPositionalParam(
    "allowance",
    "Whether the interaction with allowance contracts will be run. \
    Its value should be 'allowance' for running interactWithAllowance.js.",
    "",
    types.string
  )
  .setAction(async ({ allowance }) => {

    if (allowance.toLowerCase() == "allowance") {
      await hre.run("run", { script: "./scripts/interactWithAllowance.js" });
    } else {
      await hre.run("run", { script: "./scripts/interact.js" });
    }
  });

// with this override, test scripts can be run as follows:
// npx hardhat test ERC20 ERC1155 Native
task("test", "Runs the test script", async (taskArgs, hre) => {

  let newFileList = [];
  let redirectToSuper = false;
  for (let i = 0; i < taskArgs.testFiles.length; i++) {
    if (taskArgs.testFiles[i].toLowerCase() == 'erc20') {
      newFileList.push('./test/test_ERC20Distributor/01_basics.js');
      newFileList.push('./test/test_ERC20Distributor/02_transfers.js');
    } else if (taskArgs.testFiles[i].toLowerCase() == 'erc1155') {
      newFileList.push('./test/test_ERC1155Distributor/01_basics.js');
      newFileList.push('./test/test_ERC1155Distributor/02_transfers.js');
    } else if (taskArgs.testFiles[i].toLowerCase() == 'native') {
      newFileList.push('./test/test_NativeDistributor/01_basics.js');
      newFileList.push('./test/test_NativeDistributor/02_singleUser.js');
      newFileList.push('./test/test_NativeDistributor/03_multipleUsers.js');
      newFileList.push('./test/test_NativeDistributor/04_gasRefund.js');
    } else if (taskArgs.testFiles[i].toLowerCase() == 'public') {
      newFileList.push('./test/test_PublicDistributor/01_basics.js');
      newFileList.push('./test/test_PublicDistributor/02_singleUser.js');
      newFileList.push('./test/test_PublicDistributor/03_multipleUsers.js');
    } else if (taskArgs.testFiles[i].toLowerCase() == 'smf') {
      newFileList.push('./test/test_SMFDistributor/01_singleUser.js');
      newFileList.push('./test/test_SMFDistributor/02_multipleUsers.js');
    } else if (taskArgs.testFiles[i].toLowerCase() == 'equal') {
      newFileList.push('./test/test_EqualDistributor/01_singleUser.js');
      newFileList.push('./test/test_EqualDistributor/02_multipleUsers.js');
    } else {
      // if the argument is not one of the above, then it is a file name
      redirectToSuper = true;
      break;
    }
  }

  if (!redirectToSuper) {
    taskArgs.testFiles = newFileList;
  }
  await runSuper(taskArgs, hre);
});

async function deployResourceContract(resource, isPermissioned) {
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
    } else if (line.includes("IS_PERMISSIONED")) {
      let newLine = line.replace(/true|false/, isPermissioned);
      let newContent = fs.readFileSync('./scripts/config.js').toString().replace(line, newLine);
      fs.writeFileSync('./scripts/config.js', newContent);
      rl.close();
      return;
    }
  });

  await hre.run("run", { script: "./scripts/deploy.js" });
}

