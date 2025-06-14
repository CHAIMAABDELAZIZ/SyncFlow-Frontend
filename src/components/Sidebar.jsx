import React from 'react';
import { Home, BarChart2, FileText, Users, Settings, HelpCircle, LogOut, List, Bell } from 'lucide-react';
import top from '../assets/top.png';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path) => {
        navigate(path);
    };

    // Check if current path matches the button path
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Get button classes based on active state
    const getButtonClasses = (path) => {
        const baseClasses = "p-3 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300";

        if (isActive(path)) {
            return `${baseClasses} bg-orange-500 text-white shadow-lg`;
        }

        return `${baseClasses} bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 border border-transparent hover:border-orange-200`;
    };

    const navigationItems = [
        { path: '/home', icon: Home, label: 'Home' },
        { path: '/dashboard', icon: List, label: 'Dashboard' },
        { path: '/reports', icon: FileText, label: 'Reports' },
        { path: '/alerts', icon: Bell, label: 'Alerts' },
        { path: '/engineers', icon: Users, label: 'Engineers' }
    ];

    const bottomItems = [
        { icon: Settings, label: 'Settings', onClick: () => console.log('Settings clicked') },
        { icon: HelpCircle, label: 'Help', onClick: () => console.log('Help clicked') },
        { icon: LogOut, label: 'Logout', onClick: () => console.log('Logout clicked') }
    ];

    return (
        <div className="w-20 h-full bg-white border-r border-gray-200 flex flex-col items-center py-6 shadow-sm">
            {/* Logo */}
            <div className="mb-8 group">
                <img
                    src={top}
                    alt="Petrium Logo"
                    className="h-14 sm:h-16 object-contain transition-transform duration-200 group-hover:scale-105"
                />
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col items-center space-y-4 flex-1">
                {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={getButtonClasses(item.path)}
                            title={item.label}
                            aria-label={item.label}
                        >
                            <IconComponent size={20} />
                        </button>
                    );
                })}
            </div>

            {/* Bottom Icons */}
            <div className="flex flex-col items-center space-y-4 mt-auto">
                {bottomItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                        <button
                            key={index}
                            onClick={item.onClick}
                            className="p-3 bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 rounded-lg border border-transparent hover:border-orange-200 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300"
                            title={item.label}
                            aria-label={item.label}
                        >
                            <IconComponent size={20} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Sidebar;