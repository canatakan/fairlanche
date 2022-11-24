# Subnets

## Create an EVM Subnet on Fuji Testnet Using Subnet-CLI

### Prerequisites
* 1+ nodes running on Fuji Testnet (does not need to be a validator)
* subnet-cli installed
* subnet-cli private key with some Fuji AVAX

[Run avalanche node](https://docs.avax.network/nodes/build/run-avalanche-node-manually#connect-to-fuji-testnet)

Note: it may take a while to bootstrap Fuji Testnet from scratch.

### Installation
```
git clone https://github.com/ava-labs/subnet-cli.git;
cd subnet-cli;
go install -v .;
```

### subnet-cli Create Key
```
subnet-cli create key
```

### Build Binary
```
git clone https://github.com/ava-labs/subnet-evm.git
cd subnet-evm
```

### subnet-cli Create VMID
```
subnet-cli create VMID <identifier> [--hash]
```
and build with:
```
./scripts/build.sh build/srEXiWaHuhNyGwPUi444Tu47ZEDwxTWrbQiuD7FmgSAQ6X7Dy
```

### Move Binary

To put the subnet-evm binary in the right place, run the following command (assuming the avalanchego and subnet-evm repos are in the same folder):
```
mv ./subnet-evm/build/srEXiWaHuhNyGwPUi444Tu47ZEDwxTWrbQiuD7FmgSAQ6X7Dy ./avalanchego/build/plugins;
```

### Funding Wallet on Fuji

* Use your private key in the ```.subnet-cli.pk``` file on the web wallet to access this wallet. 
* Pick Fuji on the top right corner as the network and locate your C-Chain address which starts with 0x.
* Request funds from the faucet using your C-Chain address.
* Move the test funds from the C-Chain to the P-Chain by clicking on the Cross Chain on the left side of the web wallet.

### subnet-cli Wizard

subnet-cli wizard,

* Adds all NodeIDs as validators to the primary network (skipping any that already exist)
* Creates a Subnet
* Adds all NodeIDs as validators on the Subnet
* Creates a new blockchain

```
subnet-cli wizard \
--node-ids=NodeID-nBwT3MfSHA4es5o3iB5cMtkPng4eC861 \
--vm-genesis-path=my-genesis.json \
--vm-id=kL1G2oVE8BVXCBFQrwS2QkDnW4SBG86X5NoMSsiLidwyj3itG \
--chain-name=bayysubnet
```
### Add New Subnet to Node Whitelist
```
--whitelisted-subnets=p433wpuXyJiDhyazPYyZMJeaoPSW76CBZ2x7wrVPLgvokotXz --network-id=fuji
```
Finally, restart the node.


--------------------------
## Deploying Subnet with EVM Based Blockchain using AvalancheJS
Creating Subnet and deploying Ethereum Virtual Machine (EVM) based blockchain on that Subnet through your Node.js application using AvalancheJS. 

## Setting up AvalancheGo and Subnet-EVM Binaries

Follow the steps [here](https://docs.avax.network/subnets/create-a-evm-blockchain-on-subnet-with-avalanchejs#setting-up-avalanchego-and-subnet-evm-binaries)








