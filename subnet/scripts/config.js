const dotenv = require("dotenv")
dotenv.config()

module.exports = {
    pBase: "https://rpc.ankr.com/avalanche_fuji-p",
    xBase: "https://rpc.ankr.com/avalanche_fuji-x",
    cBase: "https://rpc.ankr.com/avalanche_fuji-c",
    privKey: process.env.PRIVATE_KEY,
}
