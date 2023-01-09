import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/fontawesome-free-solid";
import Collapsible from "./Collapsible";
import Input from "./forms/Input";
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
    <div className="border rounded-md mb-4">
      <Collapsible
        title={
          <div className="flex flex-row items-center justify-center">
            <span className="text-lg mr-2">Subnet: </span>
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
        <div className="w-full flex items-center justify-center gap-4 mb-4">
          <div className="w-8/12">
            <Input />
          </div>
          <p className=" ">Bootstraped node id</p>
        </div>
        <button className="w-[150px] m-0">Add Validator</button>
      </Collapsible>
    </div>
  );
};

export default SubnetContainer;
