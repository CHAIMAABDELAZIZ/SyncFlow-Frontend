import React, { useEffect, useState } from 'react';
import { Search, User } from 'lucide-react';

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="h-16 border-b bg-white border-gray-200 px-8 flex items-center justify-between">
      <div className="relative w-[800px]">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="pl-10 bg-gray-50 border-orangePtrm pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Affichage user */}
      {user && (
        <div className="flex items-center space-x-4 ml-4">
          <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
            <User className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">{user.nom}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
