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
  });

  const { tx } = useParams();
  const bootstrappedNodeId = useQuery().get("bootstrappedNodeId");

  const [txList, setTxList] = useState([]);

  useEffect(() => {
    const all = JSON.parse(window.localStorage.getItem("BLOCKCHAIN_TXS")) ?? {};
    setTxList(all[tx] ?? []);
  }, []);

  const handleCreateBlockChain = () => {
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

  return (
    <div>
      <div className="w-5/12 mx-auto mt-10 ">
        <div>
          <h1 className="text-2xl mb-6">Blockchain of subnet {tx}</h1>
          <div className="w-full">
            <div className="w-full flex gap-5 items-center mb-2">
              <h1 className="w-3/12 text-left text-lg">Chain Name:</h1>
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
              <h1 className="w-3/12 text-lg text-left">Chain ID:</h1>
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
              <h1 className="w-3/12 text-lg text-left">Fees:</h1>
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
              <div className="w-full flex gap-5 items-center ">
                <h1 className="w-4/12 text-lg text-left">Fund Distribution:</h1>

                <div className="w-full flex gap-4 items-center">
                  <div className="w-1/2">
                    <FileInput
                      onChange={(e) => console.log(e)}
                      id={"fund-distribution"}
                      label={"Select CSV file"}
                    />
                  </div>
                  <Input placeholder={"address"} />
                </div>
              </div>
              <div className="w-full flex gap-5 items-center">
                <h1 className="w-4/12 text-lg text-left">Deployer Admin:</h1>

                <div className="w-full flex gap-4 items-center">
                  <div className="w-1/2">
                    <FileInput
                      onChange={(e) => console.log(e)}
                      label={"Select TXT file"}
                      id={"deployer-admin"}
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
                      onChange={(e) => console.log(e)}
                      label={"Select TXT file"}
                      id={"deployer-enabled"}
                    />
                  </div>
                  <Input placeholder={"address"} />
                </div>
              </div>
              <div className="w-full flex gap-5 items-center">
                <h1 className="w-4/12 text-lg text-left">tx Admin:</h1>
                <div className="w-full flex gap-4 items-center">
                  <div className="w-1/2">
                    <FileInput
                      onChange={(e) => console.log(e)}
                      label={"Select TXT file"}
                      id={"tx-admin"}
                    />
                  </div>
                  <Input placeholder={"address"} />
                </div>
              </div>
              <div className="w-full flex gap-5 items-center">
                <h1 className="w-4/12 text-lg text-left">tx Enabled:</h1>
                <div className="w-full flex gap-4 items-center">
                  <div className="w-1/2">
                    <FileInput
                      onChange={(e) => console.log(e)}
                      label={"Select TXT file"}
                      id={"tx-enabled"}
                    />
                  </div>
                  <Input placeholder={"address"} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <button className="mt-4 self-start  " onClick={handleCreateBlockChain}>Create Blockchain</button>
      </div>

      <div className="w-5/12 mx-auto mt-10">

        {txList.map(tx=><BlockchainTxContainer tx={tx}  key={tx}/>)}
        
      </div>
    </div>
  );
};

export default SubnetBlockchain;
