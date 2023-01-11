import React, { useState } from 'react';

const WalletCard = () => {
    const [pChainWallet, setPChainWallet] = useState(null);
    const [xChainWallet, setXChainWallet] = useState(null);
    const [cChainWallet, setCChainWallet] = useState(null);

    const handleAccessWallet = () => {
        // code to access the wallets goes here
        setPChainWallet({ address: 'P-fuji1uvgw976f9h4tyfttjgr8scsljnve8x4z66mtvn', balance: "100" });
        setXChainWallet({ address: '<X-CHAIN-ADDRESS>', balance: '<X-CHAIN-BALANCE>' });
        setCChainWallet({ address: '<C-CHAIN-ADDRESS>', balance: '<C-CHAIN-BALANCE>' });
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
