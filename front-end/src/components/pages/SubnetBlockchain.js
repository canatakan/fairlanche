import React, { useEffect, useState } from "react";
import FileInput from "../forms/FileInput";
import Input from "../forms/Input";
import Radio from "../forms/Radio";
import { useLocation, useParams } from "react-router-dom";
import BlockchainTxContainer from "../BlockchainTxContainer";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const SubnetBlockchain = () => {
  const [blockChainState, setBlockChainState] = useState({
    chainName: "",
    chainID: 0,
    feesRate: "low",
    // tokenSymbol: "",
    // RPCURL
    // decimal
  });

  const [inputFiles, setInputFiles] = useState({
    fundDistribution: null,
    deployerAdmin: null,
    deployerEnabled: null,
    txAdmin: null,
    txEnabled: null,
  });

  const { tx } = useParams();
  const bootstrappedNodeId = useQuery().get("bootstrappedNodeId");

  const [txList, setTxList] = useState([]);

  useEffect(() => {
    const all = JSON.parse(window.localStorage.getItem("BLOCKCHAIN_TXS")) ?? {};
    setTxList(all[tx] ?? []);
  }, []);

  const handleCreateBlockChain = () => {
    console.log("create blockchain");
    console.log(inputFiles)
    //do required validation on datas and call backend, suppose it returns a tx
    const blockchainTX = Date.now().toString();
    const all = JSON.parse(window.localStorage.getItem("BLOCKCHAIN_TXS")) ?? {};
    if(all[tx]){

      all[tx] = [...all[tx], blockchainTX];
  
      window.localStorage.setItem("BLOCKCHAIN_TXS", JSON.stringify(all));
      setTxList((prev) => [...prev, blockchainTX]);

      return;
    }
    all[tx] = [blockchainTX]
    window.localStorage.setItem("BLOCKCHAIN_TXS", JSON.stringify(all));
    setTxList((prev) => [...prev, blockchainTX]);
  };

  const addCustomNetwork = async (chainId, chainName, rpcUrls, symbol, decimals) => {
    console.log(chainId)

    const newChain = {
      chainId,
      chainName,
      rpcUrls,
      nativeCurrency: {
        name: symbol,
        symbol,
        decimals
      }
    };
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [newChain]
      });
    } catch (error) {
      console.error(error);
    }
  } 

  const handleAddCustomNetwork = () => {
    // convert input to decimal chainId
    const chainId = `0x${parseInt(blockChainState.chainID, 10).toString(16)}`;
    addCustomNetwork(chainId, blockChainState.chainName, ["https://subnets.avax.network/defi-kingdoms/dfk-chain-testnet/rpc"], "AVAX", 18);
  }

  return (
    <div>
      <div className="w-5/12 mx-auto mt-10 ">
        <div>
          <h1 className="text font-bold mb-6"> Subnet ID {tx}</h1>
          <div className="w-full">
            <div className="w-full flex gap-5 items-center mb-2">
              <h1 className="w-3/12 text-left text-lg">Chain Name</h1>
              <div className="w-full">
                <Input
                  placeholder={"Chain Name"}
                  onChange={(val) =>
                    setBlockChainState((prev) => ({ ...prev, chainName: val }))
                  }
                  value={blockChainState.chainName}
                />
              </div>
            </div>
            <div className="w-full flex gap-5 items-center mb-2">
              <h1 className="w-3/12 text-lg text-left">Chain ID</h1>
              <div className="w-full">
                <Input
                  placeholder={"Chain ID"}
                  onChange={(val) =>
                    setBlockChainState((prev) => ({ ...prev, chainID: val }))
                  }
                  type={"number"}
                  value={blockChainState.chainID}
                />
              </div>
            </div>
            
            <div className="w-full flex gap-5 items-center mb-2">
              <h1 className="w-3/12 text-lg text-left">Fees</h1>
              <div className="w-full">
                <Radio
                  name={"fees-rate"}
                  options={[
                    {
                      title: "high",
                      value: "high",
                      id: "fees-high",
                    },
                    {
                      title: "medium",
                      value: "medium",
                      id: "fees-medium",
                    },
                    {
                      title: "low",
                      value: "low",
                      id: "fees-low",
                    },
                  ]}
                  onChange={(val) => {
                    setBlockChainState((prev) => ({ ...prev, feesRate: val }));
                  }}
                  isInline={true}
                  value={blockChainState.feesRate}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-10">
              <div className="w-full flex gap-5 items-center">
                <h1 className="w-4/12 text-lg text-left">Fund Distribution</h1>

                <div className="w-full flex gap-4 items-center">
                  <div className="w-1/2">
                    <FileInput
                      setFiles={setInputFiles}
                      id={"fundDistribution"}
                      label={"Select CSV file"}
                    />
                  </div>
                  <Input placeholder={"address"} />
                </div>
              </div>
              <div className="w-full flex gap-5 items-center">
                <h1 className="w-4/12 text-lg text-left">Deployer Admin</h1>

                <div className="w-full flex gap-4 items-center">
                  <div className="w-1/2">
                    <FileInput
                      setFiles={setInputFiles}
                      label={"Select TXT file"}
                      id={"deployerAdmin"}
                    />
                  </div>
                  <Input placeholder={"address"} />
                </div>
              </div>
              <div className="w-full flex gap-5 items-center">
                <h1 className="w-4/12 text-lg text-left">Deployer Enabled</h1>

                <div className="w-full flex gap-4 items-center">
                  <div className="w-1/2">
                    <FileInput
                      setFiles={setInputFiles}
                      label={"Select TXT file"}
                      id={"deployerEnabled"}
                    />
                  </div>
                  <Input placeholder={"address"} />
                </div>
              </div>
              <div className="w-full flex gap-5 items-center">
                <h1 className="w-4/12 text-lg text-left">tx Admin</h1>
                <div className="w-full flex gap-4 items-center">
                  <div className="w-1/2">
                    <FileInput
                      setFiles={setInputFiles}
                      label={"Select TXT file"}
                      id={"txAdmin"}
                    />
                  </div>
                  <Input placeholder={"address"} />
                </div>
              </div>
              <div className="w-full flex gap-5 items-center">
                <h1 className="w-4/12 text-lg text-left">tx Enabled</h1>
                <div className="w-full flex gap-4 items-center">
                  <div className="w-1/2">
                    <FileInput
                      setFiles={setInputFiles}
                      label={"Select TXT file"}
                      id={"txEnabled"}
                    />
                  </div>
                  <Input placeholder={"address"} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded mt-10" onClick={handleCreateBlockChain} >Create Blockchain</button>
      </div>

      <div className="w-5/12 mx-auto mt-10">

        {txList.map(tx=><BlockchainTxContainer tx={tx}  key={tx}/>)}
        <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4" onClick={handleAddCustomNetwork} >Add Custom Network</button>
      </div>

    </div>
  );
};

export default SubnetBlockchain;

/* 

            <div className="w-full flex gap-5 items-center mb-2">
              <h1 className="w-3/12 text-left text-lg">Token Symbol</h1>
              <div className="w-full">
                <Input
                  placeholder={"Token Symbol"}
                  onChange={(val) =>
                    setBlockChainState((prev) => ({ ...prev, tokenSymbol: val }))
                  }
                  value={blockChainState.tokenSymbol}
                />
              </div>
            </div>
                        <div className="w-full flex gap-5 items-center mb-2">
              <h1 className="w-3/12 text-left text-lg">RPCURL</h1>
              <div className="w-full">
                <Input
                  placeholder={"RPC URL"}
                  onChange={(val) =>
                    setBlockChainState((prev) => ({ ...prev, rpcurl: val }))
                  }
                  value={blockChainState.rpcurl}
                />
              </div>
            </div>
*/
