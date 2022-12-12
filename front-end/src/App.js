import React from 'react';
import './App.css';

import { Route, Routes } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './components/pages/Home';
import ManagementPage from './components/pages/ManagementPage';
import TransactionPage from './components/pages/TransactionPage';

function App() {
  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manage" element={<ManagementPage />} />
        <Route path="/transact" element={<TransactionPage />} />
      </Routes>
    </div>
  );
}

export default App;
