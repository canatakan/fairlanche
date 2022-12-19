import React, { Component } from 'react';

export default class subnetData extends Component {
  subnetData;
  distributionData;

  constructor(props) {
    super(props);

    this.state = {
      subnetData: {
        nodeId: "",
        subnetId: "",
        subnetName: "",
        tokenSymbol: "",
        permissionedAddresses: [],
        feeRate: "",
      },
      distributionData: {
        mechanism: "",
        totalDistribution: "",
        epochCapacity: "",
        epochDuration: "",
        maxDemandVolume: "",
      }
    }
  }

  onSubmit(e) {
    e.preventDefault()
    this.setState({
      subnetData: {
        subnetId: this.state.subnetId,
        subnetName: this.state.subnetName,
        tokenSymbol: this.state.tokenSymbol,
        fullyBootstrappedNodeId: this.state.fullyBootstrappedNodeId,
        permissionedAddresses: this.state.permissionedAddresses,
        feeRate: this.state.feeRate,
      },
      distributionData: {
        epochCapacity: this.state.epochCapacity,
        epochDuration: this.state.epochDuration,
        mechanism: this.state.mechanism,
        maxDemandVolume: this.state.maxDemandVolume,
        totalDistribution: this.state.totalDistribution,
      }
    }, () => {
      localStorage.setItem('subnetData', JSON.stringify(this.state.subnetData));
      localStorage.setItem('distributionData', JSON.stringify(this.state.distributionData));
    })
  }

  componentDidMount() {
    const subnetData = JSON.parse(localStorage.getItem('subnetData'));
    const distributionData = JSON.parse(localStorage.getItem('distributionData'));
    if (subnetData) {
      this.setState({ subnetData });
    }
    if (distributionData) {
      this.setState({ distributionData });
    }
  }

  render() {
    return (
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="flex justify-center">
              <h1 className="text-3xl font-bold text-center mb-2 mt-4">Deployment Page</h1>
            </div>
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={this.onSubmit}>
              <div className="mb-4">
                <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="subnetName">
                  SUBNET NAME
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="subnetName"
                  type="text"
                  placeholder="Give your subnet a name."
                  value={this.state.subnetName}
                />
              </div>
              <div className="mb-4">
                <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="subnetId">
                  CHAIN ID
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="subnetId"
                  type="string"
                  placeholder="Enter your subnet's ChainId. It can be any positive integer."
                  value={this.state.subnetId}
                />
              </div>
              <div className="mb-4">
                <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="fullyBootstrappedNodeId">
                  NODE ID
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="fullyBootstrappedNodeId"
                  type="text"
                  placeholder="Enter your fully bootstrapped Node ID."
                  value={this.state.fullyBootstrappedNodeId}
                />
              </div>
              <div className="mb-4">
                <div className="relative">
                  <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="feeRate">
                    FEE RATE
                  </label>
                  <select
                    // fix: Design change
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="feeRate"
                    value={this.state.feeRate}
                  >
                    <option>Low Fee Rate</option>
                    <option>Medium Fee Rate</option>
                    <option>High Fee Rate</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="permissionedAddresses">
                  PERMISSIONED ADDRESSES
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="permissionedAddresses"
                  type="file"
                  // fix: buttonText="Permissioned Addresses"
                  placeholder="Select a .txt file including permissioned addresses."
                  value={this.state.permissionedAddresses}
                />
              </div>
              <div className="mb-4">
                <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="tokenSymbol">
                  TOKEN SYMBOL
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="tokenSymbol"
                  type="text"
                  placeholder="Select a symbol for your subnet's native token."
                  value={this.state.tokenSymbol}
                />
              </div>
              <div className="mb-4">
                <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="totalDistribution">
                  TOTAL DISTRIBUTION
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="totalDistribution"
                  type="number"
                  placeholder="Enter the amount of tokens to be distributed."
                  value={this.state.totalDistribution}
                />
              </div>
              <div className="mb-4">
                <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="epochCapacity">
                  EPOCH CAPACITY
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="epochCapacity"
                  type="number"
                  placeholder="Enter epoch capacity."
                  value={this.state.epochCapacity}
                />
              </div>
              <div className="mb-4">
                <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="epochDuration">
                  EPOCH DURATION
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="epochDuration"
                  type="number"
                  placeholder="Enter epoch duration."
                  value={this.state.epochDuration}
                />
              </div>
              <div className="mb-4">
                <div className="relative">
                  <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="mechanism">
                    DISTRIBUTION MECHANISM
                  </label>
                  <select
                    // fix: Before selection, there should write "Distribution Mechanism"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="mechanism"
                    value={this.state.mechanism}
                  >
                    <option>AMF</option>
                    <option>SMF</option>
                    <option>QMF</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="maxDemandVolume">
                  MAX DEMAND VOLUME
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="maxDemandVolume"
                  type="number"
                  placeholder='Enter maximum demand volume that a user can request.'
                  value={this.state.maxDemandVolume}
                />
              </div>
              <div className="mb-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit">
                  Deploy Subnet
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}


