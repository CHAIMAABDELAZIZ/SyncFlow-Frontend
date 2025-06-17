import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Pour résoudre les icônes Leaflet manquantes
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Phase status mappings
const DiametreLabels = {
  POUCES_26: '26"',
  POUCES_16: '16"',
  POUCES_12_25: '12 1/4"',
  POUCES_8_5: '8 1/2"',
};

const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "in-progress":
      return "bg-yellow-500";
    case "scheduled":
      return "bg-blue-500";
    case "not-started":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "completed":
      return "Terminé";
    case "in-progress":
      return "En cours";
    case "scheduled":
      return "Planifié";
    case "not-started":
      return "Non commencé";
    default:
      return "Inconnu";
  }
};

// Helper function to determine phase status
const getPhaseStatus = (phase) => {
  const now = new Date();
  const startDateReal = phase.dateDebutReelle;
  const endDateReal = phase.dateFinReelle;
  const startDatePlanned = phase.dateDebutPrevue;
  const endDatePlanned = phase.dateFinPrevue;

  // If phase has real end date, it's completed
  if (endDateReal) return "completed";

  // If phase has real start date but no end date, it's in progress
  if (startDateReal && !endDateReal) return "in-progress";

  // If no real dates, check planned dates
  if (startDatePlanned) {
    const startDate = new Date(startDatePlanned);
    if (startDate > now) return "scheduled";
    if (endDatePlanned) {
      const endDate = new Date(endDatePlanned);
      if (endDate < now) return "completed"; // Should have been completed by now
      return "in-progress"; // Should be in progress
    }
    return "in-progress";
  }

  return "not-started";
};

export default function WellDetail() {
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [phasePopup, setPhasePopup] = useState(null);
  const [activeTab, setActiveTab] = useState("phases"); // 'phases' or 'comparison'
  const [selectedPhaseForOperations, setSelectedPhaseForOperations] =
    useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // State for real data
  const [well, setWell] = useState(null);
  const [forage, setForage] = useState(null);
  const [phases, setPhases] = useState([]);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Progress calculation state
  const [progressData, setProgressData] = useState({
    countdown: 0,
    completed: 0,
    total: 0,
    begin: "TBD",
    completion: "TBD",
  });

  const handleAddProvisionalPlan = () => {
    navigate(`/well/${id}/add-provisional-plan`);
  };

  const handleAddReport = () => {
    navigate(`/well/${id}/add-daily-report`);
  };

  const handlePhaseClick = (phase) => {
    setSelectedPhase(phase);
    setPhasePopup(phase);
    setSelectedPhaseForOperations(phase.id);
  };

  const closePopup = () => {
    setPhasePopup(null);
  };

  // Fetch data from APIs
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching data for well ID:", id);

        // 1. Fetch Puit (Well) data
        const wellResponse = await axios.get(
          `http://localhost:8080/api/puits/${id}`
        );
        console.log("Well response:", wellResponse.data);

        if (!wellResponse.data.success) {
          throw new Error("Failed to fetch well data");
        }

        const wellData = wellResponse.data.data;
        setWell(wellData);

        // 2. Fetch Forage data for this well - using the correct endpoint
        const forageResponse = await axios.get(
          `http://localhost:8080/api/forages/puit/${id}`
        );
        console.log("Forage response:", forageResponse.data);

        let forageData = null;
        if (
          forageResponse.data.success &&
          forageResponse.data.data &&
          forageResponse.data.data.length > 0
        ) {
          forageData = forageResponse.data.data[0]; // Get the first forage
          setForage(forageData);
          console.log("Found forage:", forageData);
        } else {
          console.log("No forage found for this well");
          // Set default empty forage to prevent errors
          forageData = {
            id: null,
            cout: null,
            date_debut: null,
            date_fin: null,
          };
          setForage(forageData);
        }

        // 3. Fetch Phases data for this forage (only if forage exists)
        let phasesData = [];
        if (forageData && forageData.id) {
          const phasesResponse = await axios.get(
            `http://localhost:8080/api/phases/forage/${forageData.id}`
          );
          console.log("Phases response:", phasesResponse.data);

          if (phasesResponse.data.success) {
            phasesData = phasesResponse.data.data;
            setPhases(phasesData);

            // 4. Fetch Operations for all phases
            const allOperations = [];
            for (const phase of phasesData) {
              try {
                const operationsResponse = await axios.get(
                  `http://localhost:8080/api/operations/phase/${phase.id}`
                );
                if (operationsResponse.data.success) {
                  const phaseOperations = operationsResponse.data.data.map(
                    (op) => ({
                      ...op,
                      phaseId: phase.id,
                      phaseName: `Phase ${phase.numeroPhase} - ${
                        DiametreLabels[phase.diametre] || phase.diametre
                      }`,
                    })
                  );
                  allOperations.push(...phaseOperations);
                }
              } catch (opError) {
                console.warn(
                  `Failed to fetch operations for phase ${phase.id}:`,
                  opError
                );
              }
            }
            setOperations(allOperations);
          } else {
            console.log("No phases found for this forage");
            setPhases([]);
            setOperations([]);
          }
        } else {
          console.log("No forage available, skipping phases fetch");
          setPhases([]);
          setOperations([]);
        }

        // 5. Calculate progress data (always call with valid data)
        calculateProgressData(forageData, phasesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAllData();
    }
  }, [id]);

  // Calculate progress data based on real forage and phases
  const calculateProgressData = (forageData, phasesData = []) => {
    console.log("Calculating progress with:", { forageData, phasesData });

    const now = new Date();
    let earliestStart = null;
    let latestEnd = null;
    let completedDays = 0;
    let totalDays = 0;

    // Calculate from forage dates (with null checks)
    if (forageData && forageData.date_debut) {
      earliestStart = new Date(forageData.date_debut);
    }
    if (forageData && forageData.date_fin) {
      latestEnd = new Date(forageData.date_fin);
    }

    // If no forage dates, calculate from phases
    if ((!earliestStart || !latestEnd) && phasesData.length > 0) {
      phasesData.forEach((phase) => {
        const phaseStart = phase.dateDebutReelle || phase.dateDebutPrevue;
        const phaseEnd = phase.dateFinReelle || phase.dateFinPrevue;

        if (phaseStart) {
          const startDate = new Date(phaseStart);
          if (!earliestStart || startDate < earliestStart) {
            earliestStart = startDate;
          }
        }

        if (phaseEnd) {
          const endDate = new Date(phaseEnd);
          if (!latestEnd || endDate > latestEnd) {
            latestEnd = endDate;
          }
        }
      });
    }

    // Calculate days
    if (earliestStart && latestEnd) {
      totalDays = Math.ceil(
        (latestEnd - earliestStart) / (1000 * 60 * 60 * 24)
      );

      if (earliestStart <= now) {
        if (now >= latestEnd) {
          completedDays = totalDays;
        } else {
          completedDays = Math.ceil(
            (now - earliestStart) / (1000 * 60 * 60 * 24)
          );
        }
      }
    }

    const countdown = Math.max(0, totalDays - completedDays);

    const progressData = {
      countdown,
      completed: completedDays,
      total: totalDays,
      begin: earliestStart ? earliestStart.toLocaleDateString() : "TBD",
      completion: latestEnd ? latestEnd.toLocaleDateString() : "TBD",
    };

    console.log("Calculated progress data:", progressData);
    setProgressData(progressData);
  };

  const getOperationsToDisplay = () => {
    if (selectedPhaseForOperations) {
      return operations.filter(
        (op) => op.phaseId === selectedPhaseForOperations
      );
    }
    return operations;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading well data...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // No well data
  if (!well) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">Well not found</div>
          <button
            onClick={() => navigate("/home")}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex text-black flex-col gap-6 p-6 bg-white min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">#{well.nom}</h1>
          <div className="text-gray-600">
            {forage?.date_debut && forage?.date_fin
              ? `${new Date(
                  forage.date_debut
                ).toLocaleDateString()} - ${new Date(
                  forage.date_fin
                ).toLocaleDateString()}`
              : `Started: ${
                  forage?.date_debut
                    ? new Date(forage.date_debut).toLocaleDateString()
                    : "TBD"
                }`}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center bg-white border-2 border-orange-500 text-orange-500 rounded-lg px-5 py-2 hover:bg-orange-50 transition-colors font-medium"
            onClick={handleAddProvisionalPlan}
          >
            <span className="mr-2">+</span> Add provisional plan
          </button>

          <button
            className="flex items-center bg-orange-500 text-white rounded-lg px-5 py-2 hover:bg-orange-600 transition-colors font-medium"
            onClick={handleAddReport}
          >
            <span className="mr-2">+</span> Add daily report
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Top Row: Progress and Details */}
        <div className="flex flex-col gap-6">
          {/* Carte Détails du puits */}
          <div className="w-full bg-white text-black rounded-xl p-6 shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Détails du Puits</h1>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Nom : {well.nom}</h2>
              {forage && (
                <div className="mt-2 text-gray-600">
                  <p>
                    Coût du forage:{" "}
                    {forage.cout
                      ? `${forage.cout.toLocaleString()} DA`
                      : "Non défini"}
                  </p>
                  <p>
                    Date de début:{" "}
                    {forage.date_debut
                      ? new Date(forage.date_debut).toLocaleDateString()
                      : "Non définie"}
                  </p>
                  {forage.date_fin && (
                    <p>
                      Date de fin:{" "}
                      {new Date(forage.date_fin).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {well.coord_y && well.coord_x ? (
              <div className="h-[300px] w-full rounded shadow border">
                <MapContainer
                  center={[31.6806, 6.0711]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[well.coord_y, well.coord_x]}>
                    <Popup>
                      <strong>{well.nom}</strong>
                      <br />
                      ID: {well.id}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <p className="text-gray-500">
                Coordonnées non disponibles pour ce puits.
              </p>
            )}
          </div>

          {/* Row contenant les 2 cartes côte à côte */}
          <div className="flex gap-6">
            {/* Progress Card */}
            <div className="w-1/2 bg-orange-500 text-white rounded-xl p-6 shadow-lg flex flex-col gap-3">
              <h3 className="text-xl font-bold border-l-4 border-white pl-3">
                Progress of well
              </h3>
              <div className="flex justify-between items-center">
                <div>Countdown:</div>
                <div className="font-bold text-2xl">
                  {progressData.countdown} days
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>Completed:</div>
                <div className="font-bold text-2xl">
                  {progressData.completed} days
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>Total days:</div>
                <div className="font-bold text-lg">
                  {progressData.total} days
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>Begin:</div>
                <div>{progressData.begin}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>Completion:</div>
                <div>{progressData.completion}</div>
              </div>
            </div>

            {/* Details and Graph */}
            <div className="w-1/2 bg-white rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Phases Status
                </h2>
                <span className="text-gray-500">{phases.length} phases</span>
              </div>

              <div className="space-y-3">
                {phases.length > 0 ? (
                  phases.map((phase) => {
                    const status = getPhaseStatus(phase);
                    const diameter =
                      DiametreLabels[phase.diametre] || phase.diametre;
                    return (
                      <div
                        key={phase.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${getStatusColor(
                              status
                            )}`}
                          ></div>
                          <span className="text-sm font-medium">
                            Phase {phase.numeroPhase} - {diameter}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {getStatusLabel(status)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No phases defined for this well
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Phases Tracking */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Phases tracking</h2>
            <button className="text-gray-500 bg-white hover:text-gray-700 text-xl">
              ⋮
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "phases"
                  ? "border-b-2 border-orange-500 bg-orange-500 text-white"
                  : "text-orange-500 border-2 border-orange-500 bg-white"
              }`}
              onClick={() => setActiveTab("phases")}
            >
              Phases
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "comparison"
                  ? "border-b-2 border-orange-500 bg-orange-500 text-white"
                  : "text-orange-500 border-2 border-orange-500 bg-white"
              }`}
              onClick={() => setActiveTab("comparison")}
            >
              Comparison
            </button>
          </div>

          {activeTab === "phases" ? (
            // Realistic Well Visualization with Real Data
            <div className="relative flex justify-center h-96 bg-gray-100 rounded-lg p-4">
              {phases.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-lg">No phases defined for this well</p>
                    <p className="text-sm">
                      Add a provisional plan to define phases
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Surface level */}
                  <div className="absolute top-4 left-0 right-0 h-1 bg-green-600"></div>
                  <div className="absolute top-5 left-0 right-0 text-center text-sm font-bold text-green-800">
                    Surface
                  </div>

                  {/* Well structure */}
                  <div
                    className="relative flex flex-col items-center"
                    style={{ width: "200px" }}
                  >
                    {phases.map((phase, index) => {
                      const status = getPhaseStatus(phase);
                      const diameter =
                        DiametreLabels[phase.diametre] || phase.diametre;
                      const width = 120 - index * 20; // Decreasing width for each phase
                      const height = 80 + index * 20; // Increasing height for each phase

                      return (
                        <div
                          key={phase.id}
                          onClick={() => handlePhaseClick(phase)}
                          className="cursor-pointer transition-all hover:opacity-80 relative"
                          style={{ width: `${width}px`, height: `${height}px` }}
                        >
                          {/* Outer casing */}
                          <div
                            className={`absolute inset-0 ${getStatusColor(
                              status
                            )} border-4 border-gray-800`}
                          ></div>
                          {/* Inner hole */}
                          <div className="absolute inset-2 bg-gray-300"></div>
                          {/* Phase label */}
                          <div className="absolute -right-28 top-1/2 transform -translate-y-1/2 font-bold text-gray-800">
                            {diameter}
                          </div>
                          <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">
                            {phase.profondeurReelle ||
                              phase.profondeurPrevue ||
                              0}{" "}
                            m
                          </div>
                        </div>
                      );
                    })}

                    {/* TD marker */}
                    <div className="absolute -left-40 bottom-0 text-sm font-bold text-gray-800">
                      TD{" "}
                      {phases.reduce(
                        (max, phase) =>
                          Math.max(
                            max,
                            phase.profondeurReelle ||
                              phase.profondeurPrevue ||
                              0
                          ),
                        0
                      )}{" "}
                      m
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-800 bg-gray-400"></div>
                      <span className="text-xs">Non commencé</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-800 bg-blue-500"></div>
                      <span className="text-xs">Planifié</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-800 bg-yellow-500"></div>
                      <span className="text-xs">En cours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-800 bg-green-500"></div>
                      <span className="text-xs">Terminé</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Comparison View (Prévision vs Réel) - Using real data
            <div className="relative h-[480px] bg-gray-100 rounded-lg p-4">
              {phases.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-lg">No phases data for comparison</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Title */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 font-bold text-lg text-gray-800">
                    Real and prevision well comparison
                  </div>

                  {/* Headers */}
                  <div className="absolute top-10 w-full flex justify-center">
                    <div className="flex w-80 justify-between font-semibold text-blue-800">
                      <div className="w-32 text-center">Prevision</div>
                      <div className="w-32 text-center">Real</div>
                    </div>
                  </div>

                  {/* Surface line */}
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-80 h-0.5 bg-green-600"></div>

                  {/* Well sections comparison */}
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex justify-center">
                    {/* Left side - Prévision */}
                    <div className="flex flex-col items-end mr-8">
                      {phases.map((phase, index) => {
                        const diameter =
                          DiametreLabels[phase.diametre] || phase.diametre;
                        const height = 12 + index * 4;
                        return (
                          <div
                            key={`prev-${phase.id}`}
                            className="relative mb-2"
                          >
                            <div
                              className="bg-yellow-300 border-2 border-black flex items-center justify-center"
                              style={{
                                width: `${8 - index}0px`,
                                height: `${height * 4}px`,
                              }}
                            >
                              <div
                                className="bg-gray-200 border border-yellow-300"
                                style={{ height: `${height * 3}px` }}
                              ></div>
                            </div>
                            <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 text-sm">
                              {phase.profondeurPrevue || 0} m
                            </div>
                            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-black"></div>
                          </div>
                        );
                      })}
                      <div className="mt-4 text-sm">
                        TD{" "}
                        {phases.reduce(
                          (max, phase) =>
                            Math.max(max, phase.profondeurPrevue || 0),
                          0
                        )}{" "}
                        m
                      </div>
                    </div>

                    {/* Central line */}
                    <div className="w-0.5 h-72 bg-black mx-4"></div>

                    {/* Right side - Réel */}
                    <div className="flex flex-col items-start ml-8">
                      {phases.map((phase, index) => {
                        const status = getPhaseStatus(phase);
                        const statusColor =
                          status === "completed"
                            ? "bg-green-500"
                            : status === "in-progress"
                            ? "bg-yellow-500"
                            : "bg-gray-400";
                        const height = 12 + index * 4;
                        const hasProgress = phase.profondeurReelle > 0;

                        return (
                          <div
                            key={`real-${phase.id}`}
                            className="relative mb-2"
                          >
                            <div
                              className={`${statusColor} border-2 border-black flex items-center justify-center`}
                              style={{
                                width: `${8 - index}0px`,
                                height: `${height * 4}px`,
                              }}
                            >
                              <div
                                className="bg-gray-200 border"
                                style={{ height: `${height * 3}px` }}
                              ></div>
                            </div>
                            <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 text-sm">
                              {phase.profondeurReelle || 0} m
                            </div>
                            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-black"></div>
                            {hasProgress && (
                              <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-xs font-bold text-blue-600">
                                {phase.profondeurReelle >=
                                (phase.profondeurPrevue || 0)
                                  ? "+"
                                  : "-"}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div className="mt-4 text-sm">
                        TD{" "}
                        {phases.reduce(
                          (max, phase) =>
                            Math.max(max, phase.profondeurReelle || 0),
                          0
                        )}{" "}
                        m
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Operations Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Phase Filter */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">
                Filter by Phase:
              </span>
              <select
                value={selectedPhaseForOperations || "all"}
                onChange={(e) =>
                  setSelectedPhaseForOperations(
                    e.target.value === "all" ? null : parseInt(e.target.value)
                  )
                }
                className="border border-orange-500 rounded px-3 py-1 bg-white"
              >
                <option value="all">All Operations</option>
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    Phase {phase.numeroPhase} -{" "}
                    {DiametreLabels[phase.diametre] || phase.diametre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b">
                <th className="py-4 px-6 text-left font-semibold flex items-center">
                  Operation <span className="ml-2">↓</span>
                </th>
                <th className="py-4 px-6 text-left font-semibold">Type</th>
                <th className="py-4 px-6 text-left font-semibold">
                  Planned Cost (DZD)
                </th>
                <th className="py-4 px-6 text-left font-semibold">
                  Actual Cost (DZD)
                </th>
                <th className="py-4 px-6 text-left font-semibold">Status</th>
                <th className="py-4 px-6 text-left font-semibold">Phase</th>
              </tr>
            </thead>
            <tbody>
              {getOperationsToDisplay().length > 0 ? (
                getOperationsToDisplay().map((operation) => (
                  <tr
                    key={operation.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      {operation.description || "No description"}
                    </td>
                    <td className="py-4 px-6">
                      {operation.typeOperation?.nom || "Unknown"}
                    </td>
                    <td className="py-4 px-6">
                      {operation.coutPrev
                        ? `${operation.coutPrev.toLocaleString()}`
                        : "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      {operation.coutReel
                        ? `${operation.coutReel.toLocaleString()}`
                        : "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          operation.statut === "TERMINE"
                            ? "bg-green-100 text-green-800"
                            : operation.statut === "EN_COURS"
                            ? "bg-yellow-100 text-yellow-800"
                            : operation.statut === "PROBLEME"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {operation.statut}
                      </span>
                    </td>
                    <td className="py-4 px-6">{operation.phaseName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No operations found for the selected criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phase Detail Popup */}
      {phasePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">
                Phase {phasePopup.numeroPhase} -{" "}
                {DiametreLabels[phasePopup.diametre] || phasePopup.diametre}
              </h3>
              <button
                onClick={closePopup}
                className="text-gray-500 bg-white hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex">
                <span className="w-1/3 font-medium">Status:</span>
                <span
                  className={`${
                    getPhaseStatus(phasePopup) === "completed"
                      ? "text-green-600"
                      : getPhaseStatus(phasePopup) === "in-progress"
                      ? "text-yellow-600"
                      : "text-gray-500"
                  }`}
                >
                  {getStatusLabel(getPhaseStatus(phasePopup))}
                </span>
              </div>

              <div className="flex">
                <span className="w-1/3 font-medium">Planned Start:</span>
                <span>{phasePopup.dateDebutPrevue || "Not defined"}</span>
              </div>

              <div className="flex">
                <span className="w-1/3 font-medium">Actual Start:</span>
                <span>{phasePopup.dateDebutReelle || "Not started"}</span>
              </div>

              <div className="flex">
                <span className="w-1/3 font-medium">Planned End:</span>
                <span>{phasePopup.dateFinPrevue || "Not defined"}</span>
              </div>

              <div className="flex">
                <span className="w-1/3 font-medium">Actual End:</span>
                <span>{phasePopup.dateFinReelle || "Not completed"}</span>
              </div>

              <div className="flex">
                <span className="w-1/3 font-medium">Planned Depth:</span>
                <span>
                  {phasePopup.profondeurPrevue
                    ? `${phasePopup.profondeurPrevue} m`
                    : "Not defined"}
                </span>
              </div>

              <div className="flex">
                <span className="w-1/3 font-medium">Actual Depth:</span>
                <span>
                  {phasePopup.profondeurReelle
                    ? `${phasePopup.profondeurReelle} m`
                    : "Not reached"}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Description:</h4>
              <p className="text-gray-700">
                {phasePopup.description || "No description available"}
              </p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={closePopup}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
