# Subnets

## Using AvalancheJS Library to Create & Deploy Subnets

### AvalancheJS Installation

1. Directly clone the AvalancheJS repository to subnet directory

    ```bash
    git clone https://github.com/ava-labs/avalanchejs.git
    ```

2. Build the AvalancheJS library

    ```bash
    cd avalanchejs
    npm run build
    ```

3. Use a node version lower than `v17.0.0` because of the `error:03000086:digital envelope routines::initialization error` error. For example, you can use the following command with `nvm`:
    
    ```bash
    nvm use v15.14.0
    ```

### `config.js` File

1. The `config.js` file currently contains the base URLs for the Ankr's Fuji Testnet endpoints. These endpoints can be found in:

    ```json
    {
        "pBase": "https://rpc.ankr.com/avalanche_fuji-p",
        "xBase": "https://rpc.ankr.com/avalanche_fuji-x",
        "cBase": "https://rpc.ankr.com/avalanche_fuji-c"
    }
    ```

2. Additionally, the `config.js` file reads your private key from the `PRIVATE_KEY` environment variable. You can set this variable in the `.env` file. **Use your P-chain private key**.

3. Currently, the details about our node in AWS are also included in this file. You can prefer using either of nodes in the `importAPI.js` file.


### `importAPI.js` File

With this file, you can import the AvalancheJS library and create an instance of the Avalanche class. The `Avalanche` class is the main class of the AvalancheJS library. It provides access to all the other classes.

The instance of the `Avalanche` class is created with the following parameters:

 ```js
const skip = (num) => new Array(num);
const avalanche = new Avalanche(...skip(3), 5, ...skip(2), "fuji")
```

5 is used for the Fuji Network, and hrp is set to "fuji" as well. Note that the configuration for the node in AWS is a little bit different but it also creates an instance of `Avalanche` in a similar way.


### `createSubnet.js` & `genesis.json` File

This script and the genesis file are taken from the [AvalancheJS documentation](https://docs.avax.network/subnets/create-a-evm-blockchain-on-subnet-with-avalanchejs).


### Node Setup & Staking

1. Before adding a node as a validator to your subnet, your node needs to be:
    - Fully bootstrapped
    - A member of the Primary Network (In order to become a member of the Primary Network, one must stake some AVAX tokens.)

2. In order to handle the staking process, you should call the `addValidator` endpoint from your node. This endpoint is found in the `{{baseURL}}/ext/bc/P` root URL, under `PlatformVM`. The request should look like this: 

    ```json
    {
        "jsonrpc": "2.0",
        "method": "platform.addValidator",
        "params": {
            "nodeID":"{{avalancheNodeId}}",
            "startTime":1671498447,
            "endTime":1673498347,
            "stakeAmount":2000000000,
            "rewardAddress": "{{pchainAddress}}",
            "delegationFeeRate":10,
            "username": "{{avalancheUsername}}",
            "password": "{{avalanchePassword}}"
        },
        "id": 1
    }
    ```

3. To obtain a valid username and password, you need to call `createUser` method in the `{{baseURL}}/ext/keystore` endpoint.

4. After creating the user, you should import your private keys to the keychain. You can do this by calling the `importKey` in both `EVM` and `PlatformVM` endpoints.

5. Getting the node ID can be done by calling the `getNodeID` method in the `{{baseURL}}/ext/info` endpoint.


### Adding a Validator to Your Subnet

You can use the `addSubnetValidator.js` script to add a node as a validator to your subnet. This script was also taken from the [AvalancheJS documentation](https://docs.avax.network/subnets/create-a-evm-blockchain-on-subnet-with-avalanchejs). It adds a node as a validator to your subnet. This script should be run as below:

```bash
addSubnetValidator.js \
--subnetID <YOUR_SUBNET_ID> \
--startTime $(date -v +5M +%s) \
--endTime $(date -v +14d +%s)
```

### Building the VM & Tracking Your Subnet

After adding the node as a validator to your subnet, **you need to restart your node after you follow these steps in your node**:

1. Build the VM with `subnet-evm`. 

    * If you are going to create your blockchain with the `subnetevm` VM, You can simply use the `subnet-evm/scripts/build.sh` command to build the VM.
   
    * After the build, the file will be under `subnet-evm/build` directory.

    * Copy this file to `/usr/local/lib/avalanchego/plugins` directory in AWS. (With Avalanche 1.9.7, it is possible to provide `--plugin-dir` flag to point to the path of the directory that VMs exist.)

2. Track your subnet in your node.
    
    * Include the `--track-subnets` flag in your node's startup command. 
    This flag should include the subnet ID of the subnet you created. For example, the flag should look like this: `--track-subnets="<YOUR_SUBNET_ID>"`.

3. Do not forget to enable the Keystore API. 
   * With Avalanche 1.9.7, the Keystore API is disabled by default. 
   * You can set the relevant flag to true: `--api-keystore-enabled=true`

4. Then, finally restart your node.

    * The final command to restart your node should look like this:

        ```bash
        nohup avalanchego 
        --network-id=fuji 
        --http-host="0.0.0.0" 
        --track-subnets=<YOUR_SUBNET_ID_1>,<YOUR_SUBNET_ID_2> 
        --plugin-dir=/usr/local/lib/avalanchego/plugins
        --api-keystore-enabled=true
        ```

### Creating a Blockchain on Your Subnet

You can use the `createBlockchain.js` script to create a blockchain on your subnet. This script was also taken from the [AvalancheJS documentation](https://docs.avax.network/subnets/create-a-evm-blockchain-on-subnet-with-avalanchejs). It creates a blockchain on your subnet. This script should be run as below:

```bash
node createBlockchain.js \  
--subnetID <YOUR_SUBNET_ID> \
--chainName <YOUR_BLOCKCHAIN_NAME> \
--vmName subnetevm
```

Please note that the `vmName` parameter should be `subnetevm`. For other VMs, you should also build their binaries and copy them to the `/usr/local/lib/avalanchego/plugins` directory in AWS.


## Working on Your Subnet & Blockchain

### View Your Subnet & Blockchain

You can see your subnet and blockchain in the [Avalanche Explorer](https://explorer-xp.avax-test.network/). Your Blockchain ID is shown when you are creating it. The resulting TX ID is the ID of your blockchain.

Example links:

* https://explorer-xp.avax-test.network/tx/WXJDdCGt4CxbtQncHAJB5Ak8aQfdLVYmEkSjSzE4WJBjPJyju
* https://explorer-xp.avax-test.network/blockchain/WXJDdCGt4CxbtQncHAJB5Ak8aQfdLVYmEkSjSzE4WJBjPJyju
* https://explorer-xp.avax-test.network/subnet/2R83sbw7gouwfqCfXzWYxsGm4d4E5VxHpUrA2vM1DevLCfU51s

### Connect to Your Blockchain with Metamask

* To connect with Metamask, you should enter this RPC URL:

    ```bash
    http://<NodeIPAddress>:9650/ext/bc/<BlockchainID>/rpc
    ```

* Also, do not forget to add your custom Chain ID that you specified in the `genesis.json` file to the `Chain ID` field in Metamask.

* You can see more details about connecting to your blockchain with Metamask in the [documentation](https://docs.avax.network/subnets/deploy-a-smart-contract-on-your-evm#step-1-setting-up-metamask).
