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
        <h1 className="text-3xl font-bold text-center mb-2 mt-4">Subnet Deployment Page</h1>
        <div className="form-group">
          <form onSubmit={handleAddSubnet}>
            <input type="text" name="subnetID" onChange={setSubnetID} placeholder="Enter Subnet ID" />
            <button className="mb-1"
            >
              Add Subnet
            </button>
          </form>
        </div>
        <br />
        <div className="flex flex-col items-center">
          <h2>Informative Text Field</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </div>
        <div className="flex flex-col items-center">
          <h2>Informative Text Field</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <ul>
            <li>Bullet point 1</li>
            <li>Bullet point 2</li>
            <li>Bullet point 3</li>
          </ul>
        </div>
        <br />
        <button className="mb-10" onClick={handleCreateSubnet}>
          Create Subnet
        </button>
      </div>
      <div>
        <h1 className="text-xl font-medium text-center mb-2 mt-4">Imported & Created Subnets</h1>

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
  );
};

export default Deployment;
