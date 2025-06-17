import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AlertDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolutionForm, setResolutionForm] = useState({
    solutionImplemente: "",
    notes: "",
  });
  const [showResolutionForm, setShowResolutionForm] = useState(false);

  // Fetch alert details
  useEffect(() => {
    const fetchAlertDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/problemes/${id}`
        );
        const data = await response.json();

        if (data.success) {
          setAlert(data.data);
        } else {
          setError("Failed to fetch alert details");
        }
      } catch (err) {
        console.error("Error fetching alert details:", err);
        setError("Error loading alert details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAlertDetails();
    }
  }, [id]);

  // Helper functions for labels and colors
  const getTypeLabel = (type) => {
    const types = {
      COUT: "Cost Overrun",
      DELAI: "Delay",
      EQUIPEMENT: "Equipment",
      TECHNIQUE: "Technical",
      SECURITE: "Safety",
      ENVIRONNEMENT: "Environmental",
    };
    return types[type] || type;
  };

  const getSeverityLabel = (gravite) => {
    const severities = {
      CRITIQUE: "Critical",
      MAJEUR: "Major",
      MINEUR: "Minor",
    };
    return severities[gravite] || gravite;
  };

  const getStatusLabel = (statut) => {
    const statuses = {
      OUVERT: "Open",
      EN_COURS: "In Progress",
      RESOLU: "Resolved",
      FERME: "Closed",
    };
    return statuses[statut] || statut;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "CRITIQUE":
        return "bg-red-100 text-red-800 border-red-200";
      case "MAJEUR":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MINEUR":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OUVERT":
        return "bg-red-100 text-red-800";
      case "EN_COURS":
        return "bg-blue-100 text-blue-800";
      case "RESOLU":
        return "bg-green-100 text-green-800";
      case "FERME":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Action handlers
  const handleStatusChange = async (newStatus) => {
    if (!alert) return;

    try {
      setActionLoading(true);

      const updateData = {
        ...alert,
        statut: newStatus,
        dateResolution:
          newStatus === "RESOLU" || newStatus === "FERME"
            ? new Date().toISOString().split("T")[0]
            : null,
        resoluPar:
          newStatus === "RESOLU" || newStatus === "FERME" ? { id: 1 } : null, // TODO: Use actual logged-in user
      };

      const response = await fetch(
        `http://localhost:8080/api/problemes/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (result.success) {
        setAlert(result.data);
        alert(`Alert status changed to ${getStatusLabel(newStatus)}`);
      } else {
        alert("Failed to update alert status");
      }
    } catch (err) {
      console.error("Error updating alert status:", err);
      alert("Error updating alert status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolutionSubmit = async (e) => {
    e.preventDefault();

    if (!resolutionForm.solutionImplemente.trim()) {
      alert("Please provide the implemented solution");
      return;
    }

    try {
      setActionLoading(true);

      const updateData = {
        ...alert,
        statut: "RESOLU",
        dateResolution: new Date().toISOString().split("T")[0],
        solutionImplemente: resolutionForm.solutionImplemente,
        resoluPar: { id: 1 }, // TODO: Use actual logged-in user
      };

      const response = await fetch(
        `http://localhost:8080/api/problemes/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (result.success) {
        setAlert(result.data);
        setShowResolutionForm(false);
        setResolutionForm({ solutionImplemente: "", notes: "" });
        alert("Alert resolved successfully");
      } else {
        alert("Failed to resolve alert");
      }
    } catch (err) {
      console.error("Error resolving alert:", err);
      alert("Error resolving alert");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      setActionLoading(true);

      const updateData = {
        ...alert,
        statut: "EN_COURS",
        resoluPar: { id: 1 }, // TODO: Use actual logged-in user
      };

      const response = await fetch(
        `http://localhost:8080/api/problemes/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (result.success) {
        setAlert(result.data);
        alert("Alert assigned to you");
      } else {
        alert("Failed to assign alert");
      }
    } catch (err) {
      console.error("Error assigning alert:", err);
      alert("Error assigning alert");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading alert details...</p>
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            ⚠️ Error Loading Alert
          </div>
          <p className="text-gray-600">{error || "Alert not found"}</p>
          <button
            onClick={() => navigate("/alerts")}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Back to Alerts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/alerts")}
              className="flex items-center space-x-2 bg-orange-500 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Alerts</span>
            </button>
            <div className="h-6 border-l border-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">
              Alert #{alert.id} - {getTypeLabel(alert.type)}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(
                alert.gravite
              )}`}
            >
              {getSeverityLabel(alert.gravite)}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                alert.statut
              )}`}
            >
              {getStatusLabel(alert.statut)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alert Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Problem Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {alert.description}
              </p>
            </div>

            {/* Operation Details */}
            {alert.operation && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  Related Operation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Operation Type
                    </label>
                    <p className="text-gray-900">
                      {alert.operation.typeOperation?.nom || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Status
                    </label>
                    <p className="text-gray-900">{alert.operation.statut}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Planned Cost
                    </label>
                    <p className="text-gray-900">
                      {alert.operation.coutPrev
                        ? `${alert.operation.coutPrev.toLocaleString()} DZD`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Actual Cost
                    </label>
                    <p className="text-gray-900">
                      {alert.operation.coutReel
                        ? `${alert.operation.coutReel.toLocaleString()} DZD`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Well
                    </label>
                    <p className="text-gray-900">
                      {alert.operation.phase?.forage?.puit?.nom || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Phase
                    </label>
                    <p className="text-gray-900">
                      Phase {alert.operation.phase?.numeroPhase} -{" "}
                      {alert.operation.phase?.diametre
                        ?.replace("POUCES_", "")
                        .replace("_", " ")}
                      "
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Impact Analysis */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Impact Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <DollarSign size={20} className="text-red-500" />
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Cost Impact
                    </label>
                    <p className="text-gray-900 font-medium">
                      {alert.impactCout
                        ? `${alert.impactCout.toLocaleString()} DZD`
                        : "No cost impact"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock size={20} className="text-orange-500" />
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Time Impact
                    </label>
                    <p className="text-gray-900 font-medium">
                      {alert.impactDelai
                        ? `${alert.impactDelai} days`
                        : "No time impact"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposed Solution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Proposed Solution
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {alert.solutionPropose || "No solution proposed yet"}
              </p>
            </div>

            {/* Implemented Solution (if resolved) */}
            {alert.solutionImplemente && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-green-900">
                  Implemented Solution
                </h2>
                <p className="text-green-800 leading-relaxed">
                  {alert.solutionImplemente}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Alert Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Alert Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Detection Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {alert.dateDetection}
                    </p>
                  </div>
                </div>

                {alert.dateResolution && (
                  <div className="flex items-center space-x-3">
                    <CheckCircle size={16} className="text-green-500" />
                    <div>
                      <label className="block text-xs font-medium text-gray-500">
                        Resolution Date
                      </label>
                      <p className="text-sm text-gray-900">
                        {alert.dateResolution}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <User size={16} className="text-gray-400" />
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Reported By
                    </label>
                    <p className="text-sm text-gray-900">
                      {alert.signalePar
                        ? `${alert.signalePar.prenom} ${alert.signalePar.nom}`
                        : "System"}
                    </p>
                  </div>
                </div>

                {alert.resoluPar && (
                  <div className="flex items-center space-x-3">
                    <User size={16} className="text-green-500" />
                    <div>
                      <label className="block text-xs font-medium text-gray-500">
                        Resolved By
                      </label>
                      <p className="text-sm text-gray-900">
                        {`${alert.resoluPar.prenom} ${alert.resoluPar.nom}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Actions
              </h3>
              <div className="space-y-3">
                {alert.statut === "OUVERT" && (
                  <>
                    <button
                      onClick={handleAssignToMe}
                      disabled={actionLoading}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Assign to Me
                    </button>
                    <button
                      onClick={() => handleStatusChange("EN_COURS")}
                      disabled={actionLoading}
                      className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      Start Working
                    </button>
                  </>
                )}

                {alert.statut === "EN_COURS" && (
                  <button
                    onClick={() => setShowResolutionForm(true)}
                    disabled={actionLoading}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    Mark as Resolved
                  </button>
                )}

                {alert.statut === "RESOLU" && (
                  <button
                    onClick={() => handleStatusChange("FERME")}
                    disabled={actionLoading}
                    className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Close Alert
                  </button>
                )}

                {alert.statut !== "FERME" && (
                  <button
                    onClick={() => handleStatusChange("FERME")}
                    disabled={actionLoading}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    Close Without Resolution
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resolution Form Modal */}
        {showResolutionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Resolve Alert</h3>
              <form onSubmit={handleResolutionSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Implemented Solution *
                  </label>
                  <textarea
                    value={resolutionForm.solutionImplemente}
                    onChange={(e) =>
                      setResolutionForm({
                        ...resolutionForm,
                        solutionImplemente: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 bg-white text-black rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    rows="4"
                    placeholder="Describe the solution that was implemented to resolve this alert..."
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowResolutionForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? "Resolving..." : "Resolve"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
