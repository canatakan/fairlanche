import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/fontawesome-free-solid";
import { ethers } from "ethers";
import Collapsible from "./Collapsible";
import { useContractFunction } from "@usedapp/core";
import { Contract } from "ethers";

import PQMFERC20Distributor from "../constants/PQMFERC20Distributor";
// TODO : According the contract type ERC20/ERC1155/Native the abi that Instance Generator uses will change.

export default function ContractContainer({
  contractAddress,
  onDeleteRefresh,

}) {
  const [adminAddress, setAdminAddress] = useState("");
  const [enabledAddress, setEnabledAddress] = useState("");
  const [noneAddress, setNoneAddress] = useState("");
  const [addressStatus, readAddressStatus] = useState("");
  const [contractInstance, setContractInstance] = useState(null);


  const { state: a, send: setAdmin } = useContractFunction(
    contractInstance,
    "setAdmin",
    {
      transactionName: "Set Admin Address",
    }
  );

  const { state: b, send: setEnabled } = useContractFunction(
    contractInstance,
    "setEnabled",
    {
      transactionName: "Set Enabled Address",
    }
  );

  const { state: c, send: setNone } = useContractFunction(
    contractInstance,
    "setNone",
    {
      transactionName: "Set None Address",
    }
  );

  const { state: d, send: readAllowList } = useContractFunction(
    contractInstance,
    "readAllowList",
    {
      transactionName: "Read Allow List",
    }
  );




  useEffect(() => {
    if (contractAddress) {
      const instance = generateContractInstance(contractAddress);
      setContractInstance(instance);
    }
  }, [contractAddress]);

  const generateContractInstance = (address) => {
    // TODO : get the ABIs
    const instance = new Contract(address, PQMFERC20Distributor, ethers.getDefaultProvider());
    return instance;
  };

  const deleteContractAddress = (contractAddress) => {
    const contractAddresses =
      JSON.parse(localStorage.getItem("contractAddresses")) || [];
    const newContractAddresses = contractAddresses.filter(
      (address) => address !== contractAddress
    );
    localStorage.setItem(
      "contractAddresses",
      JSON.stringify(newContractAddresses)
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

  const handleReadAllowList = (e) => {
    e.preventDefault();
    readAllowList(readAddressStatus);
  };

  return (
    <div className="mb-6 border-2 border-gray-300 mb-2 rounded-xl">
      <Collapsible
        close
        title=<div className="flex flex-row items-center justify-center">
          <a
            href={`https://testnet.snowtrace.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {
              <div className="text-l font-bold text-center hover:text-blue-600 focus:text-blue-600">
                {contractAddress}
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
              deleteContractAddress(contractAddress);
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
              onClick={(event) => handleReadAllowList(event)}
            >
              Address Status
            </button>
          </div>
        </div>
      </Collapsible>
    </div>
  );
}