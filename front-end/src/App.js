import React from 'react';
import './App.css';
import { AvalancheTestnet, DAppProvider } from '@usedapp/core';
import { getDefaultProvider } from 'ethers';
import { Route, Routes } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './components/pages/Home';
import Transaction from './components/pages/Transaction';
import Deployment from './components/pages/Deployment';
import Management from './components/pages/Management';
import ContractPage from './components/pages/ContractPage';

function App() {
  const config = {
    networks: [AvalancheTestnet],
    readOnlyChainId: AvalancheTestnet.chainId,
    readOnlyUrls: {
      [AvalancheTestnet.chainId]: AvalancheTestnet.rpcUrl,
    },
  }

  return (

  <DAppProvider config={config}>
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transact" element={<Transaction />} />
        <Route path="/transact/:id" element={<ContractPage/>}/>
        <Route path="/deploy" element={<Deployment />} />
        <Route path="/manage" element={<Management />} />
      </Routes>
    </div>
  </DAppProvider>
  );
}

export default App;
