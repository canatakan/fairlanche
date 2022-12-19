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

### `config.js` File

1. In `config.js` file, add the code currently contains the base URLs for the Ankr's Fuji Testnet endpoints. These endpoints can be found in:

```json
{
    pBase: "https://rpc.ankr.com/avalanche_fuji-p",
    xBase: "https://rpc.ankr.com/avalanche_fuji-x",
    cBase: "https://rpc.ankr.com/avalanche_fuji-c"
}
```

2. Additionally, the `config.js` file reads your private key from the `PRIVATE_KEY` environment variable. You can set this variable in the `.env` file. **Use your P-chain private key**.


### `importAPI.js` File

With this file, you can import the AvalancheJS library and create an instance of the Avalanche class. The `Avalanche` class is the main class of the AvalancheJS library. It provides access to all the other classes.

The instance of the `Avalanche` class is created with the following parameters:

 ```js
const skip = (num) => new Array(num);
const avalanche = new Avalanche(...skip(3), 5, ...skip(2), "fuji")
```

5 is used for the Fuji Network, and hrp is set to "fuji" as well.

### `createSubnet.js` & `genesis.json` File

This script and the genesis file are taken from the [AvalancheJS documentation](https://docs.avax.network/subnets/create-a-evm-blockchain-on-subnet-with-avalanchejs).