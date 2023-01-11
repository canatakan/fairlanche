import React, { useState } from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/fontawesome-free-solid";

import { ethers } from "ethers";

import {
    userExists,
    listUserAddresses,
    createAndImport
} from "subnet/scripts/exports/create&ImportUser";
import { getBalances } from 'subnet/scripts/exports/getBalances';
import { sendCToP } from "subnet/scripts/exports/crossTransfer";

const WalletCard = () => {
    const [pChainWallet, setPChainWallet] = useState(
        localStorage.getItem("N-" + window.ethereum.selectedAddress)
            ? JSON.parse(localStorage.getItem("N-" + window.ethereum.selectedAddress)).pAddress
            : null
    );
    const [xChainWallet, setXChainWallet] = useState(
        localStorage.getItem("N-" + window.ethereum.selectedAddress)
            ? JSON.parse(localStorage.getItem("N-" + window.ethereum.selectedAddress)).xAddress
            : null
    );
    const [cChainWallet, setCChainWallet] = useState(
        localStorage.getItem("N-" + window.ethereum.selectedAddress)
            ? JSON.parse(localStorage.getItem("N-" + window.ethereum.selectedAddress)).cAddress
            : null
    );
    const [pBalance, setPBalance] = useState(
        localStorage.getItem("N-" + window.ethereum.selectedAddress)
            ? JSON.parse(localStorage.getItem("N-" + window.ethereum.selectedAddress)).pBalance
            : 0
    );
    const [xBalance, setXBalance] = useState(
        localStorage.getItem("N-" + window.ethereum.selectedAddress)
            ? JSON.parse(localStorage.getItem("N-" + window.ethereum.selectedAddress)).xBalance
            : 0
    );
    const [cBalance, setCBalance] = useState(
        localStorage.getItem("N-" + window.ethereum.selectedAddress)
            ? JSON.parse(localStorage.getItem("N-" + window.ethereum.selectedAddress)).cBalance
            : 0
    );

    const handleFundPChain = async () => {
        const {
            checksumAddr: username,
            signature: password,
        } = await getSignature();

        const val = ethers.utils.parseUnits("2", "ether").toHexString()
        const tx = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [
                {
                    from: window.ethereum.selectedAddress,
                    to: cChainWallet,
                    value: val
                },
            ],
        });

        let receipt;
        do {
            receipt = await window.ethereum.request({
                method: 'eth_getTransactionReceipt',
                params: [tx],
            });
        } while (receipt == null) {
            await new Promise(r => setTimeout(r, 1500));
            receipt = await window.ethereum.request({
                method: 'eth_getTransactionReceipt',
                params: [tx],
            });
        }

        const amount = 2_000_000_000;
        await sendCToP(username, password, xChainWallet, pChainWallet, amount);
    };

    const handleRefreshBalances = async () => {
        const balances = await getBalances(
            pChainWallet,
            xChainWallet,
            cChainWallet
        );
        let nodeAddresses = JSON.parse(localStorage.getItem("N-" + window.ethereum.selectedAddress));
        nodeAddresses.pBalance = balances.pchainBalance;
        nodeAddresses.xBalance = balances.xchainBalance;
        nodeAddresses.cBalance = balances.cchainBalance;
        localStorage.setItem(
            "N-" + window.ethereum.selectedAddress,
            JSON.stringify(nodeAddresses)
        );
        setPBalance(balances.pchainBalance);
        setXBalance(balances.xchainBalance);
        setCBalance(balances.cchainBalance);
    }

    const handleAccessWallet = async () => {

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const currentAccount = accounts[0];
        let nodeAddresses = localStorage.getItem("N-" + currentAccount);

        if (nodeAddresses == null ||
            nodeAddresses.pAddress == null ||
            nodeAddresses.xAddress == null ||
            nodeAddresses.cAddress == null
        ) {
            const {
                pAddress,
                xAddress,
                cAddress,
                username,
                password
            } = await accessWallets();
            localStorage.setItem(
                currentAccount, {
                pAddress,
                xAddress,
                cAddress,
            });
            nodeAddresses = {
                pAddress,
                xAddress,
                cAddress,
            };
        }

        const balances = await getBalances(
            nodeAddresses.pAddress,
            nodeAddresses.xAddress,
            nodeAddresses.cAddress
        );

        nodeAddresses.pBalance = balances.pchainBalance;
        nodeAddresses.xBalance = balances.xchainBalance;
        nodeAddresses.cBalance = balances.cchainBalance;

        localStorage.setItem(
            "N-" + currentAccount,
            JSON.stringify(nodeAddresses)
        );

        setPChainWallet(nodeAddresses.pAddress);
        setXChainWallet(nodeAddresses.xAddress);
        setCChainWallet(nodeAddresses.cAddress);
        setPBalance(balances.pchainBalance);
        setXBalance(balances.xchainBalance);
        setCBalance(balances.cchainBalance);
    };

    const getSignature = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const currentAccount = accounts[0];
        const checksumAddr = ethers.utils.getAddress(currentAccount);
        const message = "Sign this message to access your P-Chain account in the node."
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, currentAccount],
        });
        return { checksumAddr, signature };
    };

    const accessWallets = async () => {
        const { checksumAddr, signature } = await getSignature();
        if (!await userExists(checksumAddr)) {
            const {
                pAddress, xAddress, cAddress
            } = await createAndImport(checksumAddr, signature);
            console.log(pAddress, xAddress, cAddress);
            localStorage.setItem(
                "N-" + checksumAddr.toLowerCase(), JSON.stringify({
                    "pAddress": pAddress,
                    "xAddress": xAddress,
                    "cAddress": cAddress,
                }));
            return {
                pAddress,
                xAddress,
                cAddress,
                username: checksumAddr,
                password: signature
            };
        } else {
            console.log(localStorage)
            const { pAddresses, xAddresses } = await listUserAddresses(checksumAddr, signature);
            return {
                pAddress: pAddresses[0],
                xAddress: xAddresses[0],
                cAddress: JSON.parse(localStorage.getItem("N-" + checksumAddr.toLowerCase())).cAddress,
                username: checksumAddr,
                password: signature
            };
        }
    };

    return (
        <div className="bg-white pl-6 pr-6 pb-6 pt-2 rounded-lg border border-2 border-gray-300 rounded-md">
            <div className="flex flex-row items-center justify-center">
                <h2 className="text-lg p-2 font-medium">Wallet Balances</h2>
                {pChainWallet && xChainWallet && cChainWallet && (
                    <div
                        className="btn p-2 hover:bg-gray-200 rounded font-weight-bold text-center cursor-pointer"
                        onClick={() => {
                            handleRefreshBalances();
                        }}
                    >
                        <FontAwesomeIcon icon={faSync} />
                    </div>
                )}
            </div>
            <div className="text-left color-gray-500">
                {pChainWallet && (
                    <div className="mb-1 border border-1 border-gray-300 rounded-md p-2">
                        P-Chain ({pBalance} AVAX):<br></br>
                        <div className="text-blue-500 hover:underline cursor-pointer"
                            onClick={() => window.open("https://explorer-xp.avax-test.network/address/" + pChainWallet, "_blank")}>
                            {pChainWallet}
                        </div>
                    </div>
                )}
                {xChainWallet && (
                    <div className="mb-1 border border-1 border-gray-300 rounded-md p-2">
                        X-Chain ({xBalance} AVAX):<br></br>
                        <div className="text-blue-500 hover:underline cursor-pointer"
                            onClick={() => window.open("https://explorer-xp.avax-test.network/address/" + xChainWallet, "_blank")}>
                            {xChainWallet}
                        </div>
                    </div>
                )}
                {cChainWallet && (
                    <div className="mb-1 border border-1 border-gray-300 rounded-md p-2">
                        C-Chain ({cBalance} AVAX):<br></br>
                        <div className="text-blue-500 hover:underline cursor-pointer"
                            onClick={() => window.open("https://testnet.snowtrace.io/address/" + cChainWallet, "_blank")}>
                            {cChainWallet}
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-4">
                {!pChainWallet || !xChainWallet || !cChainWallet ? (
                    <button
                        onClick={handleAccessWallet}
                    >
                        Access Wallet
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleFundPChain}
                        >
                            Fund P-Chain Wallet
                        </button>
                        <button>
                            Export Private Keys
                        </button>
                    </>
                )}

            </div>
        </div>
    );
};

export default WalletCard;
