import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/fontawesome-free-solid";
import { ethers } from "ethers";
import Collapsible from "./Collapsible";
import { useContractFunction } from "@usedapp/core";
import { Contract } from "ethers";
import { SELECTED_ABI } from '../constants/AppConstants';
import Web3 from 'web3';


export default function ContractTransactionContainer({
  contractAddress,
  onDeleteRefresh,
  id,
  selectedAccessType,
  selectedContractType
}) {
  const [demandVolume, setDemandVolume] = useState(0);
  const [epochNumber, setEpochNumber] = useState(0);
  const [contractInstance, setContractInstance] = useState(null);
  const [selectedEventValues, setSelectedEventsValues] = useState([]);
  const [contractEvents, setContractEvents] = useState([]);

  const { state: demandState, send: demand } = useContractFunction(
    contractInstance,
    "demand",
    { transactionName: "Demand" }
  );
  const { state: claimState, send: claim } = useContractFunction(
    contractInstance,
    "claim",
    { transactionName: "Claim" }
  );

  const { state: bulkClaimState, send: claimBulK } = useContractFunction(
    contractInstance,
    "claimBulk",
    { transactionName: "ClaimBulk" }
  );

  const getContractEvents = async () => {
    const web3 = new Web3(window.ethereum);
    const accts = await web3.eth.getAccounts();
    const wallet_address = accts[0];
    const selectedABI = SELECTED_ABI[selectedContractType][selectedAccessType];
    let contract = new web3.eth.Contract(
      selectedABI,
      contractAddress
    );
    const blockNumber = await web3.eth.getBlockNumber();
    contract
      .getPastEvents(
        "Demand",
        {
          filter: { _from: wallet_address }, 
          fromBlock: blockNumber - 2048,
          toBlock: blockNumber
        },
        function (error, events) {

          setContractEvents(events);
        }
      )
      .then(function (events) {

        setContractEvents(events);
      });
  };

  useEffect(() => {
    if (contractAddress && selectedContractType && selectedAccessType) {
      const instance = generateContractInstance(contractAddress);
      setContractInstance(instance);
      getContractEvents()
    }
  }, [contractAddress, selectedContractType, selectedAccessType]);

  const generateContractInstance = (address) => {
    const selectedABI = SELECTED_ABI[selectedContractType][selectedAccessType];

    const instance = new Contract(
      address,
      selectedABI,
      ethers.getDefaultProvider()
    );
    return instance;
  };

  const deleteContractAddress = (contractAddress) => {
    const all = JSON.parse(window.localStorage.getItem('CONTRACT_ADDRESSES'));
    console.log(all);
    console.log(id);
    all[id] = all[id].filter((el) => el.contractAddress != contractAddress);

    window.localStorage.setItem('CONTRACT_ADDRESSES', JSON.stringify(all));
    onDeleteRefresh((prev) => !prev);
  };

  const handleDemandVolumeChange = (event) => {
    setDemandVolume(event.target.value);
  };

  const handleEpochNumberChange = (event) => {
    setEpochNumber(event.target.value);
  };

  const handleDemand = (event) => {
    event.preventDefault();
    demand(demandVolume);
  };

  const handleClaim = (event) => {
    event.preventDefault();
    claim(epochNumber);
  };

  const handleClaimBulk = (event) => {
    event.preventDefault();
    claimBulK(selectedEventValues);
  };

  const Card = ({ value, isSelected, onClick }) => {
    //it should be similar size with the contract Transaction container
    const style = {
      width: '50px',
      height: '50px',
      backgroundColor: isSelected ? 'lightgreen' : 'lightgrey',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '2px',
      cursor: 'pointer'
    };

    return (
      <div style={style} onClick={onClick}>
        {value}
      </div>
    );
  };

  const handleCardClick = (value) => {
    if (selectedEventValues.includes(value)) {
      setSelectedEventsValues(selectedEventValues.filter((v) => v !== value));
    } else {
      setSelectedEventsValues([...selectedEventValues, value]);
    }
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
              className="w-28"
              type="number"
              name="volume"
              placeholder="vol"
              value={demandVolume}
              onChange={handleDemandVolumeChange}
            />
            <button className="w-24" onClick={(event) => handleDemand(event)}>
              demand
            </button>
          </div>
          <div className="flex flex-row items-center justify-center mb-1">
            <input
              className="w-28"
              type="number"
              name="epochNumber"
              placeholder="epoch"
              value={epochNumber}
              onChange={handleEpochNumberChange}
            />
            <button className="w-24" onClick={(event) => handleClaim(event)}>
              claim
            </button>
          </div>

          <div className="flex flex-row items-center justify-center mb-1">
            <div>
              <div
                style={
                  {
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                  }
                }
              >
                {contractEvents?.map((event) => (
                  <Card
                    key={event?.blockNumber}
                    value={event?.returnValues?._volume}
                    isSelected={selectedEventValues.includes(
                      Number(event?.returnValues?._volume)
                    )}
                    onClick={() =>
                      handleCardClick(Number(event?.returnValues?._volume))
                    }
                  />
                ))}
                <button
                  onClick={(event) => handleClaimBulk(event)}
                  className="w-24 h-16"
                >
                  Claim Bulk
                </button>
              </div>
            </div>
          </div>
        </div>
      </Collapsible>
    </div>
  );
}
