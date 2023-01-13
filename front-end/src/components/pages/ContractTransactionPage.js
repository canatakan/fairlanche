import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import ContractTransactionContainer from "../ContractTransactionContainer";
import Chip from '../Chip';
import { ACCESS_TYPES, CONTRACT_TYPES } from '../../constants/AppConstants';

export default function ContractPageTransactions() {
  const [contractAddresses, setContractAddresses] = useState([]);
  const [blockchainExists, setBlockchainExists] = useState(true);
  const [onDeleteRefreshState, onDeleteRefresh] = useState(true);
  const [selectedContractType, setSelectedContractType] = useState();
  const [selectedAccessType, setSelectedAccessType] = useState();

  const { id } = useParams();

  useEffect(() => {
    const subnets = JSON.parse(localStorage.getItem("subnets"));
    if (!subnets) {
      setBlockchainExists(false);
    }

  }, [id]);

  useEffect(() => {
    const all = JSON.parse(window.localStorage.getItem("CONTRACT_ADDRESSES"));
    if (all) {
      setContractAddresses(all[id] ?? []);
      return;
    }
    setContractAddresses([]);
  }, [onDeleteRefreshState]);

  const validateContractAddress = (contractAddress) => {
    if (!ethers.utils.isAddress(contractAddress)) {
      alert("Invalid contract address");
      return false;
    }

    for (let i = 0; i < contractAddresses.length; i++) {
      if (contractAddresses[i]?.contractAddress === contractAddress) {
        alert('Contract with this address already exists');
        return false;
      }
    }

    return true;
  };

  const saveContractAddress = (contractAddress) => {
    if (!validateContractAddress(contractAddress)) {
      return;
    }

    const all =
      JSON.parse(window.localStorage.getItem("CONTRACT_ADDRESSES")) ?? {};
    if (all[id]) {
      all[id] = [
        ...all[id],
        {
          contractAddress: contractAddress,
          selectedAccessType: selectedAccessType,
          selectedContractType: selectedContractType
        }
      ];

      window.localStorage.setItem("CONTRACT_ADDRESSES", JSON.stringify(all));
      setContractAddresses((prev) => [
        ...prev,
        {
          contractAddress: contractAddress,
          selectedAccessType: selectedAccessType,
          selectedContractType: selectedContractType
        }
      ]);
      return;
    }
    all[id] = [
      {
        contractAddress: contractAddress,
        selectedAccessType: selectedAccessType,
        selectedContractType: selectedContractType
      }
    ];
    window.localStorage.setItem("CONTRACT_ADDRESSES", JSON.stringify(all));
    setContractAddresses((prev) => [
      ...prev,
      {
        contractAddress: contractAddress,
        selectedAccessType: selectedAccessType,
        selectedContractType: selectedContractType
      }
    ]);
  };

  if (!blockchainExists) {
    return (
      <div className="flex flex-col items-center">
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold mb-2 mt-4">Contract Page</h1>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">No such blockchain exists</h2>
          <a href="/">Go back to home page</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center">
        <h1 className="text-3xl font-bold mb-2 mt-4">Contract Page</h1>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const contractAddress = event.target.elements.contractAddress.value;
          saveContractAddress(contractAddress);
        }}
      >
        <input
          className="w-96"
          type="text"
          name="contractAddress"
          placeholder="Contract Address"
        />
        <div className="mt-2 w-100 flex justify-center">
          {CONTRACT_TYPES.map((contractType) => (
            <Chip
              value={contractType}
              selectedValue={selectedContractType}
              handleSelectedValue={setSelectedContractType}
            />
          ))}
        </div>
        <div className="mt-2 w-100 flex justify-center">
          {ACCESS_TYPES.map((accessType) => (
            <Chip
              value={accessType}
              selectedValue={selectedAccessType}
              handleSelectedValue={setSelectedAccessType}
        />
          ))}
        </div>
        <button className="mt-3 mb-4">Add Contract</button>
      </form>
      <ul>
        {contractAddresses.map((contract) => (
          <ContractTransactionContainer
          //added null checks here, will be tested later again
            selectedAccessType={contract?.selectedAccessType}
            selectedContractType={contract?.selectedContractType}
            key={contract?.contractAddress}
            contractAddress={contract?.contractAddress}
            onDeleteRefresh={onDeleteRefresh}
          />
        ))}
      </ul>
    </div>
  );
}
