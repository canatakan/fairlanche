import React, { useEffect, useState } from "react";
import Radio from "../forms/Radio";
import SubnetContainer from "../SubnetContainer";



const Deployment = () => {
  const [subnets, setSubnets] = useState([]);

  const [subnetInput, setSubnetInput] = useState("");

  const handleCreateSubnet = () => {
    const fake = Date.now().toString();
    setSubnets((prev) => [...prev, fake]);
    const subnets = JSON.parse(window.localStorage.getItem("subnetsXYZ")) ?? [];
    window.localStorage.setItem(
      "subnetsXYZ",
      JSON.stringify([...subnets, fake])
    );
    setRefreshState((prev) => !prev);
  };

  const [refreshState, setRefreshState] = useState(false);

  const handleAddSubnet = () => {
    if (subnetInput.length < 4) {
      alert("Enter valid subnets");
      return;
    }
    setSubnets((prev) => [...prev, subnetInput]);
    const subnets = JSON.parse(window.localStorage.getItem("subnetsXYZ")) ?? [];
    window.localStorage.setItem(
      "subnetsXYZ",
      JSON.stringify([...subnets, subnetInput])
    );
    setRefreshState((prev) => !prev);
  };

  useEffect(() => {
    setSubnets(
      () => JSON.parse(window.localStorage.getItem("subnetsXYZ")) ?? []
    );
  }, [refreshState]);

  const setSubnetID = (e) => {
    setSubnetInput(e.target.value);
  };
 
 

  return (
    <div className="flex flex-col items-center">
    <div className="w-full flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-2 mt-4">Management Page</h1>
        <div className="w-5/12 mx-auto mb-24">
          <div className="mb-6 flex flex-col items-end gap-2">
            <div className="w-full flex items-center justify-center gap-4">
              <div className="w-full">
                <input value={subnetInput} onChange={setSubnetID} placeholder="Enter Subnet" className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <button className="w-[195px] m-0 " onClick={handleAddSubnet}>
                Add Subnet
              </button>
            </div>
            <button className="w-[150px] m-0" onClick={handleCreateSubnet}>
              Create Subnet
            </button>
          </div>
          <div>
            <h1 className="text-xl mb-4">Subnets</h1>

            {subnets.map((subnet) => (
              <SubnetContainer
                key={subnet}
                refresher={() => setRefreshState((prev) => !prev)}
                tx={subnet}
                bootstrappedNodeId={223248238572389573}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deployment;
