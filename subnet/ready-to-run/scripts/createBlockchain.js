const args = require("yargs").argv

const genesisJSON = require("../configs/precompiledGenesis.json")
const {
  platform,
  pKeyChain,
  pAddressStrings,
  bintools,
  utxoSet,
} = require("./importAPI")

// Returns string representing vmName of the provided vmID
function convertCB58ToString(cb58Str) {
  const buff = bintools.cb58Decode(cb58Str)
  return buff.toString()
}

// Creating blockchain with the subnetID, chain name and vmID (CB58 encoded VM name)
async function createBlockchain() {
  const { subnetID, chainName } = args

  // Generating vmName if only vmID is provied, else assigning args.vmID
  const vmName =
    typeof args.vmName !== "undefined"
      ? args.vmName
      : convertCB58ToString(args.vmID)

  // Getting CB58 encoded bytes of genesis
  genesisBytes = JSON.stringify(genesisJSON)

  const pAddresses = pKeyChain.getAddresses()

  // Creating Subnet auth
  const subnetAuth = [[0, pAddresses[0]]]

  // Creating unsgined tx
  const unsignedTx = await platform.buildCreateChainTx(
    await utxoSet(), // set of utxos this tx is consuming
    pAddressStrings, // from
    pAddressStrings, // change
    subnetID, // id of Subnet on which chain is being created
    chainName, // Name of blockchain
    vmName, // Name of the VM this chain is referencing
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
}

createBlockchain()