const {
    platform,
} = require("./importAPI.js")

async function getBlockchainName(blockchainId) {
    const blockchains = await platform.getBlockchains()
    for (let i = 0; i < blockchains.length; i++) {
        const blockchain = blockchains[i]
        if (blockchain.id === blockchainId) {
            return blockchain.name
        }
    }
}

// getBlockchainName("RDetPA9sXKTyrao84aJ3MgmiDna6DZhuWsgAMkFM7wU1LFfa1")

module.exports = { getBlockchainName }
