import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/fontawesome-free-solid";
import Collapsible from "./Collapsible";
import { Link } from "react-router-dom";

const SubnetContainer = ({ refresher, tx,bootstrappedNodeId }) => {
  const handleDelete = (subnetTX) => {
    const subnets = JSON.parse(window.localStorage.getItem("subnetsXYZ")) ?? [];
    const newSubnets = subnets.filter(
      (_, index) => subnets.indexOf(subnetTX) != index
    );
    window.localStorage.setItem("subnetsXYZ", JSON.stringify(newSubnets));

    if (refresher) refresher();
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
                window.confirm("Are you sure you wish to remove this contract?")
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
            <input className="border-2 px-2 py-1 rounded-md w-56" type="string" name="bootstrappedNodeId" value={bootstrappedNodeId} placeholder="Bootstrapped Node ID" />
          </div>
          <p className="flex flex-col items-center justify-center m-2">Bootstrapped Node ID</p>
        </div>
        <button className="w-48"> Add Validator </button>
      </Collapsible>
    </div>
  );
};

export default SubnetContainer;
