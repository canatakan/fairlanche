const {
    platform,
} = require("./importAPI.js")

async function createBlockchain(
    username,
    password,
    subnetID,
    genesis,
    chainName
) {

    // Getting keys with the credentials
    const pKey = await platform.exportKey(username, password)
    const pKeyChain = platform.newKeyChain()
    pKeyChain.importKey(pKey)

    // Getting addresses
    const pAddresses = pKeyChain.getAddresses()
    const pAddressStrings = pKeyChain.getAddressStrings()

    // Getting UTXOs
    const utxos = await platform.getUTXOs(pAddressStrings)

    // Getting CB58 encoded bytes of genesis
    genesisBytes = JSON.stringify(genesis)

    // Creating Subnet auth
    const subnetAuth = [[0, pAddresses[0]]]

    // Creating unsgined tx
    const unsignedTx = await platform.buildCreateChainTx(
        utxos, // set of utxos this tx is consuming
        pAddressStrings, // from
        pAddressStrings, // change
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
    console.log("Create chain transaction ID: ", txId)

    pKeyChain.removeKey(pKey)
}

module.exports = { createBlockchain }