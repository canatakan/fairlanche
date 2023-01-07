const {
    platform,
} = require("./importAPI.js")

async function getBlockchainName(subnetId, blockchainId) {
    const blockchains = await platform.validates(subnetId)
    for (let i = 0; i < blockchains.length; i++) {
        const blockchain = blockchains[i]
        if (blockchain === blockchainId) {
            return blockchain
        }
    }
}

// getBlockchainName(
//     "nPbdoDFdf9i4N8kjRwkU6QcfgTWPAtGijEd4b3osoZWhibdRy",
//     "RDetPA9sXKTyrao84aJ3MgmiDna6DZhuWsgAMkFM7wU1LFfa1")

module.exports = { getBlockchainName }
