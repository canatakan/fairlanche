const {
  platform,
} = require("./importAPI.js")

async function createSubnet(username, password, pAddressStrings) {
  
  const platformUTXOs = await platform.getUTXOs(pAddressStrings)
  const utxos = platformUTXOs.utxos

  const unsignedTx = await platform.buildCreateSubnetTx(
    utxos, // set of utxos this tx will consume
    pAddressStrings, // from
    pAddressStrings, // change address
    pAddressStrings // Subnet owners' address array
  )

  // signing unsgined tx with pKeyChain
  const privateKey = platform.exportKey(username, password, pAddressStrings[0])
  const pKeyChain = platform.keyChain()
  const pair = pKeyChain.importKey(privateKey)
  const tx = unsignedTx.sign(pKeyChain)
  pKeyChain.removeKey(pair)

  // issuing tx
  const txId = await platform.issueTx(tx)
  console.log("Tx ID: ", txId)
  return txId
}

module.exports = { createSubnet }