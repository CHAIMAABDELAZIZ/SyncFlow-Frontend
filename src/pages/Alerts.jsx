import React, { useState, useEffect } from "react";

export default function Alerts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const itemsPerPage = 10;

  // Fetch problems from API
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/problemes");
        const data = await response.json();

        if (data.success) {
          // Transform problems to alerts format
          const transformedAlerts = data.data.map((problem) => ({
            id: problem.id,
            type: getTypeLabel(problem.type),
            well: problem.operation?.phase?.forage?.puit?.nom || "Unknown Well",
            date:
              problem.dateDetection || new Date().toISOString().split("T")[0],
            severity: getSeverityLabel(problem.gravite),
            status: getStatusLabel(problem.statut),
            description: problem.description,
            recommendation:
              problem.solutionPropose || "No recommendation available",
            impactCost: problem.impactCout,
            impactDelay: problem.impactDelai,
            operation: problem.operation?.description,
            phase: problem.operation?.phase
              ? `Phase ${problem.operation.phase.numeroPhase}`
              : null,
            rawData: problem, // Keep original data for actions
          }));
          setAlerts(transformedAlerts);
        } else {
          console.error("Failed to fetch problems:", data.message);
          setAlerts([]);
        }
      } catch (error) {
        console.error("Error fetching problems:", error);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // Transform enum values to readable labels
  const getTypeLabel = (type) => {
    const typeLabels = {
      COUT: "Dépassement des coûts",
      DELAI: "Dépassement des délais",
      TECHNIQUE: "Problème technique",
      SECURITE: "Problème sécurité",
    };
    return typeLabels[type] || type;
  };

  const getSeverityLabel = (gravite) => {
    const severityLabels = {
      CRITIQUE: "Critical",
      MODEREE: "Medium",
      FAIBLE: "Low",
    };
    return severityLabels[gravite] || gravite;
  };

  const getStatusLabel = (statut) => {
    const statusLabels = {
      OUVERT: "Open",
      EN_COURS: "In Progress",
      RESOLU: "Resolved",
      FERME: "Closed",
    };
    return statusLabels[statut] || statut;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter and search logic
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.well.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity =
      !filterSeverity || alert.severity === filterSeverity;
    const matchesType = !filterType || alert.type.includes(filterType);
    const matchesStatus = !filterStatus || alert.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);

  // Handle page change
  const nextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  // Handle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Handle action dropdown
  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleViewDetails = (alertId) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      const details = [
        `Type: ${alert.type}`,
        `Well: ${alert.well}`,
        `Date: ${alert.date}`,
        `Severity: ${alert.severity}`,
        `Status: ${alert.status}`,
        `Description: ${alert.description}`,
        `Recommendation: ${alert.recommendation}`,
        alert.operation ? `Operation: ${alert.operation}` : "",
        alert.phase ? `Phase: ${alert.phase}` : "",
        alert.impactCost
          ? `Cost Impact: ${alert.impactCost.toLocaleString()} DZD`
          : "",
        alert.impactDelay ? `Delay Impact: ${alert.impactDelay} days` : "",
      ]
        .filter(Boolean)
        .join("\n");

      alert(details);
    }
    setOpenDropdownId(null);
  };

  const handleMarkAsResolved = async (alertId) => {
    try {
      const alert = alerts.find((a) => a.id === alertId);
      if (!alert) return;

      const response = await fetch(
        `http://localhost:8080/api/problemes/${alertId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...alert.rawData,
            statut: "RESOLU",
            dateResolution: new Date().toISOString().split("T")[0],
          }),
        }
      );

      if (response.ok) {
        // Update local state
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, status: "Resolved" } : a))
        );
        alert("Problem marked as resolved successfully!");
      } else {
        alert("Failed to update problem status");
      }
    } catch (error) {
      console.error("Error updating problem:", error);
      alert("Error updating problem status");
    }
    setOpenDropdownId(null);
  };

  const handleDismissAlert = async (alertId) => {
    try {
      const alert = alerts.find((a) => a.id === alertId);
      if (!alert) return;

      const response = await fetch(
        `http://localhost:8080/api/problemes/${alertId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...alert.rawData,
            statut: "FERME",
          }),
        }
      );

      if (response.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
        alert("Problem dismissed successfully!");
      } else {
        alert("Failed to dismiss problem");
      }
    } catch (error) {
      console.error("Error dismissing problem:", error);
      alert("Error dismissing problem");
    }
    setOpenDropdownId(null);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading alerts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-600">
            Monitor and manage drilling problems and issues
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-black placeholder-gray-400"
              />
            </div>
            <button
              onClick={toggleFilters}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Filters
            </button>
          </div>


          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Types</option>
                    <option value="coûts">Cost Overrun</option>
                    <option value="délais">Schedule Delay</option>
                    <option value="technique">Technical Issue</option>
                    <option value="sécurité">Safety Issue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    setFilterSeverity("");
                    setFilterType("");
                    setFilterStatus("");
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Well
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {alert.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.well}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(alert.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        alert.status
                      )}`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {alert.impactCost && (
                      <div>Cost: +{alert.impactCost.toLocaleString()} DZD</div>
                    )}
                    {alert.impactDelay && (
                      <div>Delay: +{alert.impactDelay} days</div>
                    )}
                    {!alert.impactCost && !alert.impactDelay && <div>-</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                    <button
                      onClick={() => toggleDropdown(alert.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {openDropdownId === alert.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg z-10 border">
                        <div className="py-1">
                          <button
                            onClick={() => handleViewDetails(alert.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            View Details
                          </button>
                          {alert.status !== "Resolved" &&
                            alert.status !== "Closed" && (
                              <button
                                onClick={() => handleMarkAsResolved(alert.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Mark as Resolved
                              </button>
                            )}
                          {alert.status !== "Closed" && (
                            <button
                              onClick={() => handleDismissAlert(alert.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {loading
                ? "Loading alerts..."
                : "No alerts found matching your criteria"}
            </div>
          )}

          {/* Pagination */}
          {filteredAlerts.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredAlerts.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredAlerts.length}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
