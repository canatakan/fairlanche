const {
    cchain
}  = require("./importAPI.js")

async function exportPrivateKeys(
    username,
    password,
    cAddress,
) {
    const privateKeyObj = await cchain.exportKey(username, password, cAddress)
    const privateKey = privateKeyObj.privateKey
    const privateKeyHex = privateKeyObj.privateKeyHex

    return {
        privateKey,
        privateKeyHex
    }
}

module.exports = {exportPrivateKeys}