import React, { useEffect, useState } from "react";
import Input from "../forms/Input";
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

 

  return (
    <>
      

      <div>
        <h1 className="text-xl mt-4 ">Deploy Subnet</h1>
        <div className="w-5/12 mx-auto mb-24">
          <div className="mb-6 flex flex-col items-end gap-2">
            <div className="w-full flex items-center justify-center gap-4">
              <div className="w-full">
                <Input value={subnetInput} onChange={setSubnetInput} />
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
                bootstrappedNodeId={22}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Deployment;
