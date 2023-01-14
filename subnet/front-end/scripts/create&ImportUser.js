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

  // it is not possible to get hexadecimal representation of C-Chain address
  // so, get the address by importing the private key again
  const cAddresses = []; 
  for (let i = 0; i < xAddresses.length; i++) {
    const address = xAddresses[i]
    const privateKey = await xchain.exportKey(username, password, address)
    const cchainAddress = await cchain.importKey(username, password, privateKey)
    cAddresses.push(cchainAddress)
  }

  return { pAddresses, xAddresses, cAddresses }
}

async function userExists(username) {
  const userList = await keyStoreAPI.listUsers()
  return userList.includes(username)
}

function createKeyPairs(){
  const pair = platform.newKeyChain().makeKey()
  const pchainPair = platform.newKeyChain().importKey(pair.getPrivateKey())
  const xchainPair = xchain.newKeyChain().importKey(pair.getPrivateKey())
  const cchainPair = cchain.newKeyChain().importKey(pair.getPrivateKey())

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
