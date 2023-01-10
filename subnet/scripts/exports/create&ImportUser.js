const {
  xchain,
  cchain,
  platform,
  keyStoreAPI,
} = require("./importAPI.js")

async function createUser(username, password) {
  return await keyStoreAPI.createUser(username, password)
}

async function listUserAddresses(username, password) {
  const pAddresses = await platform.listAddresses(username, password)
  const xAddresses = await xchain.listAddresses(username, password)

  const cAddresses = []; 

  return { pAddresses, xAddresses, cAddresses }
}

async function userExists(username) {
  const userList = await keyStoreAPI.listUsers()
  return userList.includes(username)
}

function createKeyPairs(){
  const pair = platform.keyChain().makeKey()
  const pchainPair = platform.keyChain().importKey(pair.getPrivateKey())
  const xchainPair = xchain.keyChain().importKey(pair.getPrivateKey())
  const cchainPair = cchain.keyChain().importKey(pair.getPrivateKey())

  return { 
    pchain: pchainPair,
    xchain: xchainPair,
    cchain: cchainPair
  }
}

async function importKeys(username, password, pairs) {
  const pAddress = await platform.importKey(
    username, 
    password, 
    pairs.pchain.getPrivateKeyString()
  )
  platform.keyChain().removeKey(pairs.pchain)

  const xAddress = await xchain.importKey(
    username,
    password,
    pairs.xchain.getPrivateKeyString()
  )
  xchain.keyChain().removeKey(pairs.xchain)

  const cAddress = await cchain.importKey(
    username,
    password,
    pairs.cchain.getPrivateKeyString()
  )
  cchain.keyChain().removeKey(pairs.cchain)

  return { pAddress, xAddress, cAddress }
}

async function createAndImport(username, password) {
  await createUser(username, password)
  const pairs = createKeyPairs()
  const {
    pAddress,
    xAddress,
    cAddress
  } = await importKeys(username, password, pairs)
  console.log(pAddress, xAddress, cAddress)
  return { pAddress, xAddress, cAddress } 
}

module.exports = { userExists, listUserAddresses, createAndImport }
