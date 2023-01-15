const { ethers } = require("hardhat");

// "native", "erc20", "erc1155"
const RESOURCE_TYPE = "erc1155";
const IS_PERMISSIONED = true;
const ALGORITHM = "QMF";
const SHARE_CALCULATOR_ADDRESS = "0x30fbd74b5eA995A279416c16e02f281bB478837B";

const NATIVE_DEPLOYMENT_PARAMS = {
    _maxDemandVolume: 3,
    _epochCapacity: 5,
    _epochDuration: 600,
    _etherMultiplier: 1,
    _expirationBlocks: 3000,
    _enableWithdraw: true,
    _value: ethers.utils.parseEther("1"),
};

const ERC20_DEPLOYMENT_PARAMS = {
    _tokenContract: "0xcD1c77b27F488Bb225b1C604629918d0240C2C3a",
    _maxDemandVolume: 300,
    _epochCapacity: 500,
    _epochDuration: 600,
    _etherMultiplier: 1000,
    _expirationBlocks: 3000,
    _enableWithdraw: true,
};

const ERC1155_DEPLOYMENT_PARAMS = {
    _tokenContract: "0x38A244Ef32099fB90C15D22c1BEE33bE14d185bF",
    _tokenId: 0,
    _maxDemandVolume: 300,
    _epochCapacity: 500,
    _epochDuration: 600,
    _etherMultiplier: 1000,
    _expirationBlocks: 3000,
    _enableWithdraw: true,
};

const ERC20_RESOURCE_PARAMS = {
    _name: "Test Resource",
    _symbol: "TST20",
    _premintSupply: ethers.utils.parseEther("100000"),
    _maximumSupply: ethers.utils.parseEther("1000000"),
};

const ERC1155_RESOURCE_PARAMS = {
    _name: "Test Resource",
    _symbol: "TST1155",
    _uri: "https://<EXAMPLE_WEBSITE>/api/item/{id}.json",
    _premintIds: [0, 1, 2],
    _premintSupplies: [
        100_000,
        100_000,
        100_000
    ],
    _maximumSupplies: [
        1_000_000,
        1_000_000,
        1_000_000
    ],
};


module.exports = {
    RESOURCE_TYPE,
    IS_PERMISSIONED,
    ALGORITHM,
    SHARE_CALCULATOR_ADDRESS,
    NATIVE_DEPLOYMENT_PARAMS,
    ERC20_DEPLOYMENT_PARAMS,
    ERC1155_DEPLOYMENT_PARAMS,
    ERC20_RESOURCE_PARAMS,
    ERC1155_RESOURCE_PARAMS,
};