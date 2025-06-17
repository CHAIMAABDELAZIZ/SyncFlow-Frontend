import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddUser = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    const roles = ['Engineer', 'Manager', 'Viewer', 'Admin', 'Supervisor'];

    const handleSubmit = async () => {
        if (firstName && lastName && email && role) {
            try {
                const response = await fetch('http://localhost:8080/api/utilisateurs/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nom: lastName,
                        prenom: firstName,
                        email: email,
                        password: '1234',
                        role: role.toLowerCase(),
                    }),
                });

                if (response.ok) {
                    setNotification({
                        show: true,
                        type: 'success',
                        message: 'Utilisateur ajouté avec succès !'
                    });
                    setTimeout(() => {
                        setNotification({ show: false, type: '', message: '' });
                        navigate('/engineers');
                    }, 3000);
                } else {
                    const errorData = await response.json();
                    setNotification({
                        show: true,
                        type: 'error',
                        message: errorData.message || "Erreur lors de l'ajout de l'utilisateur"
                    });
                    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
                }
            } catch (error) {
                setNotification({
                    show: true,
                    type: 'error',
                    message: "Erreur de connexion au serveur"
                });
                setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
            }
        } else {
            setNotification({
                show: true,
                type: 'error',
                message: 'Veuillez remplir tous les champs obligatoires'
            });
            setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
        }
    };

    return (
        <div className="relative">
            {notification.show && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" clipRule="evenodd" d={notification.type === 'success'
                                ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                : "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"} />
                        </svg>
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                <div className="flex items-center">
                    <button className="text-orange-500 mr-2 bg-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add Engineer</h1>
                        <p className="text-gray-500">Ajouter un ingénieur avec ses détails</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow-lg w-[80vw]">
                    <div className="col-span-2 flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <button className="absolute bottom-0 right-0 bg-white border-orangePtrm text-orangePtrm hover:border-orangePtrm rounded-full w-8 h-8 flex items-center justify-center">
                                <span className="text-xl font-bold">+</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">First Name</label>
                        <input
                            type="text"
                            placeholder="Enter Engineer's first name..."
                            className="bg-white text-black placeholder-gray-400 w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter Engineer's email..."
                            className="bg-white text-black placeholder-gray-400 w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Last Name</label>
                        <input
                            type="text"
                            placeholder="Enter Engineer's last name..."
                            className="bg-white text-black placeholder-gray-400 w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Role</label>
                        <select
                            className="bg-white text-black placeholder-gray-400 w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="">Role</option>
                            {roles.map((roleName, index) => (
                                <option key={index} value={roleName}>{roleName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2 flex justify-end mt-6 space-x-4">
                        <button
                            className="px-6 py-3 border-orange-500 bg-white hover:bg-orange-500 text-orange-500 hover:text-white rounded-md font-medium transition-colors duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-3 border-orange-500 bg-white hover:bg-orange-500 text-orange-500 hover:text-white rounded-md font-medium transition-colors duration-300"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddUser;
