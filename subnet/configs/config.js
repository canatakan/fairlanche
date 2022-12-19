const dotenv = require("dotenv")
dotenv.config()

module.exports = {
    evmBase: "https://rpc.ankr.com/avalanche_fuji",
    pBase: "https://rpc.ankr.com/avalanche_fuji-p",
    xBase: "https://rpc.ankr.com/avalanche_fuji-x",
    cBase: "https://rpc.ankr.com/avalanche_fuji-c",
    privKey: process.env.PRIVATE_KEY,
}
