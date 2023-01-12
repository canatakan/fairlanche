const fs = require("fs");

const deployerAdmins = fs.readFileSync(
    "./configs/addresses/deployerAdmins.txt", "utf8"
).split("\n").slice(0, -1);
const deployerAllowList = fs.readFileSync(
    "./configs/addresses/deployers.txt", "utf8"
).split("\n").slice(0, -1);

const txAllowListAdmins = fs.readFileSync(
    "./configs/addresses/txAllowListAdmins.txt", "utf8"
).split("\n").slice(0, -1);
const txAllowList = fs.readFileSync(
    "./configs/addresses/txAllowList.txt", "utf8"
).split("\n").slice(0, -1);

// in .csv file, first column is address, second column is amount
const allocations = fs.readFileSync(
    "./configs/addresses/allocations.csv", "utf8"
).split("\n").reduce((allocations, line) => {
    var [address, amount] = line.split(",");
    if (address && amount) {
        address = address.slice(2);
        allocations[address] = {
            // convert to hex & multiply with 10^18:
            balance: "0x" + (BigInt(amount) * BigInt(10 ** 18))
                .toString(16)
        };
    }
    return allocations;
}, {}
);

const lowFeeConfig = require("./fee_configs/low.json");
const mediumFeeConfig = require("./fee_configs/medium.json");
const highFeeConfig = require("./fee_configs/high.json");

const genesis = {
    "config": {
        "chainId": 314159,
        "homesteadBlock": 0,
        "eip150Block": 0,
        "eip150Hash": "0x2086799aeebeae135c246c65021c82b4e15a2c451340993aacfd2751886514f0",
        "eip155Block": 0,
        "eip158Block": 0,
        "byzantiumBlock": 0,
        "constantinopleBlock": 0,
        "petersburgBlock": 0,
        "istanbulBlock": 0,
        "muirGlacierBlock": 0,
        "subnetEVMTimestamp": 0,
        "feeConfig": highFeeConfig,
        "contractDeployerAllowListConfig": {
            "blockTimestamp": 0,
            "adminAddresses": deployerAdmins,
            "enabledAddresses": deployerAllowList
        },
        "txAllowListConfig": {
            "blockTimestamp": 0,
            "adminAddresses": txAllowListAdmins,
            "enabledAddresses": txAllowList
        },
        "allowFeeRecipients": false
    },
    "alloc": allocations,
    "nonce": "0x0",
    "timestamp": "0x0",
    "extraData": "0x00",
    "gasLimit": "0x7A1200",
    "difficulty": "0x0",
    "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "coinbase": "0x0000000000000000000000000000000000000000",
    "number": "0x0",
    "gasUsed": "0x0",
    "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
}

fs.writeFileSync(
    "./configs/buildedGenesis.json",
    JSON.stringify(genesis, null, 4)
);
