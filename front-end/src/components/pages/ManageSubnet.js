import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import ContractPermissionContainer from "../ContractPermissionContainer";
import { Tab } from "@headlessui/react";
import NewResourceDistribution from "../NewResourceDistribution";
import ExistingDistribution from "../ExistingDistribution";


function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

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
  };

  const handleDistributionAlgorithmChange = (event) => {
    setDistributionAlgorithm(event.target.value);
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
        <h1 className="text-3xl font-bold mb-2 mt-4">
          Subnet Management Portal
        </h1>
      </div>
      <div className="w-full max-w-xl px-2 py-16 sm:px-0">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/60 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400  ",
                  selected
                    ? "bg-white shadow hover:bg-white"
                    : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              Blockchain Permission
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400  ",
                  selected
                    ? "bg-white shadow hover:bg-white"
                    : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              New Resource Distribution
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400  ",
                  selected
                    ? "bg-white shadow hover:bg-white"
                    : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              Existing Distribution
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-2">
            <Tab.Panel
              className={classNames(
                "rounded-xl bg-white p-3",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
              )}
            >
              Panel 1
            </Tab.Panel>
            <Tab.Panel
              className={classNames(
                "rounded-xl bg-white p-3",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
              )}
            >
            <NewResourceDistribution />
            </Tab.Panel>
            <Tab.Panel
              className={classNames(
                "rounded-xl bg-white p-3",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
              )}
            >
            <ExistingDistribution />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
