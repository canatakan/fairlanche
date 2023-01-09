import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import ContractPrecompilerContainer from "./ContractPrecompileContainer";

const BlockchainPermission = () => {
  const [blockchainIds, setBlockchainIds] = useState([]);
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
    const blockchainIds =
      JSON.parse(localStorage.getItem("blockchainIds")) || [];
    setBlockchainIds(blockchainIds);
  }, [onDeleteRefreshState]);

  const validateblockchainId = (blockchainId) => {

    for (let i = 0; i < blockchainIds.length; i++) {
      if (blockchainIds[i] === blockchainId) {
        alert("Blockchain ID with this ID already exists");
        return false;
      }
    }

    return true;
  };

  const saveBlockchainId = (blockchainId) => {
    if (!validateblockchainId(blockchainId)) {
      return;
    }
    const blockchainIds =
      JSON.parse(localStorage.getItem("blockchainIds")) || [];
    blockchainIds.push(blockchainId);
    localStorage.setItem(
      "blockchainIds",
      JSON.stringify(blockchainIds)
    );
    setBlockchainIds((prev) => [...prev, blockchainId]);
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
            const blockchainId = event.target.elements.blockchainId.value;
            saveBlockchainId(blockchainId);
          }}
        >

          <input
            type="string"
            name="blockchainId"
            placeholder="Blockchain ID"
            className="border-2 px-2 py-1 rounded-md w-80"
          />
          <button className="mt-2 mb-5">Add Blockchain</button>
        </form>

        <ul>
          {blockchainIds.map((blockchainId) => (
            <ContractPrecompilerContainer
              key={blockchainId}
              blockchainId={blockchainId}
              onDeleteRefresh={onDeleteRefresh}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BlockchainPermission;
