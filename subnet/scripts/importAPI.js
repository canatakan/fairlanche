const { Avalanche, BinTools, BN, evm } = require("avalanche")

// Importing node details and Private key from the config file.
const { evmBase, pBase, xBase, cBase, privKey } = require("../configs/config")

// For encoding and decoding to CB58 and buffers.
const bintools = BinTools.getInstance()

// Avalanche instance with 3rd party API endpoints
const skip = (num) => new Array(num);
// const avalanche = new Avalanche(...skip(3), 5, ...skip(2), "fuji")

// const platform = avalanche.PChain()
// platform.setBaseURL(pBase)
// const xchain = avalanche.XChain()
// xchain.setBaseURL(xBase)
// const cchain = avalanche.CChain()
// cchain.setBaseURL(cBase)

//info.setBaseURL(cBase)

// Avalanche instance with independent node
const avalanche = new Avalanche(
  "18.188.152.131", // ip
  9650, // port
  "http", // protocol
  5, // avax: 1, fuji: 5, custom: 1337, local: 12345
  ...skip(2), // xchainID, cchainID
  "fuji" // hrt
)

const platform = avalanche.PChain()
const xchain = avalanche.XChain()
const cchain = avalanche.CChain()

const info = avalanche.Info()

// Keychain for signing transactions
const pKeyChain = platform.keyChain()
pKeyChain.importKey(privKey)
const pAddressStrings = pKeyChain.getAddressStrings()
console.log("Platform address: ", pAddressStrings[0])

// UTXOs for spending unspent outputs
const utxoSet = async () => {
  const platformUTXOs = await platform.getUTXOs(pAddressStrings)
  return platformUTXOs.utxos
}

// Exporting these for other files to use
module.exports = {
  platform,
  info,
  pKeyChain,
  pAddressStrings,
  bintools,
  utxoSet,
  BN,
  xchain,
  cchain,
}