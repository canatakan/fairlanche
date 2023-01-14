import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/fontawesome-free-solid";
import { ethers } from "ethers";
import Collapsible from "./Collapsible";
import { useContractFunction } from "@usedapp/core";
import { Contract } from "ethers";
import { SELECTED_ABI } from '../constants/AppConstants';


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


  async function getContractEvents() {
    const accts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const walletAddress = accts[0];
    const selectedABI = SELECTED_ABI[selectedContractType][selectedAccessType];
    let contract = new Contract(
      contractAddress,
      selectedABI,
      ethers.getDefaultProvider()
    )
    const blockNumber = await window.ethereum.request({ method: 'eth_blockNumber' });
    
    const requestTopic = ethers.utils.id("Demand(address,uint256,uint16)")

    // send request to json rpc endpoint to get logs 
    const topics = await window.ethereum.request({
      method: 'eth_getLogs',
      params: [
        {
          fromBlock: "0x" + (blockNumber - 1900).toString(16),
          address: contractAddress,
          topics: [requestTopic]
        }
      ]
    });

    console.log(topics.length)
    let logs = topics.map((topic) => {
      const event = contract.interface.parseLog(topic);
      console.log(event.args[0])
      if (event.args[0].toLowerCase() != walletAddress.toLowerCase())
        return null;
      return {
        blockNumber: topic.blockNumber,
        returnValues : {
          epochNumber: parseInt(event.args[1]),
          _volume: event.args[2],
        }
      }
    });
    console.log(logs)
    logs = logs.filter((log) => log != null);

    console.log(logs)
    setContractEvents(logs);
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
            {
              <div className="text-l font-bold text-center">
                {contractAddress}
              </div>
            }
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
                    value={event?.returnValues?.epochNumber}
                    isSelected={selectedEventValues.includes(
                      Number(event?.returnValues?.epochNumber)
                    )}
                    onClick={() =>
                      handleCardClick(Number(event?.returnValues?.epochNumber))
                    }
                  />
                ))}
                <button
                  onClick={(event) => handleClaimBulk(event)}
                  className="w-32 h-12"
                >
                  claim bulk
                </button>
              </div>
            </div>
          </div>
        </div>
      </Collapsible>
    </div>
  );
}
