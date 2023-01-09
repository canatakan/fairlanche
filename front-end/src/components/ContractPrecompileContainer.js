import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/fontawesome-free-solid";
import { ethers } from "ethers";
import Collapsible from "./Collapsible";
import { useCall, useContractFunction } from "@usedapp/core";
import { Contract } from "ethers";

import IAllowList from "../constants/IAllowList";

export default function ContractContainer({
  blockchainId,
  onDeleteRefresh,

}) {
  const [adminAddress, setAdminAddress] = useState("");
  const [enabledAddress, setEnabledAddress] = useState("");
  const [noneAddress, setNoneAddress] = useState("");
  const [addressStatus, readAddressStatus] = useState("");
  const [contractInstanceDeployer, setContractInstanceDeployer] = useState(null);
  const [contractInstanceTransactor, setContractInstanceTransactor] = useState(null);


  const { state: a, send: setAdmin } = useContractFunction(
    contractInstanceTransactor,
    "setAdmin",
    {
      transactionName: "Set Admin Address",
    }
  );

  const { state: b, send: setEnabled } = useContractFunction(
    contractInstanceTransactor,
    "setEnabled",
    {
      transactionName: "Set Enabled Address",
    }
  );

  const { state: c, send: setNone } = useContractFunction(
    contractInstanceTransactor,
    "setNone",
    {
      transactionName: "Set None Address",
    }
  );
  
  // const { state: d, send: readAllowList } = useCall(
  //   contractInstanceDeployer,
  //   "readAllowList",
  //   {
  //     transactionName: "Read Allow List",
  //   }
  // );


  const giveAddressStatus = async (address) => {
    const status = await contractInstanceDeployer.readAllowList(address);
    readAddressStatus(status);
    console.log(status);
  };

  useEffect(() => {
    if (blockchainId) {
      const instanceDeployer = generateContractInstance("0x0200000000000000000000000000000000000000");
      const instanceTransactor = generateContractInstance("0x0200000000000000000000000000000000000002");
      setContractInstanceDeployer(instanceDeployer);
      setContractInstanceTransactor(instanceTransactor);
    }
  }, [blockchainId]);

  const generateContractInstance = (address) => {
    //const provider = new ethers.providers.JsonRpcProvider("http://18.188.152.131:9650/ext/bc/2ACndrNifpdJzvBJz1jtkfWxQ759ZQ3hLCT5n72mpPybZmAsVy/rpc")
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const instance = new Contract(address, IAllowList, provider);
    return instance;
  };

  const deleteblockchainId = (blockchainId) => {
    const blockchainIds =
      JSON.parse(localStorage.getItem("blockchainIds")) || [];
    const newblockchainIds = blockchainIds.filter(
      (address) => address !== blockchainId
    );
    localStorage.setItem(
      "blockchainIds",
      JSON.stringify(newblockchainIds)
    );
    onDeleteRefresh((prev) => !prev);
  };

  const handleAdminAddressChange = (e) => {
    setAdminAddress(e.target.value);
  };

  const handleEnabledAddressChange = (e) => {
    setEnabledAddress(e.target.value);
  };

  const handleNoneAddressChange = (e) => {
    setNoneAddress(e.target.value);
  };

  const handleReadAddressChange = (e) => {
    readAddressStatus(e.target.value);
  };

  const handleSetAdmin = (e) => {
    e.preventDefault();
    setAdmin(adminAddress);
  };

  const handleSetEnabled = (e) => {
    e.preventDefault();
    setEnabled(enabledAddress);
  };

  const handleSetNone = (e) => {
    e.preventDefault();
    setNone(noneAddress);
  };

  const handleReadAddressStatus = (e) => {
    e.preventDefault();
    giveAddressStatus(addressStatus);
  };


  return (
    <div className="mb-6 border-2 border-gray-300 mb-2 rounded-xl">
      <Collapsible
        close
        title=<div className="flex flex-row items-center justify-center">
          <a
            href={`https://testnet.snowtrace.io/address/${blockchainId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {
              <div className="text-l font-bold text-center hover:text-blue-600 focus:text-blue-600">
                {blockchainId}
              </div>
            }
          </a>
        </div>
        item=<div
          className="btn p-2 hover:bg-gray-200 rounded font-weight-bold text-center"
          onClick={() => {
            if (
              window.confirm("Are you sure you wish to remove this contract?")
            )
              deleteblockchainId(blockchainId);
          }}
        >
          <FontAwesomeIcon icon={faTrash} />
        </div>
      >
        <div className="flex flex-row items-center justify-center mb-1"></div>
        <div className="flex flex-col items-end justify-end">

          <div className="flex flex-row items-center justify-center mb-1">
            <input
              className="border-2 px-2 py-1 rounded-md w-56"
              type="string"
              name="adminAddress"
              value={adminAddress}
              onChange={handleAdminAddressChange}
              placeholder="Address"

            />
            <button
              className="w-48"
              onClick={(event) => handleSetAdmin(event)}
            >
              Set Admin
            </button>
          </div>
          <div className="flex flex-row items-center justify-center mb-1">
            <input
              className="border-2 px-2 py-1 rounded-md w-56"
              type="string"
              name="setEnableAddress"
              placeholder="Address"
              value={enabledAddress}
              onChange={handleEnabledAddressChange}
            />
            <button
              className="w-48"
              onClick={(event) => handleSetEnabled(event)}
            >
              Set Enabled
            </button>
          </div>
          <div className="flex flex-row items-center justify-center mb-1">
            <input
              className="border-2 px-2 py-1 rounded-md w-56"
              type="string"
              name="setNoneAddress"
              placeholder="Address"
              value={noneAddress}
              onChange={handleNoneAddressChange}
            />
            <button
              className="w-48"
              onClick={(event) => handleSetNone(event)}
            >
              Set None
            </button>
          </div>
          <div className="flex flex-row items-center justify-center mb-1">
            <input
              className="border-2 px-2 py-1 rounded-md w-56"
              type="string"
              name="addressStatus"
              placeholder="Address"
              value={addressStatus}
              onChange={handleReadAddressChange}
            />
            <button
              className="w-48"
              onClick={(event) => handleReadAddressStatus(event)}
            >
              Address Status
            </button>
          </div>
        </div>
      </Collapsible>
    </div>
  );
}