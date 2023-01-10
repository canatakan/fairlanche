const {
    platform,
    pKeyChain,
    pAddressStrings,
    utxoSet,
  } = require("./importAPI.js")
  
  async function createSubnet() {
    // Creating unsgined tx
    const unsignedTx = await platform.buildCreateSubnetTx(
      await utxoSet(), // set of utxos this tx will consume
      pAddressStrings, // from
      pAddressStrings, // change address
      pAddressStrings // Subnet owners' address array
    )
  
    // signing unsgined tx with pKeyChain
    const tx = unsignedTx.sign(pKeyChain)
  
    // issuing tx
    const txId = await platform.issueTx(tx)
    console.log("Tx ID: ", txId)
  }
  
  createSubnet()