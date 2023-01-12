const { Avalanche, BinTools, BN, evm } = require("avalanche")

const { nodeIP, nodePort, protocol, networkID, hrt,
} = require("./config.js")

const bintools = BinTools.getInstance()

const skip = (num) => new Array(num);

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