const { platform } = require("./importAPI.js")

async function addSubnetValidator(username, password, nodeID, subnetID) {
    
    const startTime = Date.now() + 5 * 60 * 1000
    const endTime = Date.now() + 14 * 24 * 60 * 60 * 1000

    const txID = platform.addSubnetValidator(
        username,
        password,
        nodeID,
        subnetID,
        startTime,
        endTime,
        20
    )

    return txID
}

module.exports = { addSubnetValidator }