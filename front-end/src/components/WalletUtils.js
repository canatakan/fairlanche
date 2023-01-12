import { ethers } from "ethers";
import {
    userExists,
    listUserAddresses,
    createAndImport
} from "subnet/scripts/create&ImportUser";

export function WalletUtils() {
    const getSignature = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const currentAccount = accounts[0];
        const checksumAddr = ethers.utils.getAddress(currentAccount);
        const message = "Sign this message to access your P-Chain account in the node.";
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
            console.log(localStorage);
            const {
                pAddresses, xAddresses, cAddresses
            } = await listUserAddresses(checksumAddr, signature);
            return {
                pAddress: pAddresses[0],
                xAddress: xAddresses[0],
                cAddress: cAddresses[0],
                username: checksumAddr,
                password: signature
            };
        }
    };
    return { getSignature, accessWallets };
}
