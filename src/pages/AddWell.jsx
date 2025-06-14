import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Configuration object for form fields and labels
const FORM_CONFIG = {
  fields: {
    wellName: {
      label: "Well Name",
      placeholder: "Enter the well name...",
      type: "text",
    },
    wellRegion: {
      label: "Region",
      placeholder: "Select a region...",
      type: "select",
    },
    wellType: {
      label: "Well Type",
      placeholder: "Select a well type...",
      type: "select",
    },
    xCoordinate: {
      label: "X Coordinate",
      placeholder: "Enter X coordinate...",
      type: "number",
      default: "0",
    },
    yCoordinate: {
      label: "Y Coordinate",
      placeholder: "Enter Y coordinate...",
      type: "number",
      default: "0",
    },
  },
  notifications: {
    success: "Well added successfully!",
    error: "Please fill all required fields",
    apiError: "Failed to communicate with the server. Please try again.",
  },
};

// API calls
const API_BASE_URL = "http://localhost:8080/api";

const fetchWellTypes = async () => {
  try {
    // Replace with actual endpoint if available (e.g., /api/types)
    return [
      "Forage",
      "Oil Well",
      "Gas Well",
      "Water Well",
      "Injection Well",
      "Monitoring Well",
    ];
  } catch (error) {
    console.error("Failed to fetch well types:", error.message);
    throw new Error("Failed to fetch well types");
  }
};

const fetchRegions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/regions`);
    console.log("Regions response:", response.data);
    // Filter out regions with null names and map to { id, name }
    const validRegions = (response.data.data || response.data)
      .filter((region) => region.nom !== null)
      .map((region) => ({ id: region.id, name: region.nom }));
    return validRegions;
  } catch (error) {
    console.error("Failed to fetch regions:", error.message);
    // Mock data with known valid ID from Postman
    return [{ id: 1, name: "Région Nord" }];
  }
};

const fetchMembers = async () => {
  try {
    // Mock data for frontend-only members
    return [
      {
        id: 1,
        name: "Abdelaziz chaaima",
        role: "responsable",
        email: "chaima@example.com",
        permission: "Owner",
        avatar: "YR",
        guest: false,
      },
      {
        id: 2,
        name: "kahina kahina",
        role: "ingénieur",
        email: "kahina@example.com",
        permission: "Editor",
        avatar: "HW",
        guest: false,
      },
      {
        id: 3,
        name: "adem abdelaziz",
        role: "schlumberger",
        email: "adem@gmail.com",
        permission: "Member",
        avatar: "RD",
        guest: true,
      },
    ];
  } catch (error) {
    console.error("Failed to fetch members:", error.message);
    throw new Error("Failed to fetch members");
  }
};

const submitWellData = async (wellData) => {
  try {
    const regionId = parseInt(wellData.wellRegion);
    if (isNaN(regionId) || regionId <= 0) {
      throw new Error("Invalid region ID selected");
    }

    const payload = {
      nom: wellData.wellName,
      type: wellData.wellType,
      region: { id: regionId },
      coord_x: parseFloat(wellData.xCoordinate),
      coord_y: parseFloat(wellData.yCoordinate),
      statut: "EN_COURS",
    };

    console.log("Submitting payload:", JSON.stringify(payload, null, 2));
    console.log("Selected members (frontend only):", wellData.selectedMembers);

    const response = await axios.post(`${API_BASE_URL}/puits`, payload);
    console.log("API response:", response.data);
    return { success: true, data: response.data.data || response.ata };
  } catch (error) {
    console.error("API error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      payload: JSON.stringify(payload, null, 2),
    });
    throw new Error(
      error.response?.data?.message || error.message || "Failed to create well"
    );
  }
};

const AddWell = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    wellName: "",
    wellRegion: "",
    wellType: "",
    xCoordinate: FORM_CONFIG.fields.xCoordinate.default,
    yCoordinate: FORM_CONFIG.fields.yCoordinate.default,
  });

  // Other states
  const [wellTypes, setWellTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [types, regionsData, membersData] = await Promise.all([
          fetchWellTypes(),
          fetchRegions(),
          fetchMembers(),
        ]);
        setWellTypes(types);
        setRegions(regionsData); // This will now contain [{ id, name }, ...]
        setMembers(membersData);
      } catch (error) {
        setNotification({
          show: true,
          type: "error",
          message: error.message || FORM_CONFIG.notifications.apiError,
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add member to selected members
  const addMember = () => {
    if (selectedMember) {
      const memberToAdd = members.find(
        (member) => member.id === parseInt(selectedMember)
      );
      if (
        memberToAdd &&
        !selectedMembers.some((member) => member.id === memberToAdd.id)
      ) {
        setSelectedMembers([...selectedMembers, memberToAdd]);
      }
      setSelectedMember("");
    }
  };

  // Change member permission
  const changePermission = (id, permission) => {
    setSelectedMembers(
      selectedMembers.map((member) =>
        member.id === id ? { ...member, permission } : member
      )
    );
  };

  // Remove member
  const removeMember = (id) => {
    setSelectedMembers(selectedMembers.filter((member) => member.id !== id));
  };

  // Handle form submission
  const handleSubmit = async () => {
    const isFormValid = Object.values(formData).every((value) => value !== "");

    if (isFormValid) {
      setIsLoading(true);
      try {
        const wellData = {
          ...formData,
          selectedMembers,
        };
        const response = await submitWellData(wellData);

        if (response.success) {
          const puits = response.data;

          try {
            // Créer le forage après le puits
            const forageData = {
              cout: 0,
              date_debut: null,
              date_fin: null,
              puits: { id: puits.id },
            };
            await axios.post(`${API_BASE_URL}/forages`, forageData);
            console.log("Forage créé avec succès !");
          } catch (error) {
            console.error(
              "Erreur lors de la création du forage :",
              error.message
            );
          }
          setNotification({
            show: true,
            type: "success",
            message: FORM_CONFIG.notifications.success,
          });
          setTimeout(() => {
            setNotification({ show: false, type: "", message: "" });
            navigate("/dashboard");
          }, 3000);
        }
      } catch (error) {
        setNotification({
          show: true,
          type: "error",
          message: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setNotification({
        show: true,
        type: "error",
        message: FORM_CONFIG.notifications.error,
      });
      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 3000);
    }
  };

  // Render form field
  const renderField = (fieldKey, config) => {
    if (config.type === "select") {
      const options = fieldKey === "wellType" ? wellTypes : regions;
      return (
        <select
          className="bg-gray-50 text-black w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={formData[fieldKey]}
          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
        >
          <option value="">{config.placeholder}</option>
          {options.map((option, index) => (
            <option
              key={index}
              value={fieldKey === "wellRegion" ? option.id : option}
            >
              {fieldKey === "wellRegion" ? option.name : option}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        type={config.type}
        placeholder={config.placeholder}
        className="bg-gray-50 text-black w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        value={formData[fieldKey]}
        onChange={(e) => handleInputChange(fieldKey, e.target.value)}
      />
    );
  };

  return (
    <div className="relative">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Well</h1>
          <p className="text-gray-500">Add a well with its details</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow-lg">
          {Object.entries(FORM_CONFIG.fields).map(([fieldKey, config]) => (
            <div key={fieldKey}>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                {config.label}
              </label>
              {renderField(fieldKey, config)}
            </div>
          ))}

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Members
            </label>
            <div className="flex flex-wrap items-center mb-4">
              <select
                className="bg-gray-50 text-black w-full md:w-3/4 p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mr-2"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">Add members</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </option>
                ))}
              </select>
              <button
                onClick={addMember}
                className="mt-2 md:mt-0 w-full md:w-auto px-4 py-2 border-orange-500 bg-white hover:bg-orange-500 text-orange-500 hover:text-white rounded-md"
                disabled={isLoading}
              >
                Add Member
              </button>
            </div>

            <div className="mt-2 space-y-3 max-h-64 overflow-y-auto">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 flex items-center justify-center bg-orange-100 text-orange-600 font-bold rounded-full mr-3">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {member.guest && (
                      <span className="text-xs text-orange-500 bg-orange-100 px-2 py-1 rounded-full">
                        GUEST
                      </span>
                    )}
                    <select
                      className="bg-gray-50 text-black text-sm p-2 border border-gray-300 rounded-md"
                      value={member.permission}
                      onChange={(e) =>
                        changePermission(member.id, e.target.value)
                      }
                    >
                      <option value="Owner">Owner</option>
                      <option value="Editor">Editor</option>
                      <option value="Member">Member</option>
                    </select>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 border-orange-500 bg-white hover:bg-orange-500 text-orange-500 hover:text-white rounded-md font-medium transition-colors duration-300"
              disabled={isLoading}
            >
              Add Well
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddWell;
