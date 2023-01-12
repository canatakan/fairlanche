const dotenv = require("dotenv")
dotenv.config()

module.exports = {
    nodeIP: "18.188.152.131",
    nodePort: 9650,
    protocol: "http",
    networkID: 5, // avax: 1, fuji: 5, custom: 1337, local: 12345
    hrt: "fuji",
    evmAnkrBase: "https://rpc.ankr.com/avalanche_fuji",
    pAnkrBase: "https://rpc.ankr.com/avalanche_fuji-p",
    xAnkrBase: "https://rpc.ankr.com/avalanche_fuji-x",
    cAnkrBase: "https://rpc.ankr.com/avalanche_fuji-c",
    privKey: process.env.PRIVATE_KEY,
}