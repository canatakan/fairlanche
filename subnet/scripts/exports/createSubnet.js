const {
  platform,
} = require("./importAPI.js")

async function createSubnet(username, password, pAddressStrings) {
  console.log("Creating subnet...", username, password, pAddressStrings)
  const tx = await platform.createSubnet(
    username, 
    password, 
    pAddressStrings,
    1
  )
  return tx
}

module.exports = { createSubnet }