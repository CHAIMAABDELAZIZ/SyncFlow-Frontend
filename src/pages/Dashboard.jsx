import { useState } from "react";
import { Search, MoreVertical, Filter } from "lucide-react";
import { useNavigate } from 'react-router-dom';


// Mock data
const mockWells = [
  { id: "A-103", status: "Active", phase: "Nom du phase", progress: 85 },
  { id: "A-104", status: "Active", phase: "Nom du phase", progress: 90 },
  { id: "A-105", status: "InActive", phase: "Nom du phase", progress: 95 },
  { id: "A-107", status: "Active", phase: "Nom du phase", progress: 60 },
  { id: "A-108", status: "InActive", phase: "Nom du phase", progress: 80 },
  { id: "A-109", status: "Active", phase: "Nom du phase", progress: 98 },
  // You can add more mock data as needed
];

export default function Dashboard() {
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
  };
  const [activeTab, setActiveTab] = useState(1);
  const [selectedWells, setSelectedWells] = useState([
    "A-107",
    "A-108",
    "A-109",
  ]);

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
                <span className="text-5xl text-black font-bold">1,520</span>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-medium">
                  $10.9
                </span>
              </div>
              <p className="text-gray-500 mt-1">Wells done</p>
            </div>

            <div className="p-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-5xl text-black font-bold">78</span>
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
                <button className="px-4 py-2  hover:border-orangePtrm rounded border border-gray-300 bg-white text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200">
                  <img src="/export.svg" alt="Export" className="h-5 w-5" />
                  <span>Export</span>
                </button>
                <button onClick={() => handleNavigation('/addwell')}  className="px-4 py-2 rounded bg-orange-500 text-white flex items-center gap-2 hover:bg-orange-600 transition-colors duration-200">
                  <img src="/plus.svg" alt="Add" className="h-3 w-3" />
                  <span>Add well</span>
                </button>
              </div>
            </div>

            {/* Tabs, Search and Filter in one line */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between mb-4 gap-3">
              {/* Tabs */}
              <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
                <button
                  className={`py-2 px-4 ${
                    activeTab === 1
                      ? "bg-white text-gray-800 font-medium"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                  }`}
                  onClick={() => setActiveTab(1)}
                >
                  Active Tab 1
                </button>
                <button
                  className={`py-2 px-4 border-l ${
                    activeTab === 2
                      ? "bg-white text-gray-800 font-medium"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                  }`}
                  onClick={() => setActiveTab(2)}
                >
                  Tab 2
                </button>
                <button
                  className={`py-2 px-4 border-l ${
                    activeTab === 3
                      ? "bg-white text-gray-800 font-medium"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                  }`}
                  onClick={() => setActiveTab(3)}
                >
                  Tab3
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-2 items-center">
                <div className="relative w-60 md:w-72">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-shadow duration-200"
                    placeholder="Search"
                  />
                </div>

                <button className="flex items-center gap-2 px-4 py-2 hover:border-orangePtrm text-black  bg-white border border-gray-300 rounded-lg whitespace-nowrap hover:bg-gray-50 transition-colors duration-200">
                  <Filter className="  text-black h-5 w-5" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-thin border-divider">
                    <th className="px-4 py-3 text-center w-10 bg-header-bg">
                      {/* Keep this div at a fixed size regardless of state */}
                      <div
                        className="flex justify-center"
                        style={{ minHeight: "24px", minWidth: "24px" }}
                      >
                        {selectedWells.length > 0 ? (
                          <button
                            className="h-6 w-6 rounded border border-orange-500 flex items-center justify-center hover:bg-orange-50 transition-colors duration-150"
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
                        <img
                          src="/arrow-down.svg"
                          alt="Sort"
                          className="h-4 w-4"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 w-32 bg-header-bg">
                      <div className="flex items-center justify-center gap-1">
                        <span>Status</span>
                        <img
                          src="/status.svg"
                          alt="Status"
                          className="h-4 w-4"
                        />
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
                  {mockWells.map((well) => (
                    <tr
                      key={well.id}
                      className="border-b border-thin border-divider hover:bg-gray-50"
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
                            />
                            <label
                              htmlFor={`checkbox-${well.id}`}
                              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded border border-gray-300 
                      bg-white peer-checked:bg-orange-500 peer-checked:border-orange-500 hover:border-orange-300 transition-colors duration-150"
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
                        <div className="font-medium text-gray-500">Well #{well.id}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <span
                            className={`px-3 py-1 rounded-md inline-block text-center min-w-[90px] ${getStatusBgColor(
                              well.status
                            )} ${getStatusTextColor(well.status)}`}
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
                        <div className="flex justify-center">
                          <button className="rounded-full p-1 bg-white hover:border-orangePtrm transition-colors duration-150">
                            <MoreVertical className="h-5 w-5  text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 pt-4">
              <div className="text-sm text-gray-500">1 - 8 of 40 items</div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-md bg-white  hover:border-orangePtrm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                  Previous
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md bg-white  hover:border-orangePtrm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
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