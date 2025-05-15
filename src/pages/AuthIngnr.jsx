import React, { useState } from 'react';
import { IoMdPerson, IoMdLock } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from '../assets/logo.png';
import './AuthIngnr.css'; // Import the new CSS file*
import { useNavigate } from 'react-router-dom';


function AuthIngnr() {
    const navigate = useNavigate();
    const [role, setRole] = useState('manager'); // 'manager' or 'wellengineer'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isFocusedmdp, setIsFocusedmdp] = useState(false);
    const [error, setError] = useState('');

    // Demo user data
    const demoUsers = {
        manager: {
            'admin': 'admin123',
            'manager1': 'manager123'
        },
        wellengineer: {
            'engineer1': 'engineer123',
            'tech1': 'tech123'
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        
        // Demo validation
        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }
        
        const roleUsers = demoUsers[role];
        if (roleUsers && roleUsers[username] === password) {
            // Successful login
            console.log('Login successful', { role, username });
            navigate('/home');
        } else {
            // Failed login
            const roleName = role === 'manager' ? 'Well Operations Manager' : 'Well Operations Engineer';
            setError(`Incorrect username, password, or ${roleName}'s role . Please contact the administrator.`);
        }
    };

    return (
        <div className="auth-container  ">
            <div className="bg-whitePtrm p-6 sm:p-8 shadow-lg w-full max-w-md rounded-lg">
            {/* Logo + Title */}
                <div className="flex flex-col items-center">
                    <img src={logo} alt="Petrium Logo" className="h-14 sm:h-16 object-contain" />
                    <p className="text-sm text-bgblue mt-4 sm:mt-6 text-center">
                        Connect to your account to continue
                    </p>
                </div>
                
                
                {/* Role Toggle */}
                <div className="flex justify-center my-4 sm:my-6 gap-[1px]">
                    <button
                        onClick={() => setRole('manager')}
                        className={`p-2 sm:p-3 text-xs sm:text-sm font-medium rounded-r-none ${
                            role === 'manager'
                                ? 'bg-orangePtrm text-white focus:outline-none' 
                                : 'bg-whitePtrm border-[2px] border-bgblue text-bgblue hover:border-orangePtrm'
                        }`}
                    >
                        Well Operations Manager
                    </button>
                    <button
                        onClick={() => setRole('wellengineer')}
                        className={`p-2 sm:p-3 text-xs sm:text-sm font-medium rounded-l-none ${
                            role === 'wellengineer'
                                ? 'bg-orangePtrm text-white focus:outline-none'
                                : 'bg-whitePtrm border-[2px] border-bgblue text-bgblue hover:border-orangePtrm'
                        }`}
                    >
                        Well Operations Engineer 
                    </button>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className={`${error ? 'space-y-1' : 'space-y-3 sm:space-y-4'}`}>
                    {/* Username */} 
                    <div>
                        <label className={`text-sm font-medium text-start mb-1 block transition-colors duration-200 ${
                            isFocused || username ? 'text-orange-500' : 'text-bgblue'}`}>
                            Nom d'utilisateur
                        </label>
                        <div className={`flex items-center border rounded-lg bg-white px-2 ${
                            isFocused ? 'border-orangePtrm' : 'border'}`}>
                            <span className={`transition-colors duration-200 pr-2 ${
                                isFocused || username ? 'text-orangePtrm' : 'text-bgblue'}`}> 
                                <IoMdPerson />
                            </span>
                            <input
                                type="text"
                                className="w-full text-bgblue bg-inherit py-2 pl-2 focus:outline-none"
                                value={username}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            {username && (
                                <button type="button" onClick={() => setUsername('')} className="text-gray-400 bg-inherit hover:border-none focus:border-none focus:outline-none">
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Password */}
                    <div className={`${error ? '' : 'pb-5 '}`}>
                        <label className={`text-sm font-medium text-start mb-1 block transition-colors duration-200 ${
                            isFocusedmdp || password ? 'text-orange-500' : 'text-bgblue'}`}>
                            Mot de passe
                        </label>
                        <div className={`flex items-center border rounded-lg bg-white px-2 ${
                            isFocusedmdp ? 'border-orangePtrm' : 'border'}`}>
                            <span className={`transition-colors duration-200 pr-2 ${
                                isFocusedmdp || password ? 'text-orangePtrm' : 'text-bgblue'}`}> 
                                <IoMdLock />
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full mr-1 bg-inherit text-bgblue py-2 pl-2 focus:outline-none"
                                value={password}
                                onFocus={() => setIsFocusedmdp(true)}
                                onBlur={() => setIsFocusedmdp(false)}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 bg-inherit rounded-none hover:border-none focus:border-none focus:outline-none"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    
                    {/* Error message */}
                    {error && (
                        <div className="text-red-500 text-sm text-center pb-1">
                            {error}
                        </div>
                    )}
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-2 rounded-lg border border-transparent bg-orangePtrm text-white font-semibold
                        hover:bg-white hover:text-orangePtrm hover:border-orangePtrm
                        focus:outline-none focus:ring-2 focus:ring-orangePtrm
                        active:scale-95 transition-all duration-200 ease-in-out"
                    >
                        Access
                    </button>
                </form>

            </div>
        </div>
    )
}

export default AuthIngnr;