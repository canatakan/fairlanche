const args = require("yargs").argv
const {
  platform,
  info,
  pKeyChain,
  pAddressStrings,
  utxoSet,
  BN,
} = require("./importAPI.js")

async function addSubnetValidator() {
  let {
    nodeID = await info.getNodeID(),
    startTime,
    endTime,
    weight = 20,
    subnetID,
  } = args

  console.log("Node ID: ", nodeID)

  const pAddresses = pKeyChain.getAddresses()

  // Creating Subnet auth
  const subnetAuth = [[0, pAddresses[0]]]

  // Creating unsgined tx
  const unsignedTx = await platform.buildAddSubnetValidatorTx(
    await utxoSet(), // set of utxos this tx will consume
    pAddressStrings, // from
    pAddressStrings, // change
    nodeID, // node id of the validator
    new BN(startTime), // timestamp after which validation starts
    new BN(endTime), // timestamp after which validation ends
    new BN(weight), // weight of the validator
    subnetID, // Subnet id for validation
    undefined, // memo
    undefined, // asOf
    subnetAuth // Subnet owners' address indices signing this tx
  )
  
  console.log("Unsigned Tx: ", unsignedTx.toBuffer().toString("hex"))

  // signing unsgined tx with pKeyChain
  const tx = unsignedTx.sign(pKeyChain)

  console.log("Tx: ", tx.toBuffer().toString("hex"))

  // issuing tx
  //const txId = await platform.issueTx(tx)
  //console.log("Tx ID: ", txId)
}

addSubnetValidator()