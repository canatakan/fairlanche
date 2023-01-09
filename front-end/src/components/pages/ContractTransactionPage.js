import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import ContractTransactionContainer from "../ContractTransactionContainer";

export default function ContractPageTransactions() {
  const [contractAddresses, setContractAddresses] = useState([]);
  const [blockchainExists, setBlockchainExists] = useState(true);
  const [onDeleteRefreshState, onDeleteRefresh] = useState(true);

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

    const all = JSON.parse(window.localStorage.getItem("CONTRACT_ADDRESSES"))??{};
    if (all[id]) {
      all[id] = [...all[id], contractAddress];

      window.localStorage.setItem("CONTRACT_ADDRESSES", JSON.stringify(all));
      setContractAddresses((prev) => [...prev, contractAddress]);
      return;
    }
    all[id] = [contractAddress];
    window.localStorage.setItem("CONTRACT_ADDRESSES", JSON.stringify(all));
    setContractAddresses((prev) => [...prev, contractAddress]);
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
          type="text"
          name="contractAddress"
          placeholder="Contract Address"
        />
        <button className="mt-1 mb-4">Add Contract</button>
      </form>
      <ul>
        {contractAddresses.map((contractAddress) => (
          <ContractTransactionContainer
            key={contractAddress}
            contractAddress={contractAddress}
            onDeleteRefresh={onDeleteRefresh}
          />
        ))}
      </ul>
    </div>
  );
}
