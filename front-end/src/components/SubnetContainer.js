import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/fontawesome-free-solid";
import Collapsible from "./Collapsible";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

const SubnetContainer = ({ refresher, tx }) => {
  
  const [bootstrappedNodeId, setBootstrappedNodeId] = useState("");

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

  const handleAddValidator = (bootstrappedNodeId) => {
    // pass
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-gray-300 rounded-md p-2 m-2">
      <Collapsible
        title={
          <div className="flex flex-row items-center justify-center">
            
            <Link to={`./${tx}?bootstrappedNodeId=${bootstrappedNodeId}`} >
                {
                  <div className="text-l font-bold text-center hover:text-blue-600 focus:text-blue-600">
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
        <div className=" flex flex-row items-center justify-center mb-1">
          <div className="flex flex-col items-center justify-center">
            <input
              className="w-52"
              type="string"
              name="bootstrappedNodeId"
              placeholder="Node ID"
              value={bootstrappedNodeId}
              onChange={handleBootstrappedNodeIdChange}
            />
          </div>
          <p className="flex flex-col items-center justify-center m-2">Bootstrapped Node ID</p>
        </div>
        <button onClick={() => handleAddValidator(bootstrappedNodeId)} className="mt-2">Add Validator</button>


      </Collapsible>
    </div>
  );
};

export default SubnetContainer;
