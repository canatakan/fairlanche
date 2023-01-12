import { 
    platform,
    xchain,
 } from "./importAPI";

import {
    nodeIP,
    nodePort,
    protocol,
} from "./config"

async function getBalances(pchainAddress, xchainAddress, cchainAddress) {
    const pchainBalances = await platform.getBalance(pchainAddress);
    const pchainBalance = pchainBalances.balance / 1_000_000_000;
    const xchainBalances = await xchain.getBalance(xchainAddress, "AVAX");
    const xchainBalance = xchainBalances.balance / 1_000_000_000;
    
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

    const cchainBalanceInGwei = parseInt(cchainBalance.replace("0x", ""), 16);
    const cchainBalanceInAVAX = (cchainBalanceInGwei / 1_000_000_000) / 1_000_000_000;

    // drop after three digits
    const  cchainBalanceRounded = Math.floor(cchainBalanceInAVAX * 1000) / 1000;

    return {
        pchainBalance,
        xchainBalance,
        cchainBalance: cchainBalanceRounded,
    };
} 

export { getBalances };