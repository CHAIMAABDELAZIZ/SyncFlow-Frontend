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

// Sample data structure with additional well depth information
const wellData = {
  name: "Well-A103",
  period: "Jun 1 - Aug 31, 2025",
  progress: {
    countdown: 168,
    completed: 298,
    total: 498,
    begin: "29-04-25",
    completion: "29-04-25",
  },
  details: {
    openedRequest: 27800,
    engaged: 27800,
    eoiSent: 27800,
    percentages: [8, 32, 60],
    flowPoints: [4, 21, 12],
  },
  phases: [
    {
      id: 1,
      name: '26"',
      status: "on-track",
      color: "bg-green-500",
      description: "Surface hole section - Completed on time with no issues",
      startDate: "15-04-25",
      endDate: "20-04-25",
      duration: "5 days",
      plannedDepth: "306 ft",
      actualDepth: "306 ft",
    },
    {
      id: 2,
      name: '16"',
      status: "on-track",
      color: "bg-green-500",
      description:
        "Intermediate casing section - Successfully installed and cemented",
      startDate: "21-04-25",
      endDate: "25-04-25",
      duration: "4 days",
      plannedDepth: "2746 ft",
      actualDepth: "2746 ft",
    },
    {
      id: 3,
      name: '12"1/4',
      status: "under-surveillance",
      color: "bg-yellow-500",
      description:
        "Production hole section - Currently in progress with identified issues under monitoring",
      startDate: "26-04-25",
      endDate: "TBD",
      duration: "In progress",
      plannedDepth: "6250 ft",
      actualDepth: "6137 ft",
    },
    {
      id: 4,
      name: "8 1/2",
      status: "alert",
      color: "bg-red-500",
      description:
        "Final drilling section - Critical issues detected requiring immediate attention",
      startDate: "01-05-25",
      endDate: "TBD",
      duration: "In progress",
      plannedDepth: "9454 ft",
      actualDepth: "8800 ft",
    },
  ],
  reservoirs: [
    { id: 1, name: "R1", depth: "9000 ft" },
    { id: 2, name: "R2", depth: "8700 ft" },
    { id: 3, name: "R3", depth: "8400 ft" },
  ],
  totalDepth: {
    planned: "TD 9454 ft",
    actual: "TD 9450 ft",
  },
  phaseOperations: {
    1: [
      {
        name: "Surface Drilling",
        cost: "45k$",
        provisional: "40k$",
        variance: "on-track",
        progress: 100,
        members: 3,
      },
      {
        name: "Casing Installation",
        cost: "35k$",
        provisional: "30k$",
        variance: "on-track",
        progress: 100,
        members: 2,
      },
    ],
    2: [
      {
        name: "Intermediate Drilling",
        cost: "6500000",
        provisional: "6000000",
        variance: "on-track",
        progress: 100,
        members: 4,
      },
      {
        name: "Cementing Operations",
        cost: "4000000",
        provisional: "3500000",
        variance: "under-surveillance",
        progress: 100,
        members: 3,
      },
    ],
    3: [
      {
        name: "Production Drilling",
        cost: "120k$",
        provisional: "100k$",
        variance: "under-surveillance",
        progress: 75,
        members: 5,
      },
      {
        name: "Mud Circulation",
        cost: "25k$",
        provisional: "20k$",
        variance: "under-surveillance",
        progress: 80,
        members: 2,
      },
    ],
    4: [
      {
        name: "Final Section Drilling",
        cost: "180k$",
        provisional: "120k$",
        variance: "Alert",
        progress: 45,
        members: 6,
      },
      {
        name: "Logging Operations",
        cost: "75k$",
        provisional: "50k$",
        variance: "Alert",
        progress: 30,
        members: 3,
      },
      {
        name: "Completion Prep",
        cost: "95k$",
        provisional: "70k$",
        variance: "Alert",
        progress: 20,
        members: 4,
      },
    ],
  },
  operations: [
    {
      name: "Operation 1",
      cost: "50k$",
      provisional: "45k$",
      variance: "on-track",
      progress: 50,
      members: 3,
    },
    {
      name: "Operation 2",
      cost: "60k$",
      provisional: "50k$",
      variance: "under-surveillance",
      progress: 60,
      members: 4,
    },
    {
      name: "Operation 3",
      cost: "100k$",
      provisional: "50k$",
      variance: "Alert",
      progress: 80,
      members: 2,
    },
    {
      name: "Operation 4",
      cost: "220k$",
      provisional: "50k$",
      variance: "Alert",
      progress: 20,
      members: 5,
    },
    {
      name: "Operation 5",
      cost: "45k$",
      provisional: "50k$",
      variance: "on-track",
      progress: 50,
      members: 1,
    },
    {
      name: "Operation 6",
      cost: "50k$",
      provisional: "50k$",
      variance: "on-track",
      progress: 90,
      members: 3,
    },
  ],
};

const getStatusColor = (status) => {
  switch (status) {
    case "on-track":
      return "bg-green-500";
    case "under-surveillance":
      return "bg-orange-400";
    case "alert":
      return "bg-red-500";
    case "undone":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "on-track":
      return "En bonne voie";
    case "under-surveillance":
      return "Sous surveillance";
    case "alert":
      return "Alerte";
    case "undone":
      return "Non commencé";
    default:
      return "Inconnu";
  }
};

export default function WellDetail() {
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [phasePopup, setPhasePopup] = useState(null);
  const [activeTab, setActiveTab] = useState("phases"); // 'phases' or 'comparison'
  const [selectedPhaseForOperations, setSelectedPhaseForOperations] =
    useState(null);
  const { id } = useParams();
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

  const getOperationsToDisplay = () => {
    if (
      selectedPhaseForOperations &&
      wellData.phaseOperations[selectedPhaseForOperations]
    ) {
      return wellData.phaseOperations[selectedPhaseForOperations];
    }
    return wellData.operations;
  };

  const [well, setWell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWell = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/puits/${id}`
        );
        if (response.data.success) {
          setWell(response.data.data);
        } else {
          setError("Aucune donnée trouvée pour ce puits");
        }
      } catch (err) {
        setError("Erreur lors de la récupération du puits");
      } finally {
        setLoading(false);
      }
    };

    fetchWell();
  }, [id]);

  const navigate = useNavigate();

  return (
    <div className="flex text-black flex-col gap-6 p-6 bg-white min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">#{wellData.name}</h1>
          <div className="text-gray-600">{wellData.period}</div>
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
          {/* Carte Détails du puits (en dessous, pleine largeur) */}
          <div className="w-full bg-white text-black rounded-xl p-6 shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Détails du Puits</h1>
            {loading ? (
              <p>Chargement en cours...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : well ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">Nom : {well.nom}</h2>
                </div>

                {well.coord_y && well.coord_x ? (
                  <div className="h-[300px] w-full rounded shadow border">
                    <MapContainer
                      center={[well.coord_y, well.coord_x]}
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
              </>
            ) : (
              <p>Puits introuvable.</p>
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
                  {wellData.progress.countdown} days
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>Completed:</div>
                <div className="font-bold text-2xl">
                  {wellData.progress.completed} days
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>Total days:</div>
                <div className="font-bold text-lg">
                  {wellData.progress.total} days
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>Begin:</div>
                <div>{wellData.progress.begin}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>Completion:</div>
                <div>{wellData.progress.completion}</div>
              </div>
            </div>

            {/* Details and Graph */}
            <div className="w-1/2 bg-white rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Details</h2>
                <button className="text-gray-500 hover:text-gray-700 bg-white text-xl">
                  ⋮
                </button>
              </div>

              <div className="relative h-40">
                <div className="absolute top-0 left-0 w-full flex justify-between px-6 text-sm font-medium">
                  <div className="bg-gray-800 text-white px-3 py-1 rounded-full">
                    {wellData.details.percentages[0]}%
                  </div>
                  <div className="bg-gray-800 text-white px-3 py-1 rounded-full">
                    {wellData.details.percentages[1]}%
                  </div>
                  <div className="bg-gray-800 text-white px-3 py-1 rounded-full">
                    {wellData.details.percentages[2]}%
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-32">
                  <div className="w-full h-full relative overflow-hidden">
                    <div
                      className="absolute w-full h-full transition-all duration-300 hover:opacity-90"
                      style={{
                        background:
                          "linear-gradient(to right, #4ade80 0%, #fbbf24 50%, #ef4444 100%)",
                      }}
                    />
                    <div className="absolute top-0 left-[4%] w-px h-full border-l-2 border-dashed border-gray-800"></div>
                    <div className="absolute top-0 left-[21%] w-px h-full border-l-2 border-dashed border-gray-800"></div>
                    <div className="absolute top-0 left-[72%] w-px h-full border-l-2 border-dashed border-gray-800"></div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full flex justify-between px-12 text-sm text-gray-700">
                  <div>{wellData.details.flowPoints[0]}%</div>
                  <div>{wellData.details.flowPoints[1]}%</div>
                  <div>{wellData.details.flowPoints[2]}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phases Tracking - Now below Progress and Details */}
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
            // Realistic Well Visualization
            <div className="relative flex justify-center h-96 bg-gray-100 rounded-lg p-4">
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
                {/* 26" Phase - Surface casing */}
                <div
                  onClick={() => handlePhaseClick(wellData.phases[0])}
                  className="cursor-pointer transition-all hover:opacity-80 relative"
                  style={{ width: "120px", height: "80px" }}
                >
                  {/* Outer casing */}
                  <div
                    className={`absolute inset-0 ${getStatusColor(
                      wellData.phases[0].status
                    )} border-4 border-gray-800`}
                  ></div>
                  {/* Inner hole */}
                  <div className="absolute inset-2 bg-gray-300"></div>
                  {/* Phase label */}
                  <div className="absolute  -right-28 top-1/2 transform -translate-y-1/2 font-bold text-gray-800">
                    26"
                  </div>
                  <div className="absolute -left-24 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">
                    306 ft
                  </div>
                </div>

                {/* 16" Phase - Intermediate casing */}
                <div
                  onClick={() => handlePhaseClick(wellData.phases[1])}
                  className="cursor-pointer transition-all hover:opacity-80 relative"
                  style={{ width: "100px", height: "100px" }}
                >
                  {/* Outer casing */}
                  <div
                    className={`absolute inset-0 ${getStatusColor(
                      wellData.phases[1].status
                    )} border-4 border-gray-800`}
                  ></div>
                  {/* Inner hole */}
                  <div className="absolute inset-3 bg-gray-300"></div>
                  {/* Phase label */}
                  <div className="absolute -right-28 top-1/2 transform -translate-y-1/2 font-bold text-gray-800">
                    16"
                  </div>
                  <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">
                    2746 ft
                  </div>
                </div>

                {/* 12"1/4 Phase - Production casing */}
                <div
                  onClick={() => handlePhaseClick(wellData.phases[2])}
                  className="cursor-pointer transition-all hover:opacity-80 relative"
                  style={{ width: "80px", height: "120px" }}
                >
                  {/* Outer casing */}
                  <div
                    className={`absolute inset-0 ${getStatusColor(
                      wellData.phases[2].status
                    )} border-4 border-gray-800`}
                  ></div>
                  {/* Inner hole */}
                  <div className="absolute inset-4 bg-gray-300"></div>
                  {/* Phase label */}
                  <div className="absolute -right-28 top-1/2 transform -translate-y-1/2 font-bold text-gray-800">
                    12"1/4
                  </div>
                  <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">
                    6137 ft
                  </div>
                </div>

                {/* 8 1/2 Phase - Final drilling section */}
                <div
                  onClick={() => handlePhaseClick(wellData.phases[3])}
                  className="cursor-pointer transition-all hover:opacity-80 relative"
                  style={{ width: "60px", height: "100px" }}
                >
                  {/* Outer casing */}
                  <div
                    className={`absolute inset-0 ${getStatusColor(
                      wellData.phases[3].status
                    )} border-4 border-gray-800`}
                  ></div>
                  {/* Inner hole */}
                  <div className="absolute inset-3 bg-gray-300"></div>
                  {/* Phase label */}
                  <div className="flex gap-2 ">
                    {/* Reservoir markers */}
                    <div className="absolute -right-16 top-2 flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-2 bg-yellow-400 border border-gray-800"></div>
                        <span className="text-xs">R3</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-2 bg-yellow-400 border border-gray-800"></div>
                        <span className="text-xs">R2</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-2 bg-yellow-400 border border-gray-800"></div>
                        <span className="text-xs">R1</span>
                      </div>
                    </div>

                    <div className="absolute  -right-32 top-1/2 transform -translate-y-1/2 font-bold text-gray-800">
                      8 1/2
                    </div>
                  </div>
                  <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">
                    8800 ft
                  </div>
                </div>

                {/* Bottom section with reservoirs */}
                <div
                  className="relative"
                  style={{ width: "40px", height: "40px" }}
                >
                  {/* Final well section
                  <div className="absolute inset-0 bg-gray-400 border-4 border-gray-800"></div>
                  <div className="absolute inset-2 bg-white"></div> */}

                  {/* TD marker */}
                  <div className="absolute -left-40 bottom-0 text-sm font-bold text-gray-800">
                    TD 9450 ft
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-800 bg-gray-400"></div>
                  <span className="text-xs">Undone</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-800 bg-green-500"></div>
                  <span className="text-xs">on-track</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-800 bg-orange-400"></div>
                  <span className="text-xs">under-surveillance</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-800 bg-red-500"></div>
                  <span className="text-xs">Alert</span>
                </div>
              </div>
            </div>
          ) : (
            // Comparison View (Prévision vs Réel)
            <div className="relative h-[480px] bg-gray-100 rounded-lg p-4">
              {/* Title */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 font-bold text-lg text-gray-800 ">
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

              {/* Well sections */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex justify-center">
                {/* Left side - Prévision */}
                <div className="flex flex-col items-end mr-8">
                  {/* 26" section */}
                  <div className="relative mb-2">
                    <div className="w-8 h-12 bg-yellow-300 border-2 border-black flex items-center justify-center">
                      <div className="h-8 bg-gray-200 border border-yellow-300"></div>
                    </div>
                    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 text-sm">
                      306 ft
                    </div>
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-black"></div>
                  </div>

                  {/* 16" section */}
                  <div className="relative mb-2">
                    <div className="w-6 h-16 bg-yellow-300 border-2 border-black flex items-center justify-center">
                      <div className="h-12 bg-gray-200 border border-yellow-300"></div>
                    </div>
                    <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 text-sm">
                      2746 ft
                    </div>
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-black"></div>
                  </div>

                  {/* 12"1/4 section */}
                  <div className="relative mb-2">
                    <div className="w-4 h-20 bg-yellow-300 border-2 border-black flex items-center justify-center">
                      <div className="h-16 bg-gray-200 border border-yellow-300"></div>
                    </div>
                    <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 text-sm">
                      6250 ft
                    </div>
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-black"></div>
                  </div>

                  {/* 8 1/2 section */}
                  <div className="relative mb-4">
                    <div className="w-3 h-16 bg-yellow-300 border-2 border-black flex items-center justify-center">
                      <div className="h-12 bg-gray-200 border border-yellow-300"></div>
                    </div>
                    <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 text-sm">
                      9454 ft
                    </div>
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-black"></div>
                  </div>

                  {/* Reservoirs */}
                  <div className="relative">
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">R3</span>
                        <div className="w-12 h-3 bg-yellow-300 border border-black"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">R2</span>
                        <div className="w-12 h-3 bg-yellow-300 border border-black"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">R1</span>
                        <div className="w-12 h-3 bg-yellow-300 border border-black"></div>
                      </div>
                    </div>
                  </div>

                  {/* TD */}
                  <div className="mt-4 text-sm">TD 9454 ft</div>
                </div>

                {/* Central line */}
                <div className="w-0.5 h-72 bg-black mx-4"></div>

                {/* Right side - Réel */}
                <div className="flex flex-col items-start ml-8">
                  {/* 26" section */}
                  <div className="relative mb-2">
                    <div className="w-8 h-12 bg-green-500 border-2 border-black flex items-center justify-center">
                      <div className="h-8 bg-gray-200 border border-green-500"></div>
                    </div>
                    <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 text-sm">
                      306 ft
                    </div>
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-black"></div>
                  </div>

                  {/* 16" section */}
                  <div className="relative mb-2">
                    <div className="w-6 h-16 bg-green-500 border-2 border-black flex items-center justify-center">
                      <div className="h-12 bg-gray-200 border border-green-500"></div>
                    </div>
                    <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 text-sm">
                      2746 ft
                    </div>
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-black"></div>
                  </div>

                  {/* 12"1/4 section */}
                  <div className="relative mb-2">
                    <div className="w-4 h-20 bg-yellow-500 border-2 border-black flex items-center justify-center">
                      <div className="h-16 bg-gray-200 border border-yellow-500"></div>
                    </div>
                    <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 text-sm">
                      6137 ft
                    </div>
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-black"></div>
                  </div>

                  {/* 8 1/2 section */}
                  <div className="relative mb-4">
                    <div className="w-3 h-16 bg-red-500 border-2 border-black flex items-center justify-center">
                      <div className="h-12 bg-gray-200 border border-red-500"></div>
                    </div>
                    <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 text-sm">
                      8800 ft
                    </div>
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-black"></div>
                  </div>

                  {/* Reservoirs */}
                  <div className="relative">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-3 bg-green-500 border border-black"></div>
                        <span className="text-xs font-bold text-blue-600">
                          +
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-3 bg-green-500 border border-black"></div>
                        <span className="text-xs font-bold text-blue-600">
                          +
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-3 bg-green-500 border border-black"></div>
                        <span className="text-xs font-bold text-blue-600">
                          -
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TD */}
                  <div className="mt-4 text-sm">TD 9450 ft</div>
                </div>
              </div>

              {/* <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                <div className="w-8 h-8 flex items-center justify-center text-2xl text-green-600 font-bold">
                  ←
                </div>
              </div> */}
            </div>
          )}
        </div>

        {/* Operations Table - Now below Phases Tracking */}
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
                className="border  border-orangePtrm rounded px-3 py-1 bg-white"
              >
                <option value="all">All Operations</option>
                <option value="1">26" Phase</option>
                <option value="2">16" Phase</option>
                <option value="3">12"1/4 Phase</option>
                <option value="4">8 1/2 Phase</option>
              </select>
            </div>
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b">
                <th className="py-4 px-6 text-left font-semibold flex items-center">
                  Operation <span className="ml-2">↓</span>
                </th>
                <th className="py-4 px-6 text-left font-semibold">
                  Costs(DZD)
                </th>
                <th className="py-4 px-6 text-left font-semibold">
                  Provisional costs
                </th>
                <th className="py-4 px-6 text-left font-semibold">Status</th>
                <th className="py-4 px-6 text-left font-semibold">
                  Operation progress
                </th>
                <th className="py-4 px-6 text-left font-semibold">
                  Members <span className="ml-2">👤</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {getOperationsToDisplay().map((op, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">Operation name</td>
                  <td className="py-4 px-6">{op.cost}</td>
                  <td className="py-4 px-6">{op.provisional}</td>
                  <td className="py-4 px-6">
                    <span
                      className={
                        op.variance === "Alert"
                          ? "bg-red-100 text-red-700 px-3 py-1 rounded-full"
                          : op.variance === "under-surveillance"
                          ? "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full"
                          : "bg-green-100 text-green-800 px-3 py-1 rounded-full"
                      }
                    >
                      {op.variance}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-3 w-32">
                          <div
                            className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${op.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-gray-600">{op.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex">
                      {Array.from({ length: op.members }).map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 bg-gray-300 rounded-full -ml-1 border border-white flex items-center justify-center text-xs"
                        >
                          👤
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phase Detail Popup */}
      {phasePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Phase: {phasePopup.name}</h3>
              <button
                onClick={closePopup}
                className="text-gray-500 bg-white hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <div className="flex">
                <span className="w-1/3 font-medium">Status:</span>
                <span
                  className={`${
                    phasePopup.status === "done"
                      ? "text-green-600"
                      : "text-orange-500"
                  }`}
                >
                  {phasePopup.status === "done" ? "Completed" : "In Progress"}
                </span>
              </div>

              <div className="flex mt-2">
                <span className="w-1/3 font-medium">Start Date:</span>
                <span>{phasePopup.startDate}</span>
              </div>

              <div className="flex mt-2">
                <span className="w-1/3 font-medium">End Date:</span>
                <span>{phasePopup.endDate}</span>
              </div>

              <div className="flex mt-2">
                <span className="w-1/3 font-medium">Duration:</span>
                <span>{phasePopup.duration}</span>
              </div>

              <div className="flex mt-2">
                <span className="w-1/3 font-medium">Planned Depth:</span>
                <span>{phasePopup.plannedDepth}</span>
              </div>

              <div className="flex mt-2">
                <span className="w-1/3 font-medium">Actual Depth:</span>
                <span>{phasePopup.actualDepth}</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Description:</h4>
              <p className="text-gray-700">{phasePopup.description}</p>
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
