import React, { useState } from "react";
import Radio from "./forms/Radio";
import Input from "./forms/Input";
import { ContractFactory, ethers } from "ethers";

import PQMFERC20Distributor from "../constants/PermissionedABIs/ERC20/PQMFERC20Distributor";
import PSMFERC20Distributor from "../constants/PermissionedABIs/ERC20/PSMFERC20Distributor";
import PEqualERC20Distributor from "../constants/PermissionedABIs/ERC20/PEqualERC20Distributor";
import PQMFERC1155Distributor from "../constants/PermissionedABIs/ERC1155/PQMFERC1155Distributor";
import PSMFERC1155Distributor from "../constants/PermissionedABIs/ERC1155/PSMFERC1155Distributor";
import PEqualERC1155Distributor from "../constants/PermissionedABIs/ERC1155/PEqualERC1155Distributor";
import PQMFERC20DistributorBYTE from "../constants/PermissionedBytecodes/ERC20/PQMFERC20DistributorBYTE";
import PSMFERC20DistributorBYTE from "../constants/PermissionedBytecodes/ERC20/PSMFERC20DistributorBYTE";
import PEqualERC20DistributorBYTE from "../constants/PermissionedBytecodes/ERC20/PEqualERC20DistributorBYTE";
import PQMFERC1155DistributorBYTE from "../constants/PermissionedBytecodes/ERC1155/PQMFERC1155DistributorBYTE";
import PSMFERC1155DistributorBYTE from "../constants/PermissionedBytecodes/ERC1155/PSMFERC1155DistributorBYTE";
import PEqualERC1155DistributorBYTE from "../constants/PermissionedBytecodes/ERC1155/PEqualERC1155DistributorBYTE";
import PQMFNativeDistributor from "../constants/PermissionedABIs/Native/PQMFNativeDistributor";
import PSMFNativeDistributor from "../constants/PermissionedABIs/Native/PSMFNativeDistributor";
import PEqualNativeDistributor from "../constants/PermissionedABIs/Native/PEqualNativeDistributor";
import PQMFNativeDistributorBYTE from "../constants/PermissionedBytecodes/Native/PQMFNativeDistributorBYTE";
import PSMFNativeDistributorBYTE from "../constants/PermissionedBytecodes/Native/PSMFNativeDistributorBYTE";
import PEqualNativeDistributorBYTE from "../constants/PermissionedBytecodes/Native/PEqualNativeDistributorBYTE";

import QMFERC20Distributor from "../constants/PublicABIs/ERC20/QMFERC20Distributor";
import SMFERC20Distributor from "../constants/PublicABIs/ERC20/SMFERC20Distributor";
import EqualERC20Distributor from "../constants/PublicABIs/ERC20/EqualERC20Distributor";
import QMFERC1155Distributor from "../constants/PublicABIs/ERC1155/QMFERC1155Distributor";
import SMFERC1155Distributor from "../constants/PublicABIs/ERC1155/SMFERC1155Distributor";
import EqualERC1155Distributor from "../constants/PublicABIs/ERC1155/EqualERC1155Distributor";
import QMFERC20DistributorBYTE from "../constants/PublicBytecodes/ERC20/QMFERC20DistributorBYTE";
import SMFERC20DistributorBYTE from "../constants/PublicBytecodes/ERC20/SMFERC20DistributorBYTE";
import EqualERC20DistributorBYTE from "../constants/PublicBytecodes/ERC20/EqualERC20DistributorBYTE";
import QMFERC1155DistributorBYTE from "../constants/PublicBytecodes/ERC1155/QMFERC1155DistributorBYTE";
import SMFERC1155DistributorBYTE from "../constants/PublicBytecodes/ERC1155/SMFERC1155DistributorBYTE";
import EqualERC1155DistributorBYTE from "../constants/PublicBytecodes/ERC1155/EqualERC1155DistributorBYTE";
import QMFNativeDistributor from "../constants/PublicABIs/Native/QMFNativeDistributor";
import SMFNativeDistributor from "../constants/PublicABIs/Native/SMFNativeDistributor";
import EqualNativeDistributor from "../constants/PublicABIs/Native/EqualNativeDistributor";
import QMFNativeDistributorBYTE from "../constants/PublicBytecodes/Native/QMFNativeDistributorBYTE";
import SMFNativeDistributorBYTE from "../constants/PublicBytecodes/Native/SMFNativeDistributorBYTE";
import EqualNativeDistributorBYTE from "../constants/PublicBytecodes/Native/EqualNativeDistributorBYTE";

import erc20abi from "../constants/ERC20Resource";
import erc20byte from "../constants/ERC20ResourceBYTE";
import erc1155abi from "../constants/ERC1155Resource";
import erc1155byte from "../constants/ERC1155ResourceBYTE";

const contractDeployer = async (abi, byteCode, args) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const factory = new ContractFactory(abi, byteCode, signer);
  const contract = await factory.deploy(...args);

  const status = await contract.deployTransaction.wait();

  if (status.confirmations >= 1) {
    alert(`Contract created, contract address is ${status.contractAddress}`);
  }
};

const tokenCreateDeployer = async (tokenType, args) => {
  if (tokenType === "ERC20") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const factory = new ContractFactory(erc20abi, erc20byte, signer);
    const contract = await factory.deploy(...args);

    const status = await contract.deployTransaction.wait();

    alert(`ERC20 token created, contract address is ${status.contractAddress}`);
    return status.contractAddress;
  }


  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const factory = new ContractFactory(erc1155abi, erc1155byte, signer);
  const contract = await factory.deploy(...args);

  const status = await contract.deployTransaction.wait();

  alert(`ERC1155 token created, contract address is ${status.contractAddress}`);
  return status.contractAddress;
};

const deployer = async (isPermissioned, resourceType, algorithm, state) => {

  //Permissioned contracts
  if (JSON.parse(isPermissioned)) {
    switch (resourceType) {
      case "ERC20":
        switch (algorithm) {
          case "qmf":
            const argsqmferc20 = [
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
              argsqmferc20
            );
            break;
          case "smf":
            const argssmferc20 = [
              state._tokenContract,
              state._maxDemandVolume,
              state._epochCapacity,
              state._epochDuration,
              state._etherMultiplier,
              state._expirationBlocks,
              JSON.parse(state._enableWithdraw),
            ];
            await contractDeployer(
              PSMFERC20Distributor,
              PSMFERC20DistributorBYTE,
              argssmferc20
            );
            break;
          case "equal":
            const argsequalerc20 = [
              state._tokenContract,
              state._maxDemandVolume,
              state._epochCapacity,
              state._epochDuration,
              state._etherMultiplier,
              state._expirationBlocks,
              JSON.parse(state._enableWithdraw),
            ];
            await contractDeployer(
              PEqualERC20Distributor,
              PEqualERC20DistributorBYTE,
              argsequalerc20
            );
            break;
          default:
            break;
        }
        break;
      case "ERC1155":
        switch (algorithm) {
          case "qmf":
            const argsqmferc1155 = [
              state._tokenContract,
              state._tokenId,
              state._maxDemandVolume,
              state._epochCapacity,
              state._epochDuration,
              state._etherMultiplier,
              state._expirationBlocks,
              JSON.parse(state._enableWithdraw),
            ];
            await contractDeployer(
              PQMFERC1155Distributor,
              PQMFERC1155DistributorBYTE,
              argsqmferc1155
            );
            break;
          case "smf":
            const argssmferc1155 = [
              state._tokenContract,
              state._tokenId,
              state._maxDemandVolume,
              state._epochCapacity,
              state._epochDuration,
              state._etherMultiplier,
              state._expirationBlocks,
              JSON.parse(state._enableWithdraw),
            ];
            await contractDeployer(
              PSMFERC1155Distributor,
              PSMFERC1155DistributorBYTE,
              argssmferc1155
            );

            break;
          case "equal":
            const argsequalerc1155 = [
              state._tokenContract,
              state._tokenId,
              state._maxDemandVolume,
              state._epochCapacity,
              state._epochDuration,
              state._etherMultiplier,
              state._expirationBlocks,
              JSON.parse(state._enableWithdraw),
            ];
            await contractDeployer(
              PEqualERC1155Distributor,
              PEqualERC1155DistributorBYTE,
              argsequalerc1155
            );
            break;
          default:
            break;
        }
        break;
      case "native":
        switch (algorithm) {
          case "qmf":
            const argsqmfnative = [
              state._maxDemandVolume,
              state._epochCapacity,
              state._epochDuration,
              state._etherMultiplier,
              state._expirationBlocks,
              JSON.parse(state._enableWithdraw),
              state._value,
            ];
            await contractDeployer(
              PQMFNativeDistributor,
              PQMFNativeDistributorBYTE,
              argsqmfnative
            );
            break;
          case "smf":
            const argssmfnative = [
              state._maxDemandVolume,
              state._epochCapacity,
              state._epochDuration,
              state._etherMultiplier,
              state._expirationBlocks,
              JSON.parse(state._enableWithdraw),
              state._value,
            ];
            await contractDeployer(
              PSMFNativeDistributor,
              PSMFNativeDistributorBYTE,
              argssmfnative
            );

            break;
          case "equal":
            const argsequalnative = [
              state._maxDemandVolume,
              state._epochCapacity,
              state._epochDuration,
              state._etherMultiplier,
              state._expirationBlocks,
              JSON.parse(state._enableWithdraw),
              state._value,
            ];
            await contractDeployer(
              PEqualNativeDistributor,
              PEqualNativeDistributorBYTE,
              argsequalnative
            );

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
    case "ERC20":
      switch (algorithm) {
        case "qmf":
          const argsqmferc20p = [
            state._tokenContract,
            state._maxDemandVolume,
            state._epochCapacity,
            state._epochDuration,
            state._etherMultiplier,
            state._expirationBlocks,
            JSON.parse(state._enableWithdraw),
          ];
          await contractDeployer(
            QMFERC20Distributor,
            QMFERC20DistributorBYTE,
            argsqmferc20p
          );
          break;
        case "smf":
          const argssmferc20p = [
            state._tokenContract,
            state._maxDemandVolume,
            state._epochCapacity,
            state._epochDuration,
            state._etherMultiplier,
            state._expirationBlocks,
            JSON.parse(state._enableWithdraw),
          ];
          await contractDeployer(
            SMFERC20Distributor,
            SMFERC20DistributorBYTE,
            argssmferc20p
          );
          break;
        case "equal":
          const argsequalerc20p = [
            state._tokenContract,
            state._maxDemandVolume,
            state._epochCapacity,
            state._epochDuration,
            state._etherMultiplier,
            state._expirationBlocks,
            JSON.parse(state._enableWithdraw),
          ];
          await contractDeployer(
            EqualERC20Distributor,
            EqualERC20DistributorBYTE,
            argsequalerc20p
          );
          break;
        default:
          break;
      }
      break;
    case "ERC1155":
      switch (algorithm) {
        case "qmf":
          const argsqmferc1155p = [
            state._tokenContract,
            state._tokenId,
            state._maxDemandVolume,
            state._epochCapacity,
            state._epochDuration,
            state._etherMultiplier,
            state._expirationBlocks,
            JSON.parse(state._enableWithdraw),
          ];
          await contractDeployer(
            QMFERC1155Distributor,
            QMFERC1155DistributorBYTE,
            argsqmferc1155p
          );
          break;
        case "smf":
          const argssmferc1155p = [
            state._tokenContract,
            state._tokenId,
            state._maxDemandVolume,
            state._epochCapacity,
            state._epochDuration,
            state._etherMultiplier,
            state._expirationBlocks,
            JSON.parse(state._enableWithdraw),
          ];
          await contractDeployer(
            SMFERC1155Distributor,
            SMFERC1155DistributorBYTE,
            argssmferc1155p
          );

          break;
        case "equal":
          const argsequalerc1155p = [
            state._tokenContract,
            state._tokenId,
            state._maxDemandVolume,
            state._epochCapacity,
            state._epochDuration,
            state._etherMultiplier,
            state._expirationBlocks,
            JSON.parse(state._enableWithdraw),
          ];
          await contractDeployer(
            EqualERC1155Distributor,
            EqualERC1155DistributorBYTE,
            argsequalerc1155p
          );
          break;
        default:
          break;
      }
      break;
    case "native":
      switch (algorithm) {
        case "qmf":
          const argsqmfnativep = [
            state._maxDemandVolume,
            state._epochCapacity,
            state._epochDuration,
            state._etherMultiplier,
            state._expirationBlocks,
            JSON.parse(state._enableWithdraw),
            state._value,
          ];
          await contractDeployer(
            QMFNativeDistributor,
            QMFNativeDistributorBYTE,
            argsqmfnativep
          );

          break;
        case "smf":
          const argssmfnativep = [
            state._maxDemandVolume,
            state._epochCapacity,
            state._epochDuration,
            state._etherMultiplier,
            state._expirationBlocks,
            JSON.parse(state._enableWithdraw),
            state._value,
          ];
          await contractDeployer(
            SMFNativeDistributor,
            SMFNativeDistributorBYTE,
            argssmfnativep
          );

          break;
        case "equal":
          const argsequalnativep = [
            state._maxDemandVolume,
            state._epochCapacity,
            state._epochDuration,
            state._etherMultiplier,
            state._expirationBlocks,
            JSON.parse(state._enableWithdraw),
            state._value,
          ];
          await contractDeployer(
            EqualNativeDistributor,
            EqualNativeDistributorBYTE,
            argsequalnativep
          );

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
    RESOURCE_TYPE: "ERC20",
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

  const handleTokenCreation = async (tokenType) => {
    if (tokenType === "ERC20") {

      const address = await tokenCreateDeployer("ERC20", [
        erc20token._name,
        erc20token._symbol,
        erc20token._premintSupply,
        erc20token._maximumSupply,
      ]);
      setState((prev) => ({ ...prev, _tokenContract: address }));
      setCreateToken((prev) => false);
      return;
    }

    const address = await tokenCreateDeployer("ERC1155", [
      erc1155._name,
      erc1155._symbol,
      erc1155._uri,
      erc1155._premintIds.split(",").map((numstr) => parseInt(numstr)),
      erc1155._premintSupplies.split(",").map((numstr) => parseInt(numstr)),
      erc1155._maximumSupplies.split(",").map((numstr) => parseInt(numstr)),
    ]);
    setState((prev) => ({ ...prev, _tokenContract: address }));
    setCreateToken((prev) => false);
  };
  return (
    <div className="w-full flex flex-col gap-3 p-3 bg-white rounded-md shadow-md border border-gray-200">
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
          { title: "ERC20", value: "ERC20", id: "resource-type-erc20" },
          { title: "ERC1155", value: "ERC1155", id: "resource-type-erc1155" },
          { title: "Native", value: "Native", id: "resource-type-native" },
        ]}
        onChange={(val) =>
          setConfig((prev) => ({ ...prev, RESOURCE_TYPE: val }))
        }
        isInline={true}
        title={"Resource Type"}
        value={config.RESOURCE_TYPE}
      />

      {(config.RESOURCE_TYPE === "ERC20" ||
        config.RESOURCE_TYPE === "ERC1155") && (
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
              <button className="w-60 hover:bg-red-500" onClick={() => setCreateToken(false)}>
                Cancel {config.RESOURCE_TYPE} Creation
              </button>
            ) : (
              <button className="w-60 hover:bg-green-500" onClick={() => setCreateToken(true)}>
                Create {config.RESOURCE_TYPE} Token
              </button>
            )}

            {config.RESOURCE_TYPE === "ERC20" && createToken && (
              <div className="border p-4 rounded-lg ">
                <Input
                  id="_name"
                  title={"Name"}
                  placeholder="300"
                  onChange={(val) =>
                    seterc20Token((prev) => ({ ...prev, _name: val }))
                  }
                  value={erc20token._name}
                />
                <Input
                  id="_symbol"
                  title={"Symbol"}
                  placeholder="300"
                  onChange={(val) =>
                    seterc20Token((prev) => ({ ...prev, _symbol: val }))
                  }
                  value={erc20token._symbol}
                />
                <Input
                  id="_premintSupply"
                  title={"Premint Supply"}
                  placeholder="300"
                  onChange={(val) =>
                    seterc20Token((prev) => ({ ...prev, _premintSupply: val }))
                  }
                  value={erc20token._premintSupply}
                />
                <Input
                  id="_maximumSupply"
                  title={"Maximum Supply"}
                  placeholder="300"
                  onChange={(val) =>
                    seterc20Token((prev) => ({ ...prev, _maximumSupply: val }))
                  }
                  value={erc20token._maximumSupply}
                />
                <div className="flex w-full justify-start">
                  <button
                    className="mt-4 w-60 hover:bg-green-500"
                    onClick={() => handleTokenCreation("erc20")}
                  >
                    Create ERC20 Token
                  </button>
                </div>
              </div>
            )}

            {config.RESOURCE_TYPE === "ERC1155" && createToken && (
              <div className="border p-4 rounded-lg ">
                <Input
                  id="_name"
                  title={"Name"}
                  placeholder="300"
                  onChange={(val) =>
                    seterc1155Token((prev) => ({ ...prev, _name: val }))
                  }
                  value={erc1155._name}
                />
                <Input
                  id="_symbol"
                  title={"Symbol"}
                  placeholder="300"
                  onChange={(val) =>
                    seterc1155Token((prev) => ({ ...prev, _symbol: val }))
                  }
                  value={erc1155._symbol}
                />
                <Input
                  id="_uri"
                  title={"Uri"}
                  placeholder="300"
                  onChange={(val) =>
                    seterc1155Token((prev) => ({ ...prev, _uri: val }))
                  }
                  value={erc1155._uri}
                />
                <Input
                  id="_premintIds"
                  title={"Premint Ids"}
                  placeholder="300"
                  onChange={(val) =>
                    seterc1155Token((prev) => ({ ...prev, _premintIds: val }))
                  }
                  value={erc1155._premintIds}
                />
                <Input
                  id="_premintSupplies"
                  title={"Premint Supplies"}
                  placeholder="300"
                  onChange={(val) =>
                    seterc1155Token((prev) => ({ ...prev, _premintSupply: val }))
                  }
                  value={erc1155._premintSupplies}
                />
                <Input
                  id="_maximumSupplies"
                  title={"Maximum Supplies"}
                  placeholder="300"
                  on={(val) =>
                    seterc1155Token((prev) => ({
                      ...prev,
                      _maximumSupplies: val,
                    }))
                  }
                  value={erc1155._maximumSupplies}
                />
                <div className="flex w-full justify-start">
                  <button
                    className="mt-4 w-60 hover:bg-green-500"
                    onClick={() => handleTokenCreation("ERC1155")}
                  >
                    Create ERC1155 Token
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      <div>
        <Input
          id="_maxDemandVolume"
          title={"Max Demand Volume"}
          placeholder="300"
          type={"number"}
          onChange={(val) =>
            setState((prev) => ({ ...prev, _maxDemandVolume: val }))
          }
          value={state._maxDemandVolume}
        />
        {config.RESOURCE_TYPE === "ERC1155" && (
          <Input
            id="_tokenId"
            title={"Token Id"}
            type={"number"}
            placeholder="0"
            onChange={(val) => setState((prev) => ({ ...prev, _tokenId: val }))}
            value={state._tokenId}
          />
        )}
        <Input
          id="_epochCapacity"
          title={"Epoch Capacity"}
          type={"number"}
          placeholder="500"
          onChange={(val) =>
            setState((prev) => ({ ...prev, _epochCapacity: val }))
          }
          value={state._epochCapacity}
        />
        <Input
          id="_epochDuration"
          title={"Epoch Duration"}
          type={"number"}
          placeholder="600"
          onChange={(val) =>
            setState((prev) => ({ ...prev, _epochDuration: val }))
          }
          value={state._epochDuration}
        />
        <Input
          id="_etherMultiplier"
          title={"Ether Multiplier"}
          type={"number"}
          placeholder="10"
          onChange={(val) =>
            setState((prev) => ({ ...prev, _etherMultiplier: val }))
          }
          value={state._etherMultiplier}
        />
        <Input
          id="_expirationBlocks"
          title={"Expiration Blocks"}
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
          title={"Enable Withdraw"}
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
            className="bg-blue-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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