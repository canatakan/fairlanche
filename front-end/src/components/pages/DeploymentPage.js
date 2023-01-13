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
          <div className="border-2 border-gray-300 rounded-md p-4">
            <div className="flex flex-col items-center">
              <h2>Informative Text Field</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </div>
            <div className="flex flex-col items-center">
              <h2>Informative Text Field</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <ul>
                <li>Bullet point 1</li>
                <li>Bullet point 2</li>
                <li>Bullet point 3</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deployment;
