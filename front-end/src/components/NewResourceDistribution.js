import React, { useState } from "react";
import Radio from "./forms/Radio";
import Input from "./forms/Input";
import { ContractFactory, ethers } from "ethers";

//import here permissioned qmf erc20
import PQMFERC20Distributor from "../constants/PQMFERC20Distributor";
import PQMFERC20DistributorBYTE from "../constants/PQMFERC20DistributorBYTE";

//import here public smf erc115

const contractDeployer = async (abi, byteCode, args) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const factory = new ContractFactory(
    PQMFERC20Distributor,
    PQMFERC20DistributorBYTE,
    signer
  );
  const contract = await factory.deploy(...args);

  const status = await contract.deployTransaction.wait();

  if (status.confirmations >= 1) {
    alert(`Contract created, contract address is ${status.contractAddress}`);
  }
};

const deployer = async (isPermissioned, resourceType, algorithm, state) => {
  //Permissioned contracts
  if (JSON.parse(isPermissioned)) {
    switch (resourceType) {
      case "erc20":
        switch (algorithm) {
          case "qmf":
            const args = [
              state._tokenContract,
              state._maxDemandVolume,
              state._epochCapacity,
              state._epochDuration,
              state._etherMultiplier,
              state._expirationBlocks,
              JSON.parse(state._enableWithdraw),
            ];
            await contractDeployer(
              PQMFERC20Distributor,
              PQMFERC20DistributorBYTE,
              args
            );
            break;
          case "smf":
            console.log("permissoned smf erc20");
            break;
          case "equal":
            console.log("permissoned equal erc20");
            break;
          default:
            break;
        }
        break;
      case "erc1155":
        switch (algorithm) {
          case "qmf":
            console.log("permissoned qmf erc1155");
            break;
          case "smf":
            console.log("permissoned smf erc1155");

            break;
          case "equal":
            console.log("permissoned equal erc1155");
            break;
          default:
            break;
        }
        break;
      case "native":
        switch (algorithm) {
          case "qmf":
            console.log("permissoned qmf native");

            break;
          case "smf":
            console.log("permissoned smf native");

            break;
          case "equal":
            console.log("permissoned equal native");

            break;
          default:
            break;
        }
        break;
      default:
        break;
    }

    return;
  }

  //Public contracts
  switch (resourceType) {
    case "erc20":
      switch (algorithm) {
        case "qmf":
          const args = [
            state._tokenContract,
            state._maxDemandVolume,
            state._epochCapacity,
            state._epochDuration,
            state._etherMultiplier,
            state._expirationBlocks,
            JSON.parse(state._enableWithdraw),
          ];
          await contractDeployer(
            PQMFERC20Distributor,
            PQMFERC20DistributorBYTE,
            args
          );
          break;
        case "smf":
          console.log("permissoned smf erc20");
          break;
        case "equal":
          console.log("permissoned equal erc20");
          break;
        default:
          break;
      }
      break;
    case "erc1155":
      switch (algorithm) {
        case "qmf":
          console.log("permissoned qmf erc1155");
          break;
        case "smf":
          console.log("permissoned smf erc1155");

          break;
        case "equal":
          console.log("permissoned equal erc1155");
          break;
        default:
          break;
      }
      break;
    case "native":
      switch (algorithm) {
        case "qmf":
          console.log("permissoned qmf native");

          break;
        case "smf":
          console.log("permissoned smf native");

          break;
        case "equal":
          console.log("permissoned equal native");

          break;
        default:
          break;
      }
      break;
    default:
      break;
  }
};

const NewResourceDistribution = () => {
  const [config, setConfig] = useState({
    RESOURCE_TYPE: "erc20",
    IS_PERMISSIONED: "true",
    ALGORITHM: "qmf",
  });

  const [state, setState] = useState({
    _tokenContract: null,
    _tokenId: 0,
    _maxDemandVolume: 300,
    _epochCapacity: 500,
    _epochDuration: 600,
    _etherMultiplier: 1000,
    _expirationBlocks: 3000,
    _enableWithdraw: "true",
    _value: 0,
  });

  const [erc20token, seterc20Token] = useState({
    _name: "Test Token",
    _symbol: "TST20",
    _premintSupply: ethers.utils.parseEther("100000"),
    _maximumSupply: ethers.utils.parseEther("1000000"),
  });

  const [erc1155, seterc1155Token] = useState({
    _name: "Test Token",
    _symbol: "TST1155",
    _uri: "https://<EXAMPLE_WEBSITE>/api/item/{id}.json",
    _premintIds: "0, 1, 2",
    _premintSupplies: "100000, 100000, 100000",
    _maximumSupplies: "1_000_000, 1_000_000, 1_000_000",
  });
  const [createToken, setCreateToken] = useState(false);
  return (
    <div className="w-full flex flex-col gap-3">
      <Radio
        name={"resource-publicity"}
        options={[
          { title: "Public", value: "false", id: "resource-publicity-public" },
          {
            title: "Permissioned",
            value: "true",
            id: "resource-publicity-permissioned",
          },
        ]}
        onChange={(val) =>
          setConfig((prev) => ({ ...prev, IS_PERMISSIONED: val }))
        }
        isInline={true}
        title={"Resource Publicity"}
        value={config.IS_PERMISSIONED}
      />
      <Radio
        name={"distribution-mechanism"}
        options={[
          { title: "QMF", value: "qmf", id: "distribution-mechanism-qmf" },
          { title: "SMF", value: "smf", id: "distribution-mechanism-smf" },
          {
            title: "EQUAL",
            value: "equal",
            id: "distribution-mechanism-equal",
          },
        ]}
        onChange={(val) => setConfig((prev) => ({ ...prev, ALGORITHM: val }))}
        isInline={true}
        title={"Distribution Mechanism"}
        value={config.ALGORITHM}
      />
      <Radio
        name={"resource-type"}
        options={[
          { title: "erc20", value: "erc20", id: "resource-type-erc20" },
          { title: "erc1155", value: "erc1155", id: "resource-type-erc1155" },
          { title: "native", value: "native", id: "resource-type-native" },
        ]}
        onChange={(val) =>
          setConfig((prev) => ({ ...prev, RESOURCE_TYPE: val }))
        }
        isInline={true}
        title={"Resource Type"}
        value={config.RESOURCE_TYPE}
      />

      {(config.RESOURCE_TYPE === "erc20" ||
        config.RESOURCE_TYPE === "erc1155") && (
        <>
          {!createToken && (
            <Input
              id="_tokenContract"
              title={"Token Contract Address"}
              placeholder="Address"
              onChange={(val) =>
                setState((prev) => ({ ...prev, _tokenContract: val }))
              }
              value={state._tokenContract ?? ""}
            />
          )}
          {createToken ? (
            <button className="w-56" onClick={() => setCreateToken(false)}>
              Cancel {config.RESOURCE_TYPE} Creation
            </button>
          ) : (
            <button className="w-56" onClick={() => setCreateToken(true)}>
              Create {config.RESOURCE_TYPE} token
            </button>
          )}

          {config.RESOURCE_TYPE === "erc20" && createToken && (
            <div className="border p-4 rounded-lg ">
              <Input
                id="_name"
                title={"_name"}
                placeholder="300"
                onChange={(val) =>
                  seterc20Token((prev) => ({ ...prev, _name: val }))
                }
                value={erc20token._name}
              />
              <Input
                id="_symbol"
                title={"_symbol"}
                placeholder="300"
                onChange={(val) =>
                  seterc20Token((prev) => ({ ...prev, _symbol: val }))
                }
                value={erc20token._symbol}
              />
              <Input
                id="_premintSupply"
                title={"_premintSupply"}
                placeholder="300"
                onChange={(val) =>
                  seterc20Token((prev) => ({ ...prev, _premintSupply: val }))
                }
                value={erc20token._premintSupply}
              />
              <Input
                id="_maximumSupply"
                title={"_maximumSupply"}
                placeholder="300"
                onChange={(val) =>
                  seterc20Token((prev) => ({ ...prev, _maximumSupply: val }))
                }
                value={erc20token._maximumSupply}
              />
            </div>
          )}

          {config.RESOURCE_TYPE === "erc1155" && createToken && (
            <div className="border p-4 rounded-lg ">
              <Input
                id="_name"
                title={"_name"}
                placeholder="300"
                onChange={(val) =>
                  seterc1155Token((prev) => ({ ...prev, _name: val }))
                }
                value={erc1155._name}
              />
              <Input
                id="_symbol"
                title={"_symbol"}
                placeholder="300"
                onChange={(val) =>
                  seterc1155Token((prev) => ({ ...prev, _symbol: val }))
                }
                value={erc1155._symbol}
              />
              <Input
                id="_uri"
                title={"_uri"}
                placeholder="300"
                onChange={(val) =>
                  seterc1155Token((prev) => ({ ...prev, _uri: val }))
                }
                value={erc1155._uri}
              />
              <Input
                id="_premintIds"
                title={"_premintIds"}
                placeholder="300"
                onChange={(val) =>
                  seterc1155Token((prev) => ({ ...prev, _premintIds: val }))
                }
                value={erc1155._premintIds}
              />
              <Input
                id="_premintSupplies"
                title={"_premintSupplies"}
                placeholder="300"
                onChange={(val) =>
                  seterc1155Token((prev) => ({ ...prev, _premintSupply: val }))
                }
                value={erc1155._premintSupplies}
              />
              <Input
                id="_maximumSupplies"
                title={"_maximumSupplies"}
                placeholder="300"
                on={(val) =>
                  seterc1155Token((prev) => ({
                    ...prev,
                    _maximumSupplies: val,
                  }))
                }
                value={erc1155._maximumSupplies}
              />
            </div>
          )}
        </>
      )}
      <div>
        <Input
          id="_maxDemandVolume"
          title={"_maxDemandVolume"}
          placeholder="300"
          type={"number"}
          onChange={(val) =>
            setState((prev) => ({ ...prev, _maxDemandVolume: val }))
          }
          value={state._maxDemandVolume}
        />
        {config.RESOURCE_TYPE === "erc1155" && (
          <Input
            id="_tokenId"
            title={"_tokenId"}
            type={"number"}
            placeholder="0"
            onChange={(val) => setState((prev) => ({ ...prev, _tokenId: val }))}
            value={state._tokenId}
          />
        )}
        <Input
          id="_epochCapacity"
          title={"_epochCapacity"}
          type={"number"}
          placeholder="500"
          onChange={(val) =>
            setState((prev) => ({ ...prev, _epochCapacity: val }))
          }
          value={state._epochCapacity}
        />
        <Input
          id="_epochDuration"
          title={"_epochDuration"}
          type={"number"}
          placeholder="600"
          onChange={(val) =>
            setState((prev) => ({ ...prev, _epochDuration: val }))
          }
          value={state._epochDuration}
        />
        <Input
          id="_etherMultiplier"
          title={"_etherMultiplier"}
          type={"number"}
          placeholder="1000"
          onChange={(val) =>
            setState((prev) => ({ ...prev, _etherMultiplier: val }))
          }
          value={state._etherMultiplier}
        />
        <Input
          id="_expirationBlocks"
          title={"_expirationBlocks"}
          type={"number"}
          placeholder="3000"
          onChange={(val) =>
            setState((prev) => ({ ...prev, _expirationBlocks: val }))
          }
          value={state._expirationBlocks}
        />
        <Radio
          name={"_enableWithdraw"}
          options={[
            { title: "True", value: "true", id: "_enableWithdraw-true" },
            { title: "False", value: "false", id: "_enableWithdraw-false" },
          ]}
          onChange={(val) =>
            setState((prev) => ({ ...prev, _enableWithdraw: val }))
          }
          isInline={true}
          title={"_enableWithdraw"}
          value={state._enableWithdraw}
        />
        {config.RESOURCE_TYPE === "native" && (
          <Input
            id="_value"
            title={"_value"}
            type={"number"}
            placeholder="3000"
            onChange={(val) => setState((prev) => ({ ...prev, _value: val }))}
            value={state._value}
          />
        )}
      </div>

      <div className="flex flex-row items-center justify-center">
        <div className="flex justify-center mb-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={() =>
              deployer(
                config.IS_PERMISSIONED,
                config.RESOURCE_TYPE,
                config.ALGORITHM,
                state
              )
            }
          >
            Generate Distribution
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewResourceDistribution;

{
  /* <ul>
<div className="flex justify-center"> 
  <h1 className="text-xl font-bold mb-2 mt-4 text-gray-700">
    Generate New Distribution
  </h1>
</div>
<div className="flex flex-col items-center">
  <div className="mb-4 ml-2 mr-2">
    <label
      className="text-gray-500 text-sm font-bold mb-2"
      htmlFor="subnetId"
    >
      Token Symbol
    </label>
    <input
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      id="subnetId"
      type="string"
      placeholder="Enter your subnet's ChainId. It can be any positive integer."
    />
  </div>
  <div className="mb-4 ml-2 mr-2">
    <label
      className="text-gray-500 text-sm font-bold mb-2"
      htmlFor="epochCapacity"
    >
      Epoch Capacity
    </label>
    <input
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      id="epochCapacity"
      type="number"
      placeholder="Enter epoch capacity. (ie. 1000)"
    />
  </div>
  <div className="mb-4 ml-2 mr-2">
    <label
      className="text-gray-500 text-sm font-bold mb-2"
      htmlFor="epochDuration"
    >
      Epoch Duration
    </label>
    <input
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      id="epochDuration"
      type="number"
      placeholder="Enter epoch duration. (ie. 1000)"
    />
  </div>

  <div className="mb-4 ml-2 mr-2">
    <label
      className="text-gray-500 text-sm font-bold mb-2"
      htmlFor="DistributionAlgorithm"
    >
      Distribution Algorithm
    </label>
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <select
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline align-middle"
        id="DistributionAlgorithm"
        value={distributionAlgorithm}
        onChange={handleDistributionAlgorithmChange}
      >
        <option>Quantized Max-Min Fairness</option>
        <option>Dominant Resource Fairness</option>
      </select>
    </div>
  </div>

  <div className="mb-4 ml-2 mr-2">
    <label
      className="text-gray-500 text-sm font-bold mb-2"
      htmlFor="feeRate"
    >
      Token Standard
    </label>
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
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

</ul> */
}
