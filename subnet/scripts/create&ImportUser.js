const {
  platform,
  keyStoreAPI,
} = require("./importAPI.js")

async function createUser(username, password) {
  return await keyStoreAPI.createUser(username, password)
}

async function listUserAddresses(username, password) {
  return await platform.listAddresses(username, password)
}

async function userExists(username) {
  const userList = await keyStoreAPI.listUsers()
  console.log(userList)
  return userList.includes(username)
}

async function createKeyPair() {
  return pair = platform.keyChain().makeKey()
}

async function importKey(username, password, pair) {
  const address = await platform.importKey(
    username, password, pair.getPrivateKeyString()
  )
  platform.keyChain().removeKey(pair)
  return address
}

async function createAndImport(username, password) {
  await createUser(username, password)
  const pair = await createKeyPair()
  const newAddress = await importKey(username, password, pair)
  return newAddress 
}

module.exports = { userExists, listUserAddresses, createAndImport }
