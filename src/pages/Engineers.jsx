import React, { useState, useEffect } from "react";
import { Search, MoreVertical, Filter, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Engineers() {
  const navigate = useNavigate();
  const [selectedEngineers, setSelectedEngineers] = useState([4, 5]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filterLastConnection, setFilterLastConnection] = useState("");
  const [engineers, setEngineers] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const itemsPerPage = 8; // 8 items per page to match screenshot

  // Fetch engineers from API
  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/utilisateurs");
        const data = await response.json();

        if (data.success) {
          setEngineers(data.data);
        } else {
          setError("Failed to fetch engineers data");
        }
      } catch (err) {
        console.error("Error fetching engineers:", err);
        setError("Error loading engineers data");
      } finally {
        setLoading(false);
      }
    };

    fetchEngineers();
  }, []);

  // Get role label from enum value
  const getRoleLabel = (role) => {
    const roleLabels = {
      INGENIEUR_FORAGE: "Drilling Engineer",
      RESPONSABLE_CHANTIER: "Site Manager",
      GEOLOGUE: "Geologist",
      CHEF_EQUIPE: "Team Leader",
      SUPERVISEUR: "Supervisor",
      ADMIN: "Administrator",
    };
    return roleLabels[role] || role;
  };

  // Get role color for badges
  const getRoleColor = (role) => {
    const roleColors = {
      INGENIEUR_FORAGE: "bg-blue-100 text-blue-800",
      RESPONSABLE_CHANTIER: "bg-green-100 text-green-800",
      GEOLOGUE: "bg-purple-100 text-purple-800",
      CHEF_EQUIPE: "bg-yellow-100 text-yellow-800",
      SUPERVISEUR: "bg-orange-100 text-orange-800",
      ADMIN: "bg-red-100 text-red-800",
    };
    return roleColors[role] || "bg-gray-100 text-gray-800";
  };

  // Filter engineers based on search term and role
  const filteredEngineers = engineers.filter((engineer) => {
    const matchesSearch =
      engineer.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || engineer.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Get unique roles for filter dropdown
  const uniqueRoles = [...new Set(engineers.map((eng) => eng.role))];

  const toggleEngineerSelection = (engineerId) => {
    setSelectedEngineers((prev) =>
      prev.includes(engineerId)
        ? prev.filter((id) => id !== engineerId)
        : [...prev, engineerId]
    );
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEngineers = filteredEngineers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredEngineers.length / itemsPerPage);

  // Handle export
  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Full Name,Contact,Role,Associated Well,Created At,Last Connection\n" +
      filteredEngineers
        .map(
          (row) =>
            `${row.id},${row.fullName},${row.contact},${row.role},${row.well},${row.createdAt},${row.lastConnection}`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "engineers_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle add engineer
  const handleAddEngineer = () => {
    console.log("Opening add engineer form...");
    navigate("/adduser");
  };

  // Handle action dropdown
  const toggleDropdown = (engineerId) => {
    setOpenDropdownId(openDropdownId === engineerId ? null : engineerId);
  };

  const handleViewDetails = (engineerId) => {
    console.log(`Viewing details for engineer ${engineerId}`);
    setOpenDropdownId(null);
  };

  const handleEditEngineer = (engineerId) => {
    console.log(`Editing engineer ${engineerId}`);
    setOpenDropdownId(null);
  };

  const handleDeleteEngineer = (engineerId) => {
    setEngineers(engineers.filter((engineer) => engineer.id !== engineerId));
    setSelectedEngineers(selectedEngineers.filter((id) => id !== engineerId));
    setOpenDropdownId(null);
  };

  // Handle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const applyFilters = () => {
    setShowFilters(false);
    setCurrentPage(1);
  };

  // Handle page change
  const nextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading engineers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error Loading Data</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container bg-[#FEFCFA] min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Engineers</h1>
            <p className="text-gray-500 mt-1">Jun 1 - Aug 31, 2025</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 mt-4 md:mt-0">
            <div className="p-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-5xl text-black font-bold">1,520</span>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-medium">
                  $10.9
                </span>
              </div>
              <p className="text-gray-500 mt-1">Engineers active</p>
            </div>
            <div className="p-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-5xl text-black font-bold">78</span>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-medium">
                  $5.9
                </span>
              </div>
              <p className="text-gray-500 mt-1">Engineers to hire</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow p-6 relative">
          {/* Engineers Title */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Engineers</h2>
              <p className="text-gray-500 mt-1">A list of wells' engineers</p>
            </div>
            <div className="flex gap-2 items-center relative">
              <button
                onClick={handleExport}
                className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <Download className="h-5 w-5" />
                <span>Export</span>
              </button>
              <div className="relative w-60">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full text-black pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Search..."
                />
              </div>
              <button
                onClick={toggleFilters}
                className="flex items-center gap-2 px-4 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </button>
              {showFilters && (
                <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Filter Options
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-1">
                      Role
                    </label>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="w-full border bg-white text-black border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">All</option>
                      <option value="Drilling responsible">
                        Drilling responsible
                      </option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-1">
                      Last Connection
                    </label>
                    <select
                      value={filterLastConnection}
                      onChange={(e) => setFilterLastConnection(e.target.value)}
                      className="w-full border bg-white text-black border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">All</option>
                      <option value="Today">Today</option>
                      <option value="Yesterday">Yesterday</option>
                      <option value="Week ago">Week ago</option>
                    </select>
                  </div>
                  <button
                    onClick={applyFilters}
                    className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
                  >
                    Apply Filters
                  </button>
                </div>
              )}
              <button
                onClick={handleAddEngineer}
                className="px-4 py-2 rounded bg-orange-500 text-white flex items-center gap-2 hover:bg-orange-600"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 1V11M1 6H11"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Add Engineer</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-center w-10">
                    <div className="flex justify-center">
                      {selectedEngineers.length > 0 ? (
                        <button
                          className="h-6 w-6 bg-white rounded border border-orange-500 flex items-center justify-center hover:bg-orange-50"
                          onClick={() => setSelectedEngineers([])}
                        >
                          <div className="h-0.5 w-3 bg-orange-500 rounded-sm"></div>
                        </button>
                      ) : (
                        <div className="h-6 w-6 border border-gray-300 rounded"></div>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <span>Full name</span>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <span>Contact</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <span>Role</span>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <span>Associated well</span>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m-4-4H4m4 8h12m-12 0l4-4m-4 4l4 4"
                        />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <span>Created at</span>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <span>Last connection</span>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-400 w-16">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentEngineers.map((engineer) => (
                  <tr
                    key={engineer.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="relative h-4 w-4">
                          <input
                            type="checkbox"
                            id={`checkbox-${engineer.id}`}
                            className="sr-only peer"
                            checked={selectedEngineers.includes(engineer.id)}
                            onChange={() =>
                              toggleEngineerSelection(engineer.id)
                            }
                          />
                          <label
                            htmlFor={`checkbox-${engineer.id}`}
                            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded border border-gray-300 bg-white peer-checked:bg-orange-500 peer-checked:border-orange-500 hover:border-orange-300"
                          >
                            {selectedEngineers.includes(engineer.id) && (
                              <svg
                                className="h-3 w-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200">
                          <img
                            alt="Profile"
                            class="h-full w-full object-cover"
                            src="/chaima.jpeg"
                          />
                        </div>
                        <span className="text-gray-700">
                          {engineer.nom + " " + engineer.prenom}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-500">
                      {engineer.email}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-500">
                      {engineer.role}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-500">
                      {engineer.well}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-500">
                      {engineer.createdAt}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-500">
                      {engineer.lastConnection}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="relative flex justify-center">
                        <button
                          onClick={() => toggleDropdown(engineer.id)}
                          className="rounded-full p-1 bg-white border-none hover:bg-gray-100 focus:outline-none"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-400" />
                        </button>
                        {openDropdownId === engineer.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleViewDetails(engineer.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleEditEngineer(engineer.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit Engineer
                            </button>
                            <button
                              onClick={() => handleDeleteEngineer(engineer.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                            >
                              Delete Engineer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 pt-4">
            <div className="text-sm text-gray-500">
              {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredEngineers.length)} of{" "}
              {filteredEngineers.length} items
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
