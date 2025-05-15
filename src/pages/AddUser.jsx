import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const AddUser = () => {
    const navigate = useNavigate();
    // État pour les différents champs du formulaire
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // Liste des rôles
    const roles = ['Engineer', 'Manager', 'Responsable', 'Consultant'];

    // Liste des membres avec leurs rôles
    const [members, setMembers] = useState([
        { id: 1, name: 'Abdelaziz Chaaima', role: 'responsable', email: 'chaima@example.com', permission: 'Owner', avatar: 'AC', guest: false },
        { id: 2, name: 'Kahina Kahina', role: 'ingénieur', email: 'kahina@example.com', permission: 'Editor', avatar: 'KK', guest: false },
        { id: 3, name: 'Adem Abdelaziz', role: 'schlumberger', email: 'adem@gmail.com', permission: 'Member', avatar: 'AA', guest: true }
    ]);

    // Membres sélectionnés pour cet ingénieur (simulé comme un seul pour cet exemple)
    const [selectedMembers, setSelectedMembers] = useState([]);

    // Fonction pour ajouter un membre (non utilisé ici mais conservé pour compatibilité)
    const addMember = () => {
        if (selectedMember && !selectedMembers.some(member => member.id === parseInt(selectedMember))) {
            const memberToAdd = members.find(member => member.id === parseInt(selectedMember));
            if (memberToAdd) {
                setSelectedMembers([...selectedMembers, memberToAdd]);
            }
        }
    };

    // Fonction pour changer la permission d'un membre
    const changePermission = (id, permission) => {
        setSelectedMembers(selectedMembers.map(member =>
            member.id === id ? { ...member, permission } : member
        ));
    };

    // Fonction pour supprimer un membre
    const removeMember = (id) => {
        setSelectedMembers(selectedMembers.filter(member => member.id !== id));
    };

    // Validation du formulaire
    const handleSubmit = () => {
        if (firstName && lastName && email && role) {
            setNotification({
                show: true,
                type: 'success',
                message: 'Ingénieur ajouté avec succès!'
            });
            setTimeout(() => {
                setNotification({ show: false, type: '', message: '' });
            }, 3000);

            navigate('/engineers');
        } else {
            setNotification({
                show: true,
                type: 'error',
                message: 'Veuillez remplir tous les champs obligatoires'
            });
            setTimeout(() => {
                setNotification({ show: false, type: '', message: '' });
            }, 3000);
        }
    };

    return (
        <div className="relative ">
                {/* Notification */}
                {notification.show && (
                    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                        <div className="flex items-center">
                            {notification.type === 'success' ? (
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span className="font-medium">{notification.message}</span>
                        </div>
                    </div>
                )}

                    <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                        <div className="flex items-center">
                            <button className="text-orange-500 mr-2 bg-white">
                                <svg className="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow-lg w-[80vw] ">
                        <div className="col-span-2 flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
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
                                className="bg-gray-50 text-black w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="Enter Engineer's email..."
                                className="bg-gray-50 text-black w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Last Name</label>
                            <input
                                type="text"
                                placeholder="Enter Engineer's last name..."
                                className="bg-gray-50 text-black w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Role</label>
                            <select
                                className="bg-gray-50 text-black w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="">Role</option>
                                {roles.map((role, index) => (
                                    <option key={index} value={role}>{role}</option>
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