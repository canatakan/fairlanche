import React from "react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <div className="p-6 bg-gray-800 text-white">
      <div className="container mx-auto">
        <div className="flex justify-between">
          <div className="flex space-x-6">
            <div className="flex items-center">
              <img className="block h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Workflow" />
            </div>
              <div className="flex space-x-4">
                <Link to="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link to="/manage" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Manage
                </Link>
                <Link to="/transact" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Transact
                </Link>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;