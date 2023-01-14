import React from "react";
import { Link } from "react-router-dom";

import logo from '../img/fairlanche-logos/original-on-transparent.png'
import WalletConnector from "./WalletConnector";

function NavBar() {
  return (
    <div className="p-6 bg-gray-800 text-white">
      <div className="container mx-auto">
        <div className="flex justify-between">
          <div className="flex space-x-6">
            <div className="flex items-center">
              <Link to="/">
              <img 
              className="block h-8 w-auto" src={logo} alt="fairlanche" 
              />
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link to="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-3 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link to="/transact" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-3 rounded-md text-sm font-medium">
                Transact
              </Link>
              <Link to="/deploy" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-3 rounded-md text-sm font-medium">
                Deploy
              </Link>
              <Link to="/manage" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-3 rounded-md text-sm font-medium">
                Manage
              </Link>
            </div>
          </div>
          <div className="flex-1"></div>
          <WalletConnector />
        </div>
      </div>
    </div>
  );
}

export default NavBar;