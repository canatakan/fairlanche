const {
    platform,
} = require("./importAPI.js")
const { listUserAddresses } = require("./create&ImportUser.js")

async function createBlockchain(
    username,
    password,
    subnetID,
    genesis,
    chainName
) {

    const userAddresses = await listUserAddresses(username, password)
    const pAddress = userAddresses.pAddresses[0]

    // Getting keys with the credentials
    const pKey = await platform.exportKey(username, password, pAddress)
    const pKeyChain = platform.newKeyChain()
    const keyPair = pKeyChain.importKey(pKey)

    // Getting UTXOs
    const utxoResponse = await platform.getUTXOs([pAddress])
    const utxos = utxoResponse.utxos

    // Getting CB58 encoded bytes of genesis
    genesisBytes = JSON.stringify(genesis)

    // Creating Subnet auth
    const subnetAuth = [[0, platform.parseAddress(pAddress)]]

    // Creating unsgined tx
    const unsignedTx = await platform.buildCreateChainTx(
        utxos, // set of utxos this tx is consuming
        [pAddress], // from
        [pAddress], // change
        subnetID, // id of Subnet on which chain is being created
        chainName, // Name of blockchain
        "subnetevm", // Name of the VM this chain is referencing
        [], // Array of feature extensions
        genesisBytes, // Stringified geneis JSON file
        undefined, // memo
        undefined, // asOf
        subnetAuth // Subnet owners' address indices signing this tx
    )

    // signing unsgined tx with pKeyChain
    const tx = unsignedTx.sign(pKeyChain)

    // issuing tx
    const txId = await platform.issueTx(tx)
    pKeyChain.removeKey(keyPair)
    return txId
}

module.exports = { createBlockchain }