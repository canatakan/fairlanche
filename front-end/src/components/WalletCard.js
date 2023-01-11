import React, { useState } from 'react';

import { ethers } from "ethers";

import {
    userExists,
    listUserAddresses,
    createAndImport
} from "subnet/scripts/exports/create&ImportUser";
import { getBalances } from 'subnet/scripts/exports/getBalances';

const WalletCard = () => {
    const [pChainWallet, setPChainWallet] = useState(null);
    const [xChainWallet, setXChainWallet] = useState(null);
    const [cChainWallet, setCChainWallet] = useState(null);

    const handleAccessWallet = async () => {

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const currentAccount = accounts[0];
        let nodeAddresses = localStorage.getItem(currentAccount);

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

        setPChainWallet({ address: nodeAddresses.pAddress, balance: balances.pchainBalance });
        setXChainWallet({ address: nodeAddresses.xAddress, balance: balances.xchainBalance });
        setCChainWallet({ address: nodeAddresses.cAddress, balance: balances.cchainBalance });
    };

    const accessWallets = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const currentAccount = accounts[0];
        const checksumAddr = ethers.utils.getAddress(currentAccount);

        const message = "Sign this message to access your P-Chain account in the node."
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, currentAccount],
        });
        if (!await userExists(checksumAddr)) {
            const {
                pAddress, xAddress, cAddress
            } = await createAndImport(checksumAddr, signature);
            localStorage.setItem(
                currentAccount, {
                pAddress,
                xAddress,
                cAddress,
            });
            return {
                pAddress,
                xAddress,
                cAddress,
                username: checksumAddr,
                password: signature
            };
        } else {
            const { pAddresses, xAddresses } = await listUserAddresses(checksumAddr, signature);
            return {
                pAddress: pAddresses[0],
                xAddress: xAddresses[0],
                cAddress: localStorage.getItem(currentAccount),
                username: checksumAddr,
                password: signature
            };
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-2 border-gray-300 rounded-md">
            <h2 className="text-lg font-medium mb-2">Wallet Balances</h2>
            <div className="text-left color-gray-500">
                {pChainWallet && (
                    <p>
                        P-Chain ({pChainWallet.balance} AVAX):<br></br>
                        {pChainWallet.address}
                    </p>
                )}
                {xChainWallet && (
                    <p>
                        X-Chain ({xChainWallet.balance} AVAX):<br></br>
                        {xChainWallet.address}
                    </p>
                )}
                {cChainWallet && (
                    <p>
                        C-Chain ({cChainWallet.balance} AVAX):<br></br>
                        {cChainWallet.address}
                    </p>
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
                        <button>
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
