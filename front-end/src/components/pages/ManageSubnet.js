import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrash } from '@fortawesome/fontawesome-free-solid';
import { ethers } from "ethers";
import Collapsible from '../Collapsible';
import { useEthers } from '@usedapp/core';
import { useContractFunction } from '@usedapp/core';
import { Contract } from 'ethers';

import { abi } from '../../hooks';


export default function ContractPageTransactions() {


    const [tokenStandard, setTokenStandard] = useState(0);
    const [distributionAlgorithm, setDistributionAlgorithm] = useState(0);
    const [allowAddress, setAllowAddress] = useState('');
    const [disallowAddress, setDisallowAddress] = useState('');
    const [isValidContract, setIsValidContract] = useState(false);
    const [contractInstance, setContractInstance] = useState(null);
    const [contractAddress, setContractAddress] = useState('');

    const { state: givePermissionState, send: addPermissionedUser } = useContractFunction(contractInstance, 'addPermissionedUser', { transactionName: 'Add Permissioned User' });
    const { state: removePermissionState, send: removePermissionedUser } = useContractFunction(contractInstance, 'removePermissionedUser', { transactionName: 'Remove Permissioned User' });

    useEffect(() => {
        if (contractAddress) {
            const instance = generateContractInstance(contractAddress);
            setContractInstance(instance);
        }
    }, [contractAddress]);

    const validateContractAddress = (contractAddress) => {
        if (!ethers.utils.isAddress(contractAddress)) {
            alert('Invalid contract address');
            return false;
        }
        return true;
    }

    const generateContractInstance = (address) => {
        const instance = new Contract(address, abi, ethers.getDefaultProvider());
        return instance;
      }

    const givePermission = (allowAddress) => {
        if (!validateContractAddress(allowAddress)) {
            return;
        }
        addPermissionedUser(allowAddress);
    }

    const removePermission = (disallowAddress) => {
        if (!validateContractAddress(disallowAddress)) {
            return;
        }
        removePermissionedUser(disallowAddress);
    }

    const connectContract = (contractAddress) => {
        setContractAddress(contractAddress);
        if (!ethers.utils.isAddress(contractAddress)) {
            alert('Invalid contract address');
            setIsValidContract(false);
        }
        else
            setIsValidContract(true);
    }


    const handleAllowAddressChange = (event) => {
        setAllowAddress(event.target.value);
    }

    const handleTokenStandardChange = (event) => {
        setTokenStandard(event.target.value);
    }

    const handleDistributionAlgorithmChange = (event) => {
        setDistributionAlgorithm(event.target.value);
    }

    const handleDisallowAddressChange = (event) => {
        setDisallowAddress(event.target.value);
    }

    const handleConnectContract = (event) => {
        setContractAddress(event.target.value);
    }

    return (
        <div className='flex flex-col items-center'>
            <div className="flex justify-center">
                <h1 className="text-3xl font-bold mb-2 mt-4">Subnet Management Portal</h1>
            </div>
            <div className='mb-6 border-2 border-gray-300 mb-2 rounded-xl'>
                <div className="flex justify-center">
                    <h1 className="text-md font-bold text-green-700 mt-2 mb-2 ml-20 mr-20">Set Permissioned Addresses</h1>
                </div>
                <div className='flex flex-row items-center justify-center mb-1'>
                    <form onSubmit={(event) => {
                        event.preventDefault();
                        connectContract(contractAddress);
                    }}>
                        <input className='w-56  mr-1 ml-2 mt-1' type="text" name="allowAddress" placeholder='Enter contract address.' value={contractAddress} onChange={handleConnectContract} />
                        <button className='w-48  mt-1 mr-2 ml-1 mb-2'> Connect Contract </button>
                    </form>
                </div>
                {isValidContract && <span className='text-green-700'>Connected to Contract</span>}
                {isValidContract && (
                    <div>
                        <div className='flex flex-row items-center justify-center mb-1'>
                            <form onSubmit={(event) => {
                                event.preventDefault();
                                givePermission(allowAddress);
                            }}>
                                <input className='w-56 mb-1 mr-1 ml-2 mt-2' type="text" name="allowAddress" placeholder='Wallet Address' value={allowAddress} onChange={handleAllowAddressChange} />
                                <button className='w-48 mb-1 mr-2 ml-1 mt-2'> Give Permission </button>
                            </form>
                        </div>
                        <form onSubmit={(event) => {
                            event.preventDefault();
                            removePermission(disallowAddress);
                        }}>
                            <input className='w-56 mb-3 mr-1 ml-2' type="text" name="disallowAddress" placeholder='Wallet Address' value={disallowAddress} onChange={handleDisallowAddressChange
                            } />
                            <button className='w-48 mb-3 mr-2 ml-1'> Remove Permission</button>
                        </form>
                    </div>)}
            </div>
            <ul>
                <div className='mb-6 border-2 border-gray-300 mb-2 rounded-xl'>

                    <div className='flex flex-row items-center justify-center'>
                        <div className="flex justify-center">
                            <h1 className="text-md font-bold text-green-700 mt-2 mb-2 ml-20 mr-20">Generate New Resource Distribution</h1>
                        </div>
                    </div>
                    <div className='flex flex-col items-center'>
                        <div className="mb-4 ml-2 mr-2">
                            <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="subnetId">
                                Token Symbol
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="subnetId"
                                type="string"
                                placeholder="Enter your subnet's ChainId. It can be any positive integer." />
                        </div>
                        <div className="mb-4 ml-2 mr-2">
                            <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="epochCapacity">
                                Epoch Capacity
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="epochCapacity"
                                type="number"
                                placeholder="Enter epoch capacity. (ie. 1000)" />
                        </div>
                        <div className="mb-4 ml-2 mr-2">
                            <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="epochDuration">
                                Epoch Duration
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="epochDuration"
                                type="number"
                                placeholder="Enter epoch duration. (ie. 1000)" />
                        </div>

                        <div className="mb-4 ml-2 mr-2">
                            <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="DistributionAlgorithm">
                                Distribution Algorithm
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <select
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline align-middle"
                                    id="DistributionAlgorithm"
                                    value={distributionAlgorithm}
                                    onChange={handleDistributionAlgorithmChange}
                                >
                                    <option>
                                        Quantized Max-Min Fairness
                                    </option>
                                    <option>
                                        Dominant Resource Fairness
                                    </option>
                                </select>
                            </div>

                        </div>

                        <div className="mb-4 ml-2 mr-2">
                            <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="feeRate">
                                Token Standard
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <select
                                    // fix: Design change
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="tokenStandard"
                                    value={tokenStandard}
                                    onChange={handleTokenStandardChange}
                                >
                                    <option>ERC-20 Token Standard</option>
                                    <option>ERC-721 Token Standard</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-row items-center justify-center'>
                        <div className="flex justify-center mb-2">
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                                Generate Distribution
                            </button>
                        </div>
                    </div>
                </div>

            </ul>
        </div>
    );
}