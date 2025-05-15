import React from 'react';
import { Home, BarChart2, FileText, Users, Settings, HelpCircle, LogOut } from 'lucide-react';
import top from '../assets/top.png';
import { useNavigate } from 'react-router-dom';


const Sidebar = () => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };
    return (
        <div className="w-20 h-full bg-white border-r border-gray-200 flex flex-col items-center py-6">
            {/* Logo */}
            <div className="mb-8">
                <img src={top} alt="Petrium Logo" className="h-14 sm:h-16 object-contain" />
            </div>
            

            {/* Navigation Items */}
            <div className="flex flex-col items-center space-y-8 flex-1">
                <button onClick={() => handleNavigation('/home')} className="p-3 bg-orange-50 rounded-lg text-orange-500 hover:border-orangePtrm" >
                    <Home size={20} />
                    
                </button>
                <button onClick={() => handleNavigation('/dashboard')} className="p-3 bg-white text-gray-800 hover:text-orange-500 hover:border-orangePtrm">
                    <BarChart2 size={20} />
                    
                </button>
                <button className="p-3 bg-white text-gray-800 hover:text-orange-500 hover:border-orangePtrm">
                    <FileText size={20} />
                </button>
                <button onClick={() => handleNavigation('/alerts')} className="p-3 bg-white text-gray-800 hover:text-orange-500 hover:border-orangePtrm">
                    <Users size={20} />
                </button>
                <button onClick={() => handleNavigation('/engineers')} className="p-3 bg-white text-gray-800 hover:text-orange-500 hover:border-orangePtrm">
                    <Users size={20} />
                </button>
            </div>

            {/* Bottom Icons */}
            <div className="flex flex-col items-center space-y-6 mt-auto">
                <button className="p-3 bg-white text-gray-800 hover:text-orange-500 hover:border-orangePtrm">
                    <Settings size={20} />
                </button>
                <button className="p-3 bg-white text-gray-800 hover:text-orange-500 hover:border-orangePtrm">
                    <HelpCircle size={20} />
                </button>
                <button className="p-3 bg-white text-gray-800 hover:text-orange-500 hover:border-orangePtrm">
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;