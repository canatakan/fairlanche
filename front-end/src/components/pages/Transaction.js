import React from 'react';

import Collapsible from '../Collapsible';

class TransactionPage extends React.Component {

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
          <h1 className="text-3xl font-bold">Transaction Page</h1>
        </div>
        <div className="form">
          <form onSubmit={this.saveContractAddress}>
            <input type="text" name="contractAddress" placeholder='Contract Address'/>
            <button type="submit">Save</button>
          </form>
        </div>
        <ul>
          {this.state.contractAddresses.map((contractAddress) => (
             <div className='border-2 border-black'>
              <Collapsible
             open
             title=<div className='text-xl font-bold'>{contractAddress}</div>
           >
              <div className='flex flex-col items-center justify-center'>
                <button type="button">
                  <input type="number" name="volume" placeholder='Volume'/>
                  demand
                </button>
                <br></br>
                <button type="button">
                  <input type="number" name="epochNumber" placeholder='Epoch Number'/>
                  claim
                </button>
                <br></br>
                <button type="button">
                  claimAll
                </button>
                <br></br>
                <button type="button" onClick={() => this.removeContractAddress(contractAddress)}>
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

export default TransactionPage;