import { 
    platform,
    xchain,
 } from "./importAPI";

import {
    nodeIP,
    nodePort,
    protocol,
} from "./exportConfig"

async function getBalances(pchainAddress, xchainAddress, cchainAddress) {
    const pchainBalances = await platform.getBalance(pchainAddress);
    const pchainBalance = pchainBalances.balance;
    const xchainBalances = await xchain.getBalance(xchainAddress, "AVAX");
    const xchainBalance = xchainBalances.balance;
    
    // the callMethod of cchain does not work properly, fetch manually:
    const RPC_LINK = protocol + '://' + nodeIP + ':' + nodePort + '/ext/bc/C/rpc';
    const cchainBalance = await fetch(RPC_LINK, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_getBalance",
            "params": [cchainAddress, "latest"]
        })
    }).then(res => res.json()).then(res => res.result);

    return {
        pchainBalance,
        xchainBalance,
        cchainBalance,
    };
} 

export { getBalances };