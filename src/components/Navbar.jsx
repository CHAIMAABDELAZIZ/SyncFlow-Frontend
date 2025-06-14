import React from 'react';
import { Search, Plus, MessageSquare, Bell } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="h-16 border-b bg-white border-gray-200 px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="relative w-90  ">
      </div>

      <div className="relative w-[800px]  ">
        <div className="absolute inset-y-0  left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5  text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="pl-10  bg-gray-50 border-orangePtrm pr-4 py-2 w-full border  rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        <button className="p-2 bg-orange-500 text-white rounded-lg">
          <Plus size={18} />
        </button>
        <button className="p-2 bg-orange-500 text-white hover:text-gray-600">
          <MessageSquare size={18} />
        </button>
        <button className="p-2 bg-orange-500 text-white hover:text-gray-600">
          <Bell size={18} />
        </button>
        <div className="flex items-center ml-4">
          <div className="h-10 w-10 rounded-lg bg-gray-200 overflow-hidden">
            <img
              src="chaima.jpeg"
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Chaima Abdelaziz</p>
            <p className="text-xs text-gray-500">lc_abdelaziz@esi.dz</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;