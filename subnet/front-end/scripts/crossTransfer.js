const {
    platform,
    xchain,
    cchain,
} = require("./importAPI.js")

async function exportAvaxC(username, password, xAddress, amount) {
    // 1_000_000_000 = 1 AVAX
    const cTxID = await cchain.exportAVAX(
        username,
        password,
        xAddress,
        amount
    )

    let txReceipt;

    do {
        txReceipt = await cchain.getAtomicTxStatus(cTxID)
    } while (txReceipt != 'Accepted') {
        txReceipt = await cchain.getAtomicTxStatus(cTxID)
    }
    console.log("successfully exported from C chain")

    const xTxID = await xchain.import(
        username,
        password,
        xAddress,
        "C",
    )

    txReceipt = null
    do {
        txReceipt = await xchain.getTxStatus(xTxID)
    } while (txReceipt != 'Accepted') {
        await new Promise(r => setTimeout(r, 1500));
        txReceipt = await xchain.getTxStatus(xTxID)
    }
    console.log("successfully imported to X chain")
}

async function importAvaxP(username, password, pAddress, amount) {
    
    const xTxID = await xchain.export(
        username,
        password,
        pAddress,
        amount - 2_000_000,
        "AVAX",
    )

    let txReceipt;
    do {
        txReceipt = await xchain.getTxStatus(xTxID)
    } while (txReceipt != 'Accepted') {
        await new Promise(r => setTimeout(r, 1500));
        txReceipt = await xchain.getTxStatus(xTxID)
    }

    console.log("successfully exported from X chain")

    const pTxID = await platform.importAVAX(
        username,
        password,
        pAddress,
        "X",
    )

    txReceipt = await platform.getTxStatus(pTxID)
    console.log("successfully imported to P chain")
}

async function sendCToP(username, password, xAddress, pAddress, amount) {
    await exportAvaxC(username, password, xAddress, amount)
    await importAvaxP(username, password, pAddress, amount)
}

module.exports = { sendCToP }