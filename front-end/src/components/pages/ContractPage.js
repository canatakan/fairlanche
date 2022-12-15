import React from 'react';
import { useParams } from "react-router-dom";

import { ethers } from "ethers";

import Collapsible from '../Collapsible';

function withParams(Component) {
  return props => <Component {...props} params={useParams()} />;
}

class ContractPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      contractAddresses: [],
    };
  }

  componentDidMount() {
    const contractAddresses = JSON.parse(localStorage.getItem('contractAddresses')) || [];
    this.setState({ contractAddresses });
  }

  saveContractAddress = (event) => {
    event.preventDefault();
    if (!this.verifyContractAddress(event)) {
      return;
    }
    const contractAddress = event.target.elements.contractAddress.value;
    const contractAddresses = [...this.state.contractAddresses, contractAddress];
    this.setState({ contractAddresses });
    localStorage.setItem('contractAddresses', JSON.stringify(contractAddresses));
  }

  verifyContractAddress = (event) => {
    event.preventDefault();
    const contractAddress = event.target.elements.contractAddress.value;

    if (this.state.contractAddresses.includes(contractAddress)) {
      alert('Duplicate contract address');
      return false;
    }

    if (!ethers.utils.isAddress(contractAddress)) {
      alert('Invalid contract address');
      return false;
    }

    return true;
  }

  removeContractAddress = (contractAddress) => {
    const contractAddresses = this.state.contractAddresses.filter((address) => address !== contractAddress);
    this.setState({ contractAddresses });
    localStorage.setItem('contractAddresses', JSON.stringify(contractAddresses));
  }

  render() {
    return (
      <div>
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold mb-2 mt-4">Contract Page {this.props.params.id}</h1>
        </div>
        <div className="form">
          <form onSubmit={this.saveContractAddress}>
            <input type="text" name="contractAddress" placeholder='Contract Address' />
            <button className='mt-1 mb-2'>Save</button>
          </form>
        </div>
        <ul>
          {this.state.contractAddresses.map((contractAddress) => (
            <div className='border-2 border-black'>
              <Collapsible
                open
                title=
                <div className='flex flex-row items-center justify-center'>
                  <a href={`https://testnet.snowtrace.io/address/${contractAddress}`} target="_blank" rel="noopener noreferrer">
                    {<div className='text-xl font-bold text-center mb-2 hover:text-blue-600 focus:text-blue-600'>{contractAddress}</div>
                    }
                  </a>
                </div>
              >
                <div className='flex flex-col items-center justify-center'>

                  <div className='flex flex-row items-center justify-center p-2'>
                    <input type="number" name="volume" placeholder='Volume' />
                    <button>
                      demand
                    </button>
                  </div>
                  <div className='flex flex-row items-center justify-center p-2'>
                    <input type="number" name="epochNumber" placeholder='Epoch Number' />
                    <button>
                      claim
                    </button>
                  </div>
                  <div className='flex flex-row items-center justify-center p-2'>
                    <button>
                      claimAll
                    </button>
                  </div>
                  <button onClick={() => this.removeContractAddress(contractAddress)}>
                    Remove Contract
                  </button>
                </div>
              </Collapsible>
            </div>
          ))}
        </ul>
      </div>
    );
  }
}

export default withParams(ContractPage);