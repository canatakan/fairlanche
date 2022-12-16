import React, { Component } from 'react';

export default class subnetData extends Component {
  subnetData;
  distributionData;

  constructor(props) {
    super(props);
    this.onChangeNodeId = this.onChangeNodeId.bind(this);
    this.onChangeSubnetName = this.onChangeSubnetName.bind(this);
    this.onChangeSubnetId = this.onChangeSubnetId.bind(this);
    this.onChangeTokenSymbol = this.onChangeTokenSymbol.bind(this);
    this.onChangePermissionedAddresses = this.onChangePermissionedAddresses.bind(this);
    this.onChangeEpochCapacity = this.onChangeEpochCapacity.bind(this);
    this.onChangeEpochDuration = this.onChangeEpochDuration.bind(this);
    this.onChangeMechanism = this.onChangeMechanism.bind(this);
    this.onChangeFeeRate = this.onChangeFeeRate.bind(this);
    this.onChangeMaxDemandVolume = this.onChangeMaxDemandVolume.bind(this);
    this.onChangeTotalDistribution = this.onChangeTotalDistribution.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

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

  onChangeSubnetId(e) {
    this.setState({ subnetId: e.target.value })
  }
  onChangeSubnetName(e) {
    this.setState({ subnetName: e.target.value })
  }
  onChangeTokenSymbol(e) {
    this.setState({ tokenSymbol: e.target.value })
  }
  onChangeNodeId(e) {
    this.setState({ fullyBootstrappedNodeId: e.target.value })
  }
  onChangePermissionedAddresses(e) {
    this.setState({ permissionedAddresses: e.target.value })
  }
  onChangeFeeRate(e) {
    this.setState({ feeRate: e.target.value })
  }
  onChangeEpochCapacity(e) {
    this.setState({ epochCapacity: e.target.value })
  }
  onChangeEpochDuration(e) {
    this.setState({ epochDuration: e.target.value })
  }
  onChangeMechanism(e) {
    this.setState({ mechanism: e.target.value })
  }
  onChangeMaxDemandVolume(e) {
    this.setState({ maxDemandVolume: e.target.value })
  }
  onChangeTotalDistribution(e) {
    this.setState({ totalDistribution: e.target.value })
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

  // Life Cycle
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

  componentDidUpdate(prevProps, prevState) {
    if (prevState.subnetData !== this.state.subnetData) {
      localStorage.setItem('subnetData', JSON.stringify(this.state.subnetData));
    }
    if (prevState.distributionData !== this.state.distributionData) {
      localStorage.setItem('distributionData', JSON.stringify(this.state.distributionData));
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
              <label className="text-gray-500 text-sm font-bold mb-2" htmlFor="subnetId">
                  SUBNET ID
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="subnetId"
                  type="string"
                  placeholder="Enter your subnet's ChainId. It can be any positive integer."
                  value={this.state.subnetId}
                  onChange={this.onChangeSubnetId} />
              </div>
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
                  onChange={this.onChangeSubnetName} />
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
                  onChange={this.onChangeTokenSymbol} />
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
                  onChange={this.onChangeNodeId} />
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
                  onChange={this.onChangePermissionedAddresses} />
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
                    onChange={this.onChangeFeeRate}>
                    <option>Low Fee Rate</option>
                    <option>Medium Fee Rate</option>
                    <option>High Fee Rate</option>
                  </select>
                </div>
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
                  onChange={this.onChangeTotalDistribution} />
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
                  onChange={this.onChangeEpochCapacity} />
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
                  onChange={this.onChangeEpochDuration} />
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
                    onChange={this.onChangeMechanism} >
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
                  onChange={this.onChangeMaxDemandVolume} />
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


