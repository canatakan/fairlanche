const { Avalanche, BinTools, BN, evm } = require("avalanche")

// Importing node details and Private key from the config file.
const { nodeIP, nodePort, protocol, networkID, hrt,
  evmAnkrBase, pAnkrBase, xAnkrBase, cAnkrBase,
  privKey } = require("../configs/config")

// For encoding and decoding to CB58 and buffers.
const bintools = BinTools.getInstance()

// Avalanche instance with 3rd party API endpoints
const skip = (num) => new Array(num);
// const avalanche = new Avalanche(...skip(3), networkID, ...skip(2), hrt)

// const platform = avalanche.PChain()
// platform.setBaseURL(pAnkrBase)
// const xchain = avalanche.XChain()
// xchain.setBaseURL(xAnkrBase)
// const cchain = avalanche.CChain()
// cchain.setBaseURL(cAnkrBase)

//info.setBaseURL(cAnkrBase)

// Avalanche instance with independent node
const avalanche = new Avalanche(
  nodeIP,
  nodePort,
  protocol,
  networkID,
  ...skip(2), // skip xchainID, cchainID
  hrt
)

const platform = avalanche.PChain()
const xchain = avalanche.XChain()
const cchain = avalanche.CChain()

const info = avalanche.Info()

// Keychain for signing transactions
const pKeyChain = platform.keyChain()
pKeyChain.importKey(privKey)
const pAddressStrings = pKeyChain.getAddressStrings()

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