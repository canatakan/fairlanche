import React from "react";

import { AvalancheTestnet, useEthers } from '@usedapp/core'

export default function WalletConnector() {

  const { account, deactivate, activateBrowserWallet, chainId, switchNetwork } = useEthers()

  if (!account) {
    return (
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={activateBrowserWallet}
      >
        Connect Wallet
      </button>
    )
  }

  if (chainId !== AvalancheTestnet.chainId) {
    return (
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => switchNetwork(AvalancheTestnet.chainId)}
      >
        Switch to Fuji Network
      </button>
    )
  }

  return (
    <div className="flex space-x-4">
      <div className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-2 rounded-md text-sm font-medium cursor-pointer">
      <a
            href={`https://testnet.snowtrace.io/address/${account}`}
            target="_blank"
            rel="noopener noreferrer"
          >

            {account.slice(0, 6) + '...' + account.slice(-4)}
          </a>
      </div>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={deactivate}
      >
        Disconnect Wallet
      </button>
    </div>
  )
}

