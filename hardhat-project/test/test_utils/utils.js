const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const {
    DEFAULT_TOKEN_CONTRACT_ADDRESS,
    DEFAULT_TOKEN_ID,
    DEFAULT_MAX_DEMAND_VOLUME,
    DEFAULT_EPOCH_CAPACITY,
    DEFAULT_EPOCH_DURATION,
    DEFAULT_ETHER_MULTIPLIER,
    DEFAULT_EXPIRATION_BLOCKS,
    DEFAULT_ENABLE_WITHDRAW,
    DEFAULT_DEPLOYMENT_VALUE,
} = require("./config");

async function deployNativeDistributor(
    {
        _maxDemandVolume = DEFAULT_MAX_DEMAND_VOLUME,
        _epochCapacity = DEFAULT_EPOCH_CAPACITY,
        _epochDuration = DEFAULT_EPOCH_DURATION,
        _etherMultiplier = DEFAULT_ETHER_MULTIPLIER,
        _expirationBlocks = DEFAULT_EXPIRATION_BLOCKS,
        _enableWithdraw = DEFAULT_ENABLE_WITHDRAW,
        _value = ethers.utils.parseEther(DEFAULT_DEPLOYMENT_VALUE.toString()),
    } = {}
) {
    NativeDistributor = await ethers.getContractFactory("TestNativeDistributor");
    nativeDistributor = await NativeDistributor.deploy(
        _maxDemandVolume,
        _epochCapacity,
        _epochDuration,
        _etherMultiplier,
        _expirationBlocks,
        _enableWithdraw,
        { value: _value }
    );
    await nativeDistributor.deployed();
    return { NativeDistributor, nativeDistributor };
}

async function deployERC20Distributor(
    {
        _tokenContract = DEFAULT_TOKEN_CONTRACT_ADDRESS,
        _maxDemandVolume = DEFAULT_MAX_DEMAND_VOLUME,
        _epochCapacity = DEFAULT_EPOCH_CAPACITY,
        _epochDuration = DEFAULT_EPOCH_DURATION,
        _etherMultiplier = DEFAULT_ETHER_MULTIPLIER,
        _expirationBlocks = DEFAULT_EXPIRATION_BLOCKS,
        _enableWithdraw = DEFAULT_ENABLE_WITHDRAW,
    } = {}
) {
    // ERC20Distributor = await ethers.getContractFactory("TestERC20Distributor");
    ERC20Distributor = await ethers.getContractFactory("ERC20Distributor");
    erc20Distributor = await ERC20Distributor.deploy(
        _tokenContract,
        _maxDemandVolume,
        _epochCapacity,
        _epochDuration,
        _etherMultiplier,
        _expirationBlocks,
        _enableWithdraw
    );
    await erc20Distributor.deployed();
    return { ERC20Distributor, erc20Distributor };
}

async function deployERC1155Distributor(
    {
        _tokenContract = DEFAULT_TOKEN_CONTRACT_ADDRESS,
        _tokenId = DEFAULT_TOKEN_ID,
        _maxDemandVolume = DEFAULT_MAX_DEMAND_VOLUME,
        _epochCapacity = DEFAULT_EPOCH_CAPACITY,
        _epochDuration = DEFAULT_EPOCH_DURATION,
        _etherMultiplier = DEFAULT_ETHER_MULTIPLIER,
        _expirationBlocks = DEFAULT_EXPIRATION_BLOCKS,
        _enableWithdraw = DEFAULT_ENABLE_WITHDRAW,
    } = {}
) {
    // ERC1155Distributor = await ethers.getContractFactory("TestERC1155Distributor");
    ERC1155Distributor = await ethers.getContractFactory("ERC1155Distributor");
    erc1155Distributor = await ERC1155Distributor.deploy(
        _tokenContract,
        _tokenId,
        _maxDemandVolume,
        _epochCapacity,
        _epochDuration,
        _etherMultiplier,
        _expirationBlocks,
        _enableWithdraw
    );
    await erc1155Distributor.deployed();
    return { ERC1155Distributor, erc1155Distributor };
}


async function deployERC20Resource(
    {
        _name = "Test Token",
        _symbol = "TT20",
        _premintAmount = ethers.utils.parseEther("100000"),
        _maximumSupply = ethers.utils.parseEther("1000000"),
    } = {}
) {
    ERC20Resource = await ethers.getContractFactory("ERC20Resource");
    erc20Resource = await ERC20Resource.deploy(
        _name,
        _symbol,
        _premintAmount,
        _maximumSupply
    );
    await erc20Resource.deployed();
    return { ERC20Resource, erc20Resource };
}

async function deployERC1155Resource(
    {
        _name = "Test Token",
        _symbol = "TST1155",
        _uri = "https://<EXAMPLE_WEBSITE>/api/item/{id}.json",
        _premintIds = [0, 1, 2],
        _premintSupplies = [
            100_000,
            100_000,
            100_000
        ],
        _maximumSupplies = [
            1_000_000,
            1_000_000,
            1_000_000
        ]
    } = {}
) {
    ERC1155Resource = await ethers.getContractFactory("ERC1155Resource");
    erc1155Resource = await ERC1155Resource.deploy(
        _name,
        _symbol,
        _uri,
        _premintIds,
        _premintSupplies,
        _maximumSupplies
    );
    await erc1155Resource.deployed();
    return { ERC1155Resource, erc1155Resource };
}


async function permissionedDeploymentFixture() {
    let NativeDistributor, nativeDistributor;
    ({ NativeDistributor, nativeDistributor } = await deployNativeDistributor());
    const accounts = await ethers.getSigners();
    for (i = 1; i < 20; i++) {
        nativeDistributor.addPermissionedUser(accounts[i].address);
    }
    await mine(1);
    return { NativeDistributor, nativeDistributor };
}


async function demandBulk(nativeDistributor, accounts, demandArray) {
    for (i = 0; i < Math.min(accounts.length - 1, demandArray.length); i++) {
        await nativeDistributor.connect(accounts[i + 1]).demand(demandArray[i]);
    }
}

module.exports = {
    deployNativeDistributor,
    deployERC20Distributor,
    deployERC1155Distributor,
    deployERC20Resource,
    deployERC1155Resource,
    permissionedDeploymentFixture,
    demandBulk
};
