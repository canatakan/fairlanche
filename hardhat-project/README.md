# NativeDistributor Hardhat Project

## Overview

This is a Hardhat project that contains the NativeDistributor contract. The contract is used to distribute native assets of any blockchain to the permissioned users in a fair manner.

## Hardhat Configurations & `.env` File

In the current config file, the information about both the Avalanche Fuji testnet and mainnet is provided. The Avalanche Fuji testnet is used for testing the contract. 

Additionally, the `.env` file contains both the private key of the account that will be used to deploy the contract and the blockchain scanner API keys in order to verify the source code of the deployed contract. 

To use the Avalanche Fuji testnet, the following information is required in the `.env` file, **as provided in the `example.env` file**:

```bash
AVALANCHE_PRIVATE_KEY = <YOUR_PRIVATE_KEY>
AVALANCHE_TEST_PRIVATE_KEY = <YOUR_PRIVATE_KEY>
ETHERSCAN_API_KEY = <YOUR_API_KEY>
SNOWTRACE_API_KEY = <YOUR_API_KEY>
```

## Testing

There are comprehensive tests for the NativeDistributor contract. The tests are written using the Hardhat framework. Some important commands are listed below.

1. To run the tests, run the following command.
    ```bash
    npx hardhat test
    ```

2. To generate the test coverage report, run the following command.
    ```bash
    npx hardhat coverage
    ```

3. To generate the gas usage report, run the following command.

    ```bash
    REPORT_GAS=true npx hardhat test
    ```

## Deployment on Testnet

To deploy the NativeDistributor contract on Avalanche Fuji testnet, run the following command:

```bash
npx hardhat run scripts/deploy.js --network fuji
```

The NativeDistributor contract is currently deployed on the Avalanche Fuji testnet. The contract address is verified on Snowtrace. The contract can be found at [0x66C695a59C8F748A792bfD6C447627664995d577](https://testnet.snowtrace.io/address/0x66c695a59c8f748a792bfd6c447627664995d577#readContract).


## Interacting with the Deployed Contract

To interact with the deployed contract, use the `interact.js` script. The script contains all the necessary functions. **After providing the contract address**, the script can be run with the following command:

```bash
npx hardhat run scripts/interact.js --network fuji
```

## Verifying Contract Source Code

After filling the API key details in the `.env` file, the contract source code can be verified on Snowtrace. To verify the contract source code, run the following command:

```bash
npx hardhat verify --network fuji <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGUMENTS>
```

Here, the `CONTRACT_ADDRESS` is the address of the deployed contract and the `CONSTRUCTOR_ARGUMENTS` are the arguments that were passed to the constructor of the contract. They can be provided in the following format:

```bash
<ARGUMENT_1> <ARGUMENT_2> ... <ARGUMENT_N>
```

Arguments can also be provided in JavaScript files. Enter the correct constructor arguments in the `./scripts/verify/{contractName}Args.js` file and run the verify command with the `--constructor-args` flag. An example command is given below:

```bash
npx hardhat verify --constructor-args ./scripts/verify/erc20Args.js --network fuji <CONTRACT_ADDRESS>
```
