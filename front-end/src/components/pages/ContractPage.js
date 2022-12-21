import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from '@fortawesome/fontawesome-free-solid';
import { ethers } from "ethers";
import Collapsible from '../Collapsible';
import { useEthers } from '@usedapp/core';
import { useContractFunction } from '@usedapp/core';
import { Contract } from 'ethers';

import { abi } from '../../constants';

export default function ContractPageTransactions() {

  const [contractAddresses, setContractAddresses] = useState([]);
  const [demandVolume, setDemandVolume] = useState(0);
  const [epochNumber, setEpochNumber] = useState(0);
  const [blockchainExists, setBlockchainExists] = useState(true);
  const [contractInstance, setContractInstance] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
 
  const { state: demandState, send: demand } = useContractFunction(contractInstance, 'demand', { transactionName: 'Demand' });
  const { state: claimState, send: claim } = useContractFunction(contractInstance, 'claim', { transactionName: 'Claim' });
  const { id } = useParams();

  useEffect(() => {
    if (contractAddress) {
      const instance = generateContractInstance(contractAddress);
      setContractInstance(instance);
    }
  }, [contractAddress]);

  useEffect(() => {
    const subnets = JSON.parse(localStorage.getItem('subnets'));
    if (!subnets) {
      setBlockchainExists(false);
    }

    if (!subnets.find(subnet => subnet.blockchainId === id)) {
      setBlockchainExists(false);
    }
  }, [id]);

  useEffect(() => {
    const contractAddresses = JSON.parse(localStorage.getItem('contractAddresses')) || [];
    setContractAddresses(contractAddresses);
  }, []);

  const validateContractAddress = (contractAddress) => {
    if (!ethers.utils.isAddress(contractAddress)) {
      alert('Invalid contract address');
      return false;
    }

    for (let i = 0; i < contractAddresses.length; i++) {
      if (contractAddresses[i] === contractAddress) {
        alert('Contract with this address already exists');
        return false;
      }
    }

    return true;
  }
  const generateContractInstance = (address) => {
    const instance = new Contract(address, abi, ethers.getDefaultProvider());
    return instance;
  }

  const saveContractAddress = (contractAddress) => {
    if (!validateContractAddress(contractAddress)) {
      return;
    }
    const contractAddresses = JSON.parse(localStorage.getItem('contractAddresses')) || [];
    contractAddresses.push(contractAddress);
    localStorage.setItem('contractAddresses', JSON.stringify(contractAddresses));
    setContractAddresses(contractAddresses);
    setContractAddress(contractAddress);
  }

  const deleteContractAddress = (contractAddress) => {
    const contractAddresses = JSON.parse(localStorage.getItem('contractAddresses')) || [];
    const newContractAddresses = contractAddresses.filter(address => address !== contractAddress);
    localStorage.setItem('contractAddresses', JSON.stringify(newContractAddresses));
    setContractAddresses(newContractAddresses);
  }

  const handleDemandVolumeChange = (event) => {
    setDemandVolume(event.target.value);
  }

  const handleEpochNumberChange = (event) => {
    setEpochNumber(event.target.value);
  }

  const handleDemand = (event) => {
    event.preventDefault();
    console.log(contractAddress);
    demand(demandVolume);
  }

  const handleClaim = (event) => {
    event.preventDefault();
    claim(epochNumber);
  }


  if (!blockchainExists) {
    return (
      <div className='flex flex-col items-center'>
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold mb-2 mt-4">Contract Page</h1>
        </div>
        <div className='flex flex-col items-center'>
          <h2 className='text-xl font-bold mb-2'>No such blockchain exists</h2>
          <a href='/'>Go back to home page</a>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center'>
      <div className="flex justify-center">
        <h1 className="text-3xl font-bold mb-2 mt-4">Contract Page</h1>
      </div>
      <form onSubmit={(event) => {
        event.preventDefault();
        const contractAddress = event.target.elements.contractAddress.value;
        saveContractAddress(contractAddress);
      }}>
        <input type="text" name="contractAddress" placeholder='Contract Address' />
        <button className='mt-1 mb-4'>Add Contract</button>
      </form>
      <ul>
        {contractAddresses.map(contractAddress => (
          <div className='mb-6 border-2 border-gray-300 mb-2 rounded-xl'>
            <Collapsible
              close
              title=
              <div className='flex flex-row items-center justify-center'>
                <a href={`https://testnet.snowtrace.io/address/${contractAddress}`} target="_blank" rel="noopener noreferrer">
                  {<div className='text-l font-bold text-center hover:text-blue-600 focus:text-blue-600'>{contractAddress}</div>
                  }
                </a>
              </div>
              item=<div className="btn p-2 hover:bg-gray-200 rounded font-weight-bold text-center"
                onClick={() => {
                  if (window.confirm('Are you sure you wish to remove this contract?'))
                    deleteContractAddress(contractAddress)
                }
                }>
                <FontAwesomeIcon icon={faTrash} />
              </div>
            >
              <div className='flex flex-row items-center justify-center mb-1'>
                </div>
              <div className='flex flex-col items-end justify-end'>
                <div className='flex flex-row items-center justify-center mb-1'>
                  <input className='w-28' type="number" name="volume" placeholder='vol' value={demandVolume} onChange={handleDemandVolumeChange} />
                  <button className='w-24' onClick={(event) => handleDemand(event)} >
                    demand
                  </button>
                </div>
                <div className='flex flex-row items-center justify-center mb-1'>
                  <input className='w-28' type="number" name="epochNumber" placeholder='epoch' value={epochNumber} onChange={handleEpochNumberChange} />
                  <button className='w-24' onClick={(event) => handleClaim(event)} >
                    claim
                  </button>
                </div>
                <div className='flex flex-row items-center justify-center mb-1'>
                  <button className='w-24'>
                    claimAll
                  </button>
                </div>
              </div>
              
            </Collapsible>
          </div>
        ))}
      </ul>
    </div>
  );
}