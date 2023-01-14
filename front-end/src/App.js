import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './components/pages/Home';
import Transaction from './components/pages/TransactionPage';
import Deployment from './components/pages/DeploymentPage';
import Management from './components/pages/ManagementPage';
import ManageSubnet from './components/pages/SubnetManagementPage';
import ContractPage from './components/pages/ContractTransactionPage';
import SubnetBlockchain from './components/pages/SubnetBlockchain';

function App() {

  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transact" element={<Transaction />} />
        <Route path="/transact/:id" element={<ContractPage/>}/>
        <Route path="/deploy" element={<Deployment />} />
        <Route path="/deploy/:tx" element={<SubnetBlockchain />} />
        <Route path="/manage" element={<Management />} />
        <Route path="/manage/:id" element={<ManageSubnet />} />
      
      </Routes>
    </div>
  );
}

export default App;
