import React, { useEffect, useState } from "react";
import Radio from "../forms/Radio";
import SubnetContainer from "../SubnetContainer";

import { ethers } from "ethers";


import { platform } from "subnet/scripts/importAPI";
import { createSubnet } from "subnet/scripts/createSubnet";
import WalletCard from "../WalletCard";
import { WalletUtils } from "../WalletUtils";

const Deployment = () => {
  const [subnets, setSubnets] = useState([]);

  const [subnetInput, setSubnetInput] = useState("");

  const [pChainWallet, setPChainWallet] = useState(null);
  const [xChainWallet, setXChainWallet] = useState(null);
  const [cChainWallet, setCChainWallet] = useState(null);

  const handleCreateSubnet = async () => {
    const {
      pAddress,
      username,
      password,
    } = await accessWallets();

    // check user balance:
    const balance = await platform.getBalance(pAddress);
    if (balance.unlocked < 1_500_000_000) {
      alert("Insufficient balance. Please fund your P-Chain address.")
      return;
    }

    const subnetId = await createSubnet(
      username, password, [pAddress]
    )
    setSubnets((prev) => [...prev, subnetId]);
    const managedSubnets = JSON.parse(window.localStorage.getItem("managedSubnets")) ?? [];
    window.localStorage.setItem(
      "managedSubnets",
      JSON.stringify([...managedSubnets, subnetId])
    );
    setRefreshState((prev) => !prev);
  };

  const { accessWallets } = WalletUtils();

  const [refreshState, setRefreshState] = useState(false);

  const handleAddSubnet = () => {
    if (subnetInput.length < 4) {
      alert("Enter valid subnets");
      return;
    }
    setSubnets((prev) => [...prev, subnetInput]);
    const subnets = JSON.parse(window.localStorage.getItem("managedSubnets")) ?? [];
    window.localStorage.setItem(
      "managedSubnets",
      JSON.stringify([...subnets, subnetInput])
    );
    setRefreshState((prev) => !prev);
  };

  useEffect(() => {
    setSubnets(
      () => JSON.parse(window.localStorage.getItem("managedSubnets")) ?? []
    );
  }, [refreshState]);

  const setSubnetID = (e) => {
    setSubnetInput(e.target.value);
  };

  return (
    <div className="flex flex-col items-center">
      <div>
        <h1 className="text-3xl font-bold text-center mb-2 mt-4">Subnet Deployment Page</h1>
      </div>
      <div className="flex flex-row justify-center mt-2">
        <div className="flex flex-col w-1/2 ml-auto">
          <div className="flex flex-col items-end">
            <div className="form-group w-full ">
              <form onSubmit={handleAddSubnet}>
                <div className="flex flex-row items-center">
                  <input type="text" name="subnetID" onChange={setSubnetID} placeholder="Enter Subnet ID" />
                  <button className="mb-1 w-1/4"
                  >
                    Import
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-center mt-8 border-2 border-gray-300 rounded-md p-4">
              <div className="flex justify-between w-full">
                <h1 className="text-xl font-medium text-center mb-2 mt-2">Imported & Created Subnets</h1>
                <button className="mb-1 ml-5" onClick={handleCreateSubnet}>
                  +
                </button>
              </div>
              {subnets.map((subnet) => (
                <SubnetContainer
                  key={subnet}
                  refresher={() => setRefreshState((prev) => !prev)}
                  tx={subnet} />
              ))}
            </div>
          </div>
        </div>
        <div className="mr-10 flex flex-col w-2/5 ml-auto">
          <WalletCard
            pChainWallet={pChainWallet}
            xChainWallet={xChainWallet}
            cChainWallet={cChainWallet}
            setPChainWallet={setPChainWallet}
            setXChainWallet={setXChainWallet}
            setCChainWallet={setCChainWallet}
          />
          <br></br>
          <div className="border-2 border-gray-300 rounded-md p-4 bg-gray-100 mb-10">
            <div className="flex flex-col items-center">
              <h2 className="font-bold">How to Deploy a Subnet?</h2>
              <p className="text-left">Avalanche has a structure based on three chains, namely X, P and C. In order to
              deploy a subnet, you need to use the P-Chain. Our tool allows you to handle the X and P chain transactions
              without leaving Metamask.
              </p>
            </div>
            <div className="flex flex-col items-center mt-2">
              <h2 className="font-bold mr-auto">🔑 Step 1: Prepare Your Wallets in Node</h2>
              <p className="text-left"> In order to deploy a subnet, you need to access your P-Chain wallet in the Node.
              You can do this by clicking on the "Access Wallets" button. Then, fund your P-Chain address by clicking 
              on the "Fund P-Chain" button.
              </p>
              <h2 className="font-bold mr-auto mt-2">🔗 Step 2: Deploy Your Subnet</h2>
              <p className="text-left"> Click on the "+" button to deploy a subnet. You will be prompted to sign a transaction
              in Metamask. Once the transaction is confirmed, you will be able to see your subnet in the "Imported & Created Subnets" section.
              </p>
              <h2 className="font-bold mr-auto mt-2">✅ Step 3: Add a Validator</h2>
              <p className="text-left"> Click on the "Add Validator" button to add a validator to your subnet. You can use our default node.
              If you use your own node, follow the Avalanche's documents and restart your node accordingly.
              </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deployment;
