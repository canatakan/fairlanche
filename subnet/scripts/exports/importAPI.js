const { Avalanche, BinTools, BN, evm } = require("avalanche")

// Importing node details and Private key from the config file.
const { nodeIP, nodePort, protocol, networkID, hrt,
  evmAnkrBase, pAnkrBase, xAnkrBase, cAnkrBase,
} = require("./exportConfig.js")

// For encoding and decoding to CB58 and buffers.
const bintools = BinTools.getInstance()

const skip = (num) => new Array(num);

// <<<<<< Avalanche instance with 3rd party API endpoints
// const avalanche = new Avalanche(...skip(3), networkID, ...skip(2), hrt)

// const platform = avalanche.PChain()
// platform.setBaseURL(pAnkrBase)
// const xchain = avalanche.XChain()
// xchain.setBaseURL(xAnkrBase)
// const cchain = avalanche.CChain()
// cchain.setBaseURL(cAnkrBase)

// const info = avalanche.Info()
// info.setBaseURL(cAnkrBase)

// const keyStoreAPI = avalanche.NodeKeys()
// >>>>>>


// <<<<<< Avalanche instance with independent node
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

const keyStoreAPI = avalanche.NodeKeys()
// >>>>>>

// Exporting these for other files to use
module.exports = {
  platform,
  info,
  keyStoreAPI,
  bintools,
  BN,
  xchain,
  cchain,
}