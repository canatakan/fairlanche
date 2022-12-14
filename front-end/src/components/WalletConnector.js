import React from "react";

import { useEthers } from '@usedapp/core'


function WalletConnector() {

  const { account, deactivate, activateBrowserWallet } = useEthers()

  return (
    <div className="flex items-center">
      {account ? (
        <div className="flex items-center">
          <div className="flex items-center">
            <img className="block h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Workflow" />
          </div>
          <div className="flex space-x-4">
            <div className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                {account.slice(0, 6) + '...' + account.slice(-4)}
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                deactivate()
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            activateBrowserWallet()
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WalletConnector;