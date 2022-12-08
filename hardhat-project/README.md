# EtherDistributor Hardhat Project

## Overview

This is a Hardhat project that contains the EtherDistributor contract. The contract is used to distribute native assets of any blockchain to the permissioned users in a fair manner.

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

There are comprehensive tests for the EtherDistributor contract. The tests are written using the Hardhat framework. Some important commands are listed below.

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

To deploy the EtherDistributor contract on Avalanche Fuji testnet, run the following command:

```bash
npx hardhat run scripts/deploy.js --network fuji
```

The EtherDistributor contract is currently deployed on the Avalanche Fuji testnet. The contract address is verified on Snowtrace. The contract can be found at [0x66C695a59C8F748A792bfD6C447627664995d577](https://testnet.snowtrace.io/address/0x66c695a59c8f748a792bfd6c447627664995d577#readContract).


## Interacting with the Deployed Contract

To interact with the deployed contract, use the `interact.js` script. The script contains all the necessary functions. **After providing the contract address**, the script can be run with the following command:

```bash
npx hardhat run scripts/interact.js --network fuji
```
