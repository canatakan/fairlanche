import React from 'react';

import Collapsible from '../Collapsible';

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
    const contractAddress = event.target.elements.contractAddress.value;
    const contractAddresses = [...this.state.contractAddresses, contractAddress];
    this.setState({ contractAddresses });
    localStorage.setItem('contractAddresses', JSON.stringify(contractAddresses));
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
          <h1 className="text-3xl font-bold">Contract Interaction Page</h1>
        </div>
        <div className="form">
          <form onSubmit={this.saveContractAddress}>
            <input type="text" name="contractAddress" placeholder='Contract Address'/>
            <button >Save</button>
          </form>
        </div>
        <ul>
          {this.state.contractAddresses.map((contractAddress) => (
             <div className='border-2 border-black'>
              <Collapsible
             open
             title=<div className='text-xl font-bold text-center mb-2 hover:text-blue-600 focus:text-blue-600'>{contractAddress}</div>
           >
              <div className='flex flex-col items-center justify-center'>
                
                <div className='flex flex-row items-center justify-center p-2'>
                <input type="number" name="volume" placeholder='Volume'/>
                <button>
                  demand
                </button>
                </div>
                <div className='flex flex-row items-center justify-center p-2'>
                <input type="number" name="epochNumber" placeholder='Epoch Number'/>
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

export default ContractPage;