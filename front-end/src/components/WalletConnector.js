import React, { useEffect, useState } from "react";
import web3 from "../web3";


function WalletConnector() {
  const [account, setAccount] = useState(localStorage.getItem("userAccount"));

  useEffect(() => {
    web3.eth.getAccounts().then((accounts) => {
      setAccount(accounts[0]);
    });
  }, []);

  return (
    <div className="flex items-center">
        {account ? (
            <div className="flex items-center">
                <div className="flex items-center">
                    <img className="block h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Workflow" />
                </div>
                <div className="flex space-x-4">
                    <div className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                        {account.substring(0, 6) + "..." + account.substring(account.length - 4, account.length)}
                    </div>
                </div>
            </div>
        ) : (
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                    window.ethereum.request({ method: "eth_requestAccounts" }).
                    then((accounts) => {
                        setAccount(accounts[0]);
                        localStorage.setItem("userAccount", accounts[0]);
                    }
                )}}
            >
                Connect Wallet
            </button>
        )}
    </div>
  );
}

export default WalletConnector;