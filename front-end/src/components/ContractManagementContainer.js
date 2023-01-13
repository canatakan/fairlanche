import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/fontawesome-free-solid";
import { ethers } from "ethers";
import Collapsible from "./Collapsible";
import { useContractFunction } from "@usedapp/core";
import { Contract } from "ethers";

import PQMFERC20Distributor from "../constants/PQMFERC20Distributor";
import { SELECTED_ABI } from "../constants/AppConstants";

export default function ContractContainer({
  contractAddress,
  onDeleteRefresh,
  id,
  selectedContractType,
  selectedAccessType
}) {
  const [permissionedAddress, setPermissionedAddress] = useState("");
  const [unpermissionedAddress, setUnpermissionedAddress] = useState("");
  const [depositAmount, setDepositAmount] = useState(0);
  const [contractInstance, setContractInstance] = useState(null);

  const { state: givePermissionState, send: addPermissionedUser } =
    useContractFunction(contractInstance, "addPermissionedUser", {
      transactionName: "Add Permissioned User",
    });

  const { state: removePermissionState, send: removePermissionedUser } =
    useContractFunction(contractInstance, "removePermissionedUser", {
      transactionName: "Remove Permissioned User",
    });

  const { state: burnState, send: burnExpired } = useContractFunction(
    contractInstance,
    "burnExpired",
    {
      transactionName: "Burn Expired",
    }
  );

  const { state: depositState, send: deposit } = useContractFunction(
    contractInstance,
    "deposit",
    {
      transactionName: "Deposit",
    }
  );

  const { state: withdrawState, send: withdrawExpired } = useContractFunction(
    contractInstance,
    "withdrawExpired",
    {
      transactionName: "Withdraw Expired",
    }
  );

  useEffect(() => {
    if (contractAddress && selectedContractType && selectedAccessType) {
      const instance = generateContractInstance(contractAddress);
      setContractInstance(instance);
    }
  }, [contractAddress, selectedAccessType, selectedContractType]);

  const generateContractInstance = (address) => {
    const selectedABI = SELECTED_ABI[selectedContractType][selectedAccessType];

    const instance = new Contract(
      address,
      // PQMFERC20Distributor,
      selectedABI,
      ethers.getDefaultProvider()
    );
    return instance;
  };

  const deleteContractAddress = (contractAddress) => {
    const all = JSON.parse(window.localStorage.getItem("CONTRACT_ADDRESSES"));
    all[id] = all[id].filter((el) => el != contractAddress);
    window.localStorage.setItem("CONTRACT_ADDRESSES", JSON.stringify(all));
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
    addPermissionedUser(permissionedAddress);
  };

  const handleRemovePermission = (event) => {
    event.preventDefault();
    removePermissionedUser(unpermissionedAddress);
  };

  const handleBurn = (event) => {
    event.preventDefault();
    burnExpired();
  };

  const handleDepositAmountChange = (event) => {
    setDepositAmount(event.target.value);
  };

  const handleDeposit = (event) => {
    event.preventDefault();
    deposit(depositAmount);
  };

  const handleWithdrawAll = (event) => {
    event.preventDefault();
    withdrawExpired();
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
              name="permissionedAddress"
              value={permissionedAddress}
              onChange={handlePermissionedAddressChange}
              placeholder="Address"
            />
            <button
              className="w-48"
              onClick={(event) => handleGivePermission(event)}
            >
              Give Permission
            </button>
          </div>
          <div className="flex flex-row items-center justify-center mb-1">
            <input
              className="border-2 px-2 py-1 rounded-md w-56"
              type="string"
              name="unpermissionedAddress"
              placeholder="Address"
              value={unpermissionedAddress}
              onChange={handleUnpermissionedAddressChange}
            />
            <button
              className="w-48"
              onClick={(event) => handleRemovePermission(event)}
            >
              Remove Permission
            </button>
          </div>
          <div className="flex flex-row items-center justify-center mb-1">
            <input
              className="border-2 px-2 py-1 rounded-md w-56"
              type="number"
              name="depositAmount"
              placeholder="Amount"
              value={depositAmount}
              onChange={handleDepositAmountChange}
            />
            <button className="w-48" onClick={(event) => handleDeposit(event)}>
              Deposit
            </button>
          </div>
          <div className="flex flex-row items-center justify-center mb-1">
            <button
              className="w-48"
              onClick={(event) => handleWithdrawAll(event)}
            >
              Withdraw All
            </button>
          </div>
          <div className="flex flex-row items-center justify-center mb-1">
            <button className="w-48" onClick={(event) => handleBurn(event)}>
              Burn
            </button>
          </div>
        </div>
      </Collapsible>
    </div>
  );
}
