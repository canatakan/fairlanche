import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import ContractPrecompilerContainer from "./ContractPrecompileContainer";

const BlockchainPermission = () => {
  const [contractAddresses, setContractAddresses] = useState([]);
  const [onDeleteRefreshState, onDeleteRefresh] = useState(true);
  const [blockchainExists, setBlockchainExists] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const subnets = JSON.parse(localStorage.getItem("subnets"));
    if (!subnets) {
      setBlockchainExists(false);
    }
  }, [id]);

  useEffect(() => {
    const contractAddresses =
      JSON.parse(localStorage.getItem("contractAddresses")) || [];
    setContractAddresses(contractAddresses);
  }, [onDeleteRefreshState]);

  const validateContractAddress = (contractAddress) => {
    if (!ethers.utils.isAddress(contractAddress)) {
      alert("Invalid contract address");
      return false;
    }

    for (let i = 0; i < contractAddresses.length; i++) {
      if (contractAddresses[i] === contractAddress) {
        alert("Contract with this address already exists");
        return false;
      }
    }

    return true;
  };

  const saveContractAddress = (contractAddress) => {
    if (!validateContractAddress(contractAddress)) {
      return;
    }
    const contractAddresses =
      JSON.parse(localStorage.getItem("contractAddresses")) || [];
    contractAddresses.push(contractAddress);
    localStorage.setItem(
      "contractAddresses",
      JSON.stringify(contractAddresses)
    );
    setContractAddresses(contractAddresses);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center">
        <div className="flex justify-center">
          <h1 className="text-xl font-bold mb-2 text-gray-700">
            Set Blockchain Permissions
          </h1>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const contractAddress = event.target.elements.contractAddress.value;
            saveContractAddress(contractAddress);
          }}
        >

          <input
            type="string"
            name="contractAddress"
            placeholder="Contract Address"
            className="border-2 px-2 py-1 rounded-md w-80"
          />
          <button className="mt-2 mb-5">Add Distribution</button>
        </form>

        <ul>
          {contractAddresses.map((contractAddress) => (
            <ContractPrecompilerContainer
              key={contractAddress}
              contractAddress={contractAddress}
              onDeleteRefresh={onDeleteRefresh}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BlockchainPermission;
