import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import ContractManagementContainer from "./ContractManagementContainer";
import { ACCESS_TYPES, CONTRACT_TYPES } from '../constants/AppConstants';
import Chip from './Chip';
const ExistingDistribution = () => {
  const [contractAddresses, setContractAddresses] = useState([]);
  const [onDeleteRefreshState, onDeleteRefresh] = useState(true);
  const [blockchainExists, setBlockchainExists] = useState(true);
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

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center">
        <div className="flex justify-center">
          <h1 className="text-xl font-bold mb-2 text-gray-700">
            Distribution Contract Address
          </h1>
        </div>
        <form
          className='flex flex-col items-center'
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
            className="border-2 px-2 py-1 rounded-md w-96"
          />
          <div className="mt-2 w-100 flex justify-center">
            {CONTRACT_TYPES.map((contractType) => (
              <Chip
                key={contractType}
                value={contractType}
                selectedValue={selectedContractType}
                handleSelectedValue={setSelectedContractType}
              />
            ))}
          </div>
          <div className="mt-2 w-100 flex justify-center">
            {ACCESS_TYPES.map((accessType) => (
              <Chip
                key={accessType}
                value={accessType}
                selectedValue={selectedAccessType}
                handleSelectedValue={setSelectedAccessType}
          />
            ))}
          </div>
          <button className="mt-2 mb-5">Add Distribution</button>
        </form>
        <ul>
          {contractAddresses.map((contract) => (
            <ContractManagementContainer
              selectedAccessType={contract?.selectedAccessType}
              selectedContractType={contract?.selectedContractType}
              contractAddress={contract?.contractAddress}
              id={id}
              onDeleteRefresh={onDeleteRefresh}
              key={contract?.contractAddress}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExistingDistribution;
