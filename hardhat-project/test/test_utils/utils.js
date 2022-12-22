const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const {
    DEFAULT_MAX_DEMAND_VOLUME,
    DEFAULT_EPOCH_CAPACITY,
    DEFAULT_EPOCH_DURATION,
    DEFAULT_ETHER_MULTIPLIER,
    DEFAULT_EXPIRATION_BLOCKS,
    DEFAULT_ENABLE_WITHDRAW,
    DEFAULT_DEPLOYMENT_VALUE,
} = require("./config");

async function deployDistributor(
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


async function permissionedDeploymentFixture() {
    let NativeDistributor, nativeDistributor;
    ({ NativeDistributor, nativeDistributor } = await deployDistributor());
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

module.exports = { deployDistributor, permissionedDeploymentFixture, demandBulk };
