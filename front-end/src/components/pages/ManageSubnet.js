import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import ContractPermissionContainer from "../ContractPermissionContainer";

export default function ManagePageTransactions() {

    const [tokenStandard, setTokenStandard] = useState(0);
    const [distributionAlgorithm, setDistributionAlgorithm] = useState(0);
    const [blockchainExists, setBlockchainExists] = useState(true);
    const [contractAddresses, setContractAddresses] = useState([]);
    const [onDeleteRefreshState, onDeleteRefresh] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        const subnets = JSON.parse(localStorage.getItem("subnets"));
        if (!subnets) {
            setBlockchainExists(false);
        }

        if (!subnets.find((subnet) => subnet.blockchainId === id)) {
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

    const handleTokenStandardChange = (event) => {
        setTokenStandard(event.target.value);
    }

    const handleDistributionAlgorithmChange = (event) => {
        setDistributionAlgorithm(event.target.value);
    }


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
        <div className='flex flex-col items-center'>
            <div className="flex justify-center">
                <h1 className="text-3xl font-bold mb-2 mt-4">Subnet Management Portal</h1>
            </div>
            <div className="flex flex-col items-center">

                <div className="flex flex-col items-center">
                    <div className="flex justify-center">
                        <h1 className="text-xl font-bold mb-2 mt-4 text-gray-700">Set Permissioned Users</h1>
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
                        />
                        <button className="mt-1 mb-4">Add Contract</button>
                    </form>
                    <ul>
                        {contractAddresses.map((contractAddress) => (
                            <ContractPermissionContainer
                                contractAddress={contractAddress}
                                onDeleteRefresh={onDeleteRefresh}
                            />
                        ))}
                    </ul>
                </div>
            </div>
            <hr className="border-2 border-blue-200 w-11/12 mb-4 mt-4" />
            

            <ul>
                <div className="flex justify-center">
                    <h1 className="text-xl font-bold mb-2 mt-4 text-gray-700">Generate New Distribution</h1>
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


            </ul>
        </div>
    );
}