import React from 'react';
import { useParams } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from '@fortawesome/fontawesome-free-solid';
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
    this.blockchainExists = true;

    const subnets = JSON.parse(localStorage.getItem('subnets'));
    if (!subnets) {
      this.blockchainExists = false;
    }
    if (!subnets.find(subnet => subnet.blockchainId === this.props.params.id)) {
      this.blockchainExists = false;
    }
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
    
    if (!this.blockchainExists) {
      return (
        <div className='flex flex-col items-center'>
          <div className="flex justify-center">
            <h1 className="text-3xl font-bold mb-2 mt-4">Contract Page</h1>
          </div>
          <div className='flex flex-col items-center'>
            <h2 className='text-xl font-bold mb-2'>No such blockchain exists</h2>
            <a href='/'>Go back to home page</a>
          </div>
        </div>
      );
    }

    return (
      <div className='flex flex-col items-center'>
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold mb-2 mt-4">Contract Page</h1>
        </div>
        <form onSubmit={this.saveContractAddress}>
          <input type="text" name="contractAddress" placeholder='Contract Address' />
          <button className='mt-1 mb-4'>Add Contract</button>
        </form>
        <ul>
          {this.state.contractAddresses.map((contractAddress) => (
            <div className='mb-6 border-2 border-gray-300 mb-2 rounded-xl'>
              <Collapsible
                open
                title=
                <div className='flex flex-row items-center justify-center'>
                  <a href={`https://testnet.snowtrace.io/address/${contractAddress}`} target="_blank" rel="noopener noreferrer">
                    {<div className='text-l font-bold text-center hover:text-blue-600 focus:text-blue-600'>{contractAddress}</div>
                    }
                  </a>
                </div>
                item= <div className="btn p-2 hover:bg-gray-200 rounded font-weight-bold text-center"
                  onClick={() => {
                    if (window.confirm('Are you sure you wish to remove this contract?'))
                      this.removeContractAddress(contractAddress)
                  }
                  }>
                    <FontAwesomeIcon icon={faTrash} />
                  </div>
              >
                <div className='flex flex-col items-end justify-end'>
                  <div className='flex flex-row items-center justify-center mb-1'>
                    <input className='w-28' type="number" name="volume" placeholder='vol' />
                    <button className='w-24'>
                      demand
                    </button>
                  </div>
                  <div className='flex flex-row items-center justify-center mb-1'>
                    <input className='w-28' type="number" name="epochNumber" placeholder='epoch' />
                    <button className='w-24'>
                      claim
                    </button>
                  </div>
                  <div className='flex flex-row items-center justify-center mb-1'>
                  <button className='w-24'>
                      claimAll
                    </button>
                  </div>
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