import React, { useEffect, useState } from "react";
import Radio from "../forms/Radio";
import SubnetContainer from "../SubnetContainer";

import { ethers } from "ethers";

import {
  userExists,
  listUserAddresses,
  createAndImport
} from "subnet/scripts/exports/create&ImportUser";

import { platform } from "subnet/scripts/exports/importAPI";
import { createSubnet } from "subnet/scripts/exports/createSubnetWithUsername";
import { sendCToP } from "subnet/scripts/exports/crossTransfer";


const Deployment = () => {
  const [subnets, setSubnets] = useState([]);

  const [subnetInput, setSubnetInput] = useState("");

  const handleCreateSubnet = async () => {
    const {
      pAddress,
      xAddress,
      cAddress,
      username,
      password,
    } = await accessPChainWallet();

    // check user balance:
    const balance = await platform.getBalance(pAddress);
    console.log(balance.unlocked, pAddress, xAddress, cAddress)

    console.log(pAddress, username, password)

    if (balance.unlocked < 1000000000) {
      alert("Insufficient balance. Please fund your P-Chain address.")
      return;
    }

    const subnetId = await createSubnet(
      username, password, [pAddress]
    )
    console.log(subnetId)

    const fake = Date.now().toString();
    setSubnets((prev) => [...prev, fake]);
    const subnets = JSON.parse(window.localStorage.getItem("subnetsXYZ")) ?? [];
    window.localStorage.setItem(
      "subnetsXYZ",
      JSON.stringify([...subnets, fake])
    );
    setRefreshState((prev) => !prev);
  };

  const accessPChainWallet = async () => {
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
      localStorage.setItem(currentAccount, cAddress);
      console.log(pAddress, xAddress, cAddress)
      return {
        pAddress,
        xAddress,
        cAddress,
        username: checksumAddr,
        password: signature
      };
    } else {
      const { pAddresses, xAddresses } = await listUserAddresses(checksumAddr, signature);
      console.log(pAddresses, xAddresses)
      return {
        pAddress: pAddresses[0],
        xAddress: xAddresses[0],
        cAddress: localStorage.getItem(currentAccount),
        username: checksumAddr,
        password: signature
      };
    }
  };

  const handleFundPChain = async () => {

    const {
      pAddress,
      xAddress,
      cAddress,
      username,
      password,
    } = await accessPChainWallet();

    const balance = await platform.getBalance(pAddress);
    console.log(balance.unlocked, pAddress, xAddress, cAddress)

    const val = ethers.utils.parseUnits("2", "ether").toHexString()
    const tx = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: window.ethereum.selectedAddress,
          to: cAddress,
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
      receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [tx],
      });
    }

    const amount = 2_000_000_000;
    const txId = await sendCToP(username, password, xAddress, pAddress, amount);
    console.log(txId)
  };

  const [refreshState, setRefreshState] = useState(false);

  const handleAddSubnet = () => {
    if (subnetInput.length < 4) {
      alert("Enter valid subnets");
      return;
    }
    setSubnets((prev) => [...prev, subnetInput]);
    const subnets = JSON.parse(window.localStorage.getItem("subnetsXYZ")) ?? [];
    window.localStorage.setItem(
      "subnetsXYZ",
      JSON.stringify([...subnets, subnetInput])
    );
    setRefreshState((prev) => !prev);
  };

  useEffect(() => {
    setSubnets(
      () => JSON.parse(window.localStorage.getItem("subnetsXYZ")) ?? []
    );
  }, [refreshState]);

  const setSubnetID = (e) => {
    setSubnetInput(e.target.value);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-2 mt-4">Subnet Deployment Page</h1>
        <div className="form-group">
          <form onSubmit={handleAddSubnet}>
            <input type="text" name="subnetID" onChange={setSubnetID} placeholder="Enter Subnet ID" />
            <button className="mb-1"
            >
              Add Subnet
            </button>
          </form>
        </div>
        <br />
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
        <br />
        <button className="mb-10" onClick={handleFundPChain}>
          Fund P-Chain Address
        </button>
        <button className="mb-10" onClick={handleCreateSubnet}>
          Create Subnet
        </button>
      </div>
      <div>
        <h1 className="text-xl font-medium text-center mb-2 mt-4">Imported & Created Subnets</h1>

        {subnets.map((subnet) => (
          <SubnetContainer
            key={subnet}
            refresher={() => setRefreshState((prev) => !prev)}
            tx={subnet}
            bootstrappedNodeId={223248238572389573}
          />
        ))}
      </div>
    </div>
  );
};

export default Deployment;
