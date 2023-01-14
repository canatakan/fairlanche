import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/fontawesome-free-solid";
import Collapsible from "./Collapsible";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

import { addSubnetValidator } from "subnet/scripts/addSubnetValidator"
import { WalletUtils } from "./WalletUtils";

const SubnetContainer = ({ refresher, tx }) => {

  const [bootstrappedNodeId, setBootstrappedNodeId] = useState("NodeID-3S3Wiybrabk8X71YDKk1451tNqUV7q2pn");

  const handleDelete = (subnetTX) => {
    const subnets = JSON.parse(window.localStorage.getItem("managedSubnets")) ?? [];
    const newSubnets = subnets.filter(
      (_, index) => subnets.indexOf(subnetTX) != index
    );
    window.localStorage.setItem("managedSubnets", JSON.stringify(newSubnets));

    if (refresher) refresher();
  };

  const handleBootstrappedNodeIdChange = (event) => {
    setBootstrappedNodeId(event.target.value);
  };

  const handleAddValidator = async (bootstrappedNodeId) => {
    const { checksumAddr: username, signature: password } = await getSignature();
    addSubnetValidator(username, password, bootstrappedNodeId, tx)
  };

  const { getSignature } = WalletUtils();

  return (
    <div className="flex-none w-full flex-col items-center justify-center border-2 border-gray-300 rounded-md p-2 m-2">
      <Collapsible
        title={
          <div className="flex flex-row items-center justify-center">

            <Link to={`./${tx}`} >
              {
                <div className="text-l font-bold text-center hover:text-red-600 focus:text-red-600">
                  {tx}
                </div>
              }
            </Link>
          </div>
        }
        item={
          <div
            className="btn p-2 hover:bg-gray-200 rounded font-weight-bold text-center"
            onClick={() => {
              if (
                window.confirm("Are you sure you wish to remove this subnet?")
              )
                handleDelete(tx);
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
          </div>
        }
      >
        <div className="p-4 flex flex-col ">
          <div className="text-m text-left mb-1">Node ID</div>
          <input
            className="w-full mb-0"
            type="string"
            name="bootstrappedNodeId"
            placeholder="Fully Bootstrapped Node ID"
            value={bootstrappedNodeId}
            onChange={handleBootstrappedNodeIdChange}
          />
        </div>
        <button onClick={() => handleAddValidator(bootstrappedNodeId)} className="w-64 mt-0 mb-2">
          Add Subnet Validator</button>

      </Collapsible>
    </div>
  );
};

export default SubnetContainer;
