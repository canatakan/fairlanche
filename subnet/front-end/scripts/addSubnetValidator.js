const { platform, BN } = require("./importAPI.js")

async function addSubnetValidator(username, password, nodeID, subnetID) {
    
    const startTime = new Date(Date.now() + 5 * 60 * 1000)
    const endTime = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

    // then drop miliseconds in startTime and endTime:
    startTime.setMilliseconds(0)
    endTime.setMilliseconds(0)

    const weight = new BN(32) // 20 in hex

    const txID = platform.addSubnetValidator(
        username,
        password,
        nodeID,
        subnetID,
        startTime,
        endTime,
        weight
    )

    return txID
}

module.exports = { addSubnetValidator }