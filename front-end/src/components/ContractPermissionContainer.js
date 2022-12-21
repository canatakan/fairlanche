import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/fontawesome-free-solid";
import { ethers } from "ethers";
import Collapsible from "./Collapsible";
import { useContractFunction } from "@usedapp/core";
import { Contract } from "ethers";

import { abi } from "../constants";

export default function ContractContainer({
  contractAddress,
  onDeleteRefresh,
}) {
  const [permissionedAddress, setPermissionedAddress] = useState("");
  const [unpermissionedAddress, setUnpermissionedAddress] = useState("");
  const [contractInstance, setContractInstance] = useState(null);

  const { state: givePermissionState, send: addPermissionedUser } = useContractFunction(
    contractInstance,
    "addPermissionedUser",
    { transactionName: "Add Permissioned User" }
  );
  const { state: removePermissionState, send: removePermissionedUser } = useContractFunction(
    contractInstance,
    "removePermissionedUser",
    { transactionName: "Remove Permissioned User" }
  );

  useEffect(() => {
    if (contractAddress) {
      const instance = generateContractInstance(contractAddress);
      setContractInstance(instance);
    }
  }, [contractAddress]);

  const generateContractInstance = (address) => {
    const instance = new Contract(address, abi, ethers.getDefaultProvider());
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

  const handlePermissionedAddressChange = (event) => {
    setPermissionedAddress(event.target.value);
  };

  const handleUnpermissionedAddressChange = (event) => {
    setUnpermissionedAddress(event.target.value);
  };

  const handleGivePermission = (event) => {
    event.preventDefault();
    addPermissionedUser(contractAddress);
  };

  const handleRemovePermission = (event) => {
    event.preventDefault();
    removePermissionedUser(contractAddress);
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
              className="w-80"
              type="string"
              name="permissionedAddress"
              placeholder="Address"
              value={permissionedAddress}
              onChange={handlePermissionedAddressChange}
            />
            <button className="w-48" onClick={(event) => handleGivePermission(event)}>
              Give Permission
            </button>
          </div>
          <div className="flex flex-row items-center justify-center mb-1">
            <input
              className="w-80"
              type="string"
              name="unpermissionedAddress"
              placeholder="Address"
              value={unpermissionedAddress}
              onChange={handleUnpermissionedAddressChange}
            />
            <button className="w-48" onClick={(event) => handleRemovePermission(event)}>
              Remove Permission
            </button>
          </div>
        </div>
      </Collapsible>
    </div>
  );
}
