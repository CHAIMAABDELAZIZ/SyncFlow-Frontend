import { useState, useEffect } from "react";
import { Search, MoreVertical, Filter } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [wells, setWells] = useState([]); // State for API data
  const [activeTab, setActiveTab] = useState(1);
  const [selectedWells, setSelectedWells] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch wells from API
  useEffect(() => {
    const fetchWells = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/puits');
        if (response.data.success) {
          // Map API data to match table structure
          const mappedWells = response.data.data.map(well => ({
            id: well.id.toString(), // Convert to string for consistency
            name: well.nom.toString(),
            status: well.statut === 'EN_COURS' ? 'Active' : 'InActive', // Map statut to Active/InActive
            phase: well.type || 'Forage', // Use type as phase, default to 'Forage'
            progress: Math.floor(Math.random() * 40) + 60, // Placeholder: API doesn't provide progress
          }));
          setWells(mappedWells);
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch wells');
        setLoading(false);
      }
    };
    fetchWells();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };
  

  const toggleWellSelection = (wellId) => {
    if (selectedWells.includes(wellId)) {
      setSelectedWells(selectedWells.filter((id) => id !== wellId));
    } else {
      setSelectedWells([...selectedWells, wellId]);
    }
  };

  const getStatusTextColor = (status) => {
    return status === "Active" ? "text-green-700" : "text-red-700";
  };

  const getStatusBgColor = (status) => {
    return status === "Active" ? "bg-green-100" : "bg-red-100";
  };

  async function deletePuitWithDependencies(puitId) {
    try {
      const response = await axios.get(`http://localhost:8080/api/forages/puit/${puitId}`);
      const forages = response.data?.data || [];

      for (const forage of forages) {
        const resPhases = await axios.get(`http://localhost:8080/api/phases/forage/${forage.id}`);
        const phases = resPhases.data?.data || [];

        for (const phase of phases) {
          const resOperations = await axios.get(`http://localhost:8080/api/operations/phase/${phase.id}`);
          const operations = resOperations.data?.data || [];

          for (const operation of operations) {
            await axios.delete(`http://localhost:8080/api/operations/${operation.id}`);
          }

          await axios.delete(`http://localhost:8080/api/phases/${phase.id}`);
        }

        await axios.delete(`http://localhost:8080/api/forages/${forage.id}`);
      }

      await axios.delete(`http://localhost:8080/api/puits/${puitId}`);

      console.log(`Puit ${puitId} et toutes ses dépendances ont été supprimés.`);
    } catch (error) {
      console.error("Erreur lors de la suppression du puits :", error);
    }
  }


  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard-container bg-[#FEFCFA] min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Oil wells</h1>
            <p className="text-gray-500">Jun 1 - Aug 31, 2025</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 mt-4 md:mt-0">
            <div className="p-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-5xl text-black font-bold">{wells.length}</span>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-medium">
                  $10.9
                </span>
              </div>
              <p className="text-gray-500 mt-1">Wells done</p>
            </div>
            <div className="p-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-5xl text-black font-bold">
                  {wells.filter(w => w.status === 'Active').length}
                </span>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-medium">
                  $5.9
                </span>
              </div>
              <p className="text-gray-500 mt-1">Wells to drill</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col">
            <div className="flex flex-row justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Wells lists
                </h2>
                <p className="text-gray-500">
                  A descriptive body text comes here
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 hover:border-orangePtrm rounded border border-gray-300 bg-white text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200">
                  <img src="/export.svg" alt="Export" className="h-5 w-5" />
                  <span>Export</span>
                </button>
                <button onClick={() => handleNavigation('/addwell')} className="px-4 py-2 rounded bg-orange-500 text-white flex items-center gap-2 hover:bg-orange-600 transition-colors duration-200">
                  <img src="/plus.svg" alt="Add" className="h-3 w-3" />
                  <span>Add well</span>
                </button>
              </div>
            </div>


            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-thin border-divider">
                    <th className="px-4 py-3 text-center w-10 bg-header-bg">
                      <div className="flex justify-center" style={{ minHeight: "24px", minWidth: "24px" }}>
                        {selectedWells.length > 0 ? (
                          <button
                            className="h-6 w-6 rounded border border-orange-500 flex items-center justify-center hover:bg-orange-50"
                            onClick={() => setSelectedWells([])}
                          >
                            <div className="h-0.5 w-3 bg-orange-500 rounded-sm"></div>
                          </button>
                        ) : (
                          <div className="h-6 w-6"></div>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 w-44 bg-header-bg">
                      <div className="flex items-center justify-center gap-1">
                        <span>Identifier</span>
                        <img src="/arrow-down.svg" alt="Sort" className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 w-32 bg-header-bg">
                      <div className="flex items-center justify-center gap-1">
                        <span>Status</span>
                        <img src="/status.svg" alt="Status" className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 w-44 bg-header-bg">
                      <div className="flex items-center justify-center gap-1">
                        <span>current phase</span>
                        <img src="/phase.svg" alt="Phase" className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 w-1/3 bg-header-bg">
                      Progress
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 w-16 bg-header-bg">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {wells.map((well) => (
                    <tr
                      key={well.id}
                      className="border-b border-thin border-divider hover:bg-gray-50"
                      onClick={() => navigate(`/welldetails/${well.id}`)}
                    >
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="relative h-4 w-4">
                            <input
                              type="checkbox"
                              id={`checkbox-${well.id}`}
                              className="sr-only peer"
                              checked={selectedWells.includes(well.id)}
                              onChange={() => toggleWellSelection(well.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label
                              htmlFor={`checkbox-${well.id}`}
                              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded border border-gray-300 bg-white peer-checked:bg-orange-500 peer-checked:border-orange-500 hover:border-orange-300"
                            >
                              {selectedWells.includes(well.id) && (
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
                        <div className="font-medium text-gray-500">{well.name}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <span
                            className={`px-3 py-1 rounded-md inline-block text-center min-w-[90px] ${getStatusBgColor(well.status)} ${getStatusTextColor(well.status)}`}
                          >
                            {well.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-gray-500">
                        {well.phase}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-6">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 flex-1">
                            <div
                              className="bg-orange-500 h-2.5 rounded-full"
                              style={{ width: `${well.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-500 whitespace-nowrap">
                            {well.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation(); // Empêche la navigation
                            await deletePuitWithDependencies(well.id); // Supprime dans le backend
                            setWells(prevWells => prevWells.filter(w => w.id !== well.id)); // Met à jour l’état local
                          }}
                          className="text-red-600 bg-white border-red-800 hover:border-red-800 hover:bg-red-200  font-medium"
                        >
                          Delete
                        </button>

                      </td>


                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 pt-4">
              <div className="text-sm text-gray-500">{wells.length} items</div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:border-orangePtrm text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:border-orangePtrm text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}