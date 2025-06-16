import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, Plus, Trash2 } from "lucide-react";

export default function DailyReportForm() {
  const { id: puitId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [puit, setPuit] = useState(null);
  const [phases, setPhases] = useState([]);
  const [forage, setForage] = useState(null);
  const [typeOperations, setTypeOperations] = useState([]);
  const [typeIndicateurs, setTypeIndicateurs] = useState([]);

  const [formData, setFormData] = useState({
    reportName: "",
    reportDate: new Date().toISOString().split("T")[0],
    concernedWell: null,
    currentPhase: null,
    currentDepth: "",
    lithology: "",
    dailyCost: "",
    isPhaseCompleted: false,
    operations: [],
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch puit data
        const puitResponse = await fetch(
          `http://localhost:8080/api/puits/${puitId}`
        );
        const puitData = await puitResponse.json();
        if (puitData.success) {
          setPuit(puitData.data);
          setFormData((prev) => ({
            ...prev,
            concernedWell: puitData.data,
          }));
        }

        // Fetch forage for this puit
        const forageResponse = await fetch(
          `http://localhost:8080/api/forages/puit/${puitId}`
        );
        const forageData = await forageResponse.json();
        if (forageData.success && forageData.data.length > 0) {
          setForage(forageData.data[0]); // Assuming one active forage per puit

          // Fetch phases for this forage
          const phasesResponse = await fetch(
            `http://localhost:8080/api/phases/forage/${forageData.data[0].id}`
          );
          const phasesData = await phasesResponse.json();
          if (phasesData.success) {
            setPhases(phasesData.data);
          }
        }

        // Fetch type operations
        const typeOpsResponse = await fetch(
          "http://localhost:8080/api/type-operations"
        );
        const typeOpsData = await typeOpsResponse.json();
        if (typeOpsData.success) {
          setTypeOperations(typeOpsData.data);
        }

        // Fetch type indicateurs
        const typeIndResponse = await fetch(
          "http://localhost:8080/api/type-indicateurs"
        );
        const typeIndData = await typeIndResponse.json();
        if (typeIndData.success) {
          setTypeIndicateurs(typeIndData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error loading data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (puitId) {
      fetchData();
    }
  }, [puitId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle phase selection
  const handlePhaseChange = (e) => {
    const phaseId = e.target.value;
    const selectedPhase = phases.find((p) => p.id.toString() === phaseId);
    setFormData({
      ...formData,
      currentPhase: selectedPhase,
    });
  };

  // Handle operation status toggle
  const handleOperationStatusChange = (operationId) => {
    const updatedOperations = [...formData.operations];
    const operationIndex = updatedOperations.findIndex(
      (op) => op.id === operationId
    );
    if (operationIndex !== -1) {
      updatedOperations[operationIndex].status =
        !updatedOperations[operationIndex].status;
      setFormData({
        ...formData,
        operations: updatedOperations,
      });
    }
  };

  // Handle operation cost change
  const handleCostChange = (operationId, value) => {
    const updatedOperations = [...formData.operations];
    const operationIndex = updatedOperations.findIndex(
      (op) => op.id === operationId
    );
    if (operationIndex !== -1) {
      updatedOperations[operationIndex].coutReel = parseFloat(value) || 0;
      setFormData({
        ...formData,
        operations: updatedOperations,
      });
    }
  };

  // Handle operation type change
  const handleOperationTypeChange = (operationId, typeCode) => {
    const updatedOperations = [...formData.operations];
    const operationIndex = updatedOperations.findIndex(
      (op) => op.id === operationId
    );
    if (operationIndex !== -1) {
      const selectedType = typeOperations.find((t) => t.code === typeCode);
      updatedOperations[operationIndex].typeOperation = selectedType;
      setFormData({
        ...formData,
        operations: updatedOperations,
      });
    }
  };

  // Handle operation description change
  const handleOperationDescriptionChange = (operationId, value) => {
    const updatedOperations = [...formData.operations];
    const operationIndex = updatedOperations.findIndex(
      (op) => op.id === operationId
    );
    if (operationIndex !== -1) {
      updatedOperations[operationIndex].description = value;
      setFormData({
        ...formData,
        operations: updatedOperations,
      });
    }
  };

  // Add new operation
  const addOperation = () => {
    const newId = Date.now(); // Temporary ID for UI

    const newOperation = {
      id: newId,
      status: "PLANIFIE",
      description: "",
      typeOperation: typeOperations[0] || null,
      coutReel: 0,
      phase: formData.currentPhase,
      statut: "PLANIFIE",
      indicators: [],
    };

    setFormData({
      ...formData,
      operations: [...formData.operations, newOperation],
    });
  };

  // Remove operation
  const removeOperation = (operationId) => {
    const updatedOperations = formData.operations.filter(
      (op) => op.id !== operationId
    );
    setFormData({
      ...formData,
      operations: updatedOperations,
    });
  };

  // Add indicator to operation
  const addIndicator = (operationId) => {
    const updatedOperations = [...formData.operations];
    const operationIndex = updatedOperations.findIndex(
      (op) => op.id === operationId
    );

    if (operationIndex !== -1) {
      const newIndicatorId = Date.now();
      updatedOperations[operationIndex].indicators.push({
        id: newIndicatorId,
        typeIndicateur: typeIndicateurs[0] || null,
        valeurReelle: "",
        commentaire: "",
      });

      setFormData({
        ...formData,
        operations: updatedOperations,
      });
    }
  };

  // Remove indicator from operation
  const removeIndicator = (operationId, indicatorId) => {
    const updatedOperations = [...formData.operations];
    const operationIndex = updatedOperations.findIndex(
      (op) => op.id === operationId
    );

    if (operationIndex !== -1) {
      updatedOperations[operationIndex].indicators = updatedOperations[
        operationIndex
      ].indicators.filter((ind) => ind.id !== indicatorId);

      setFormData({
        ...formData,
        operations: updatedOperations,
      });
    }
  };

  // Handle indicator changes
  const handleIndicatorChange = (operationId, indicatorId, field, value) => {
    const updatedOperations = [...formData.operations];
    const operationIndex = updatedOperations.findIndex(
      (op) => op.id === operationId
    );

    if (operationIndex !== -1) {
      const indicatorIndex = updatedOperations[
        operationIndex
      ].indicators.findIndex((ind) => ind.id === indicatorId);

      if (indicatorIndex !== -1) {
        updatedOperations[operationIndex].indicators[indicatorIndex][field] =
          value;

        setFormData({
          ...formData,
          operations: updatedOperations,
        });
      }
    }
  };

  // Handle indicator type change
  const handleIndicatorTypeChange = (operationId, indicatorId, typeId) => {
    const selectedType = typeIndicateurs.find(
      (t) => t.id.toString() === typeId
    );
    handleIndicatorChange(
      operationId,
      indicatorId,
      "typeIndicateur",
      selectedType
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reportName.trim()) {
      alert("Please enter a report name");
      return;
    }

    if (!formData.currentPhase) {
      alert("Please select a current phase");
      return;
    }

    try {
      setSaving(true);

      // Check if this is the first daily report for this puit
      const existingReportsResponse = await fetch(
        `http://localhost:8080/api/daily-reports?puitId=${puitId}`
      );
      const existingReportsData = await existingReportsResponse.json();
      const isFirstDailyReport =
        !existingReportsData.success || existingReportsData.data.length === 0;

      // Prepare daily report data
      const dailyReportData = {
        reportName: formData.reportName,
        reportDate: formData.reportDate,
        concernedWell: { id: parseInt(puitId) },
        currentPhase: formData.currentPhase,
        currentDepth: parseFloat(formData.currentDepth) || 0,
        lithology: formData.lithology,
        dailyCost: parseFloat(formData.dailyCost) || 0,
      };

      // Create daily report
      const dailyReportResponse = await fetch(
        "http://localhost:8080/api/daily-reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dailyReportData),
        }
      );

      const dailyReportResult = await dailyReportResponse.json();

      if (!dailyReportResult.success) {
        throw new Error(
          dailyReportResult.message || "Failed to create daily report"
        );
      }

      const createdDailyReport = dailyReportResult.data;

      // Calculate total operations cost
      let totalOperationsCost = 0;

      // Create operations and indicators
      for (const operation of formData.operations) {
        if (operation.status === "PLANIFIE" || operation.status) {
          // Only create active operations
          const operationData = {
            description: operation.description,
            phase: formData.currentPhase,
            typeOperation: operation.typeOperation,
            statut: operation.status === true ? "TERMINE" : operation.status,
            coutReel: operation.coutReel || 0,
            coutPrev: operation.coutReel || 0,
            dailyReport: { id: createdDailyReport.id },
          };

          // Add to total operations cost
          totalOperationsCost += operation.coutReel || 0;

          const operationResponse = await fetch(
            "http://localhost:8080/api/operations",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(operationData),
            }
          );

          const operationResult = await operationResponse.json();

          if (operationResult.success && operation.indicators.length > 0) {
            // Create indicators for this operation
            for (const indicator of operation.indicators) {
              if (indicator.typeIndicateur && indicator.valeurReelle) {
                const indicatorData = {
                  operation: { id: operationResult.data.id },
                  typeIndicateur: indicator.typeIndicateur,
                  valeurReelle: parseFloat(indicator.valeurReelle) || 0,
                  commentaire: indicator.commentaire,
                  dateMesure: new Date().toISOString(),
                  dailyReport: { id: createdDailyReport.id },
                };

                await fetch("http://localhost:8080/api/indicateurs", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(indicatorData),
                });
              }
            }
          }
        }
      }

      // Update forage data
      if (forage) {
        const updatedForage = { ...forage };

        // If this is the first daily report, set the forage start date
        if (isFirstDailyReport) {
          updatedForage.date_debut = formData.reportDate;
        }

        // Add daily cost and operations cost to forage cost
        const totalDailyCost =
          (parseFloat(formData.dailyCost) || 0) + totalOperationsCost;
        updatedForage.cout = (updatedForage.cout || 0) + totalDailyCost;

        await fetch(`http://localhost:8080/api/forages/${forage.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedForage),
        });
      }

      // Update current phase
      if (formData.currentPhase && formData.currentDepth) {
        console.log("=== PHASE UPDATE LOGIC ===");
        console.log("Current phase:", formData.currentPhase);
        console.log("Current depth:", formData.currentDepth);
        console.log("Report date:", formData.reportDate);
        console.log("Phase completed:", formData.isPhaseCompleted);

        // Check if this is the first daily report for this phase
        const phaseReportsResponse = await fetch(
          `http://localhost:8080/api/daily-reports?puitId=${puitId}`
        );
        const phaseReportsData = await phaseReportsResponse.json();

        let isFirstReportForPhase = true;
        if (phaseReportsData.success && phaseReportsData.data.length > 0) {
          // Check if any existing report uses this phase (excluding the one we just created)
          console.log(
            "Checking existing reports for phase:",
            phaseReportsData.data
          );
          console.log("Current phase ID:", formData.currentPhase.id);
          isFirstReportForPhase = !phaseReportsData.data.some(
            (report) =>
              report.id !== createdDailyReport.id &&
              report.currentPhase?.id === formData.currentPhase.id
          );
        }

        console.log("Is first report for phase:", isFirstReportForPhase);

        // Create phase update payload with all existing data plus new data
        const updatedPhase = {
          id: formData.currentPhase.id,
          forage: { id: forage.id },
          numeroPhase: formData.currentPhase.numeroPhase,
          diametre: formData.currentPhase.diametre,
          description: formData.currentPhase.description,
          dateDebutPrevue: formData.currentPhase.dateDebutPrevue,
          dateFinPrevue: formData.currentPhase.dateFinPrevue,
          profondeurPrevue: formData.currentPhase.profondeurPrevue,
          // Preserve existing real data
          dateFinReelle: formData.currentPhase.dateFinReelle,
          // Update profondeurReelle with current depth
          profondeurReelle: parseFloat(formData.currentDepth),
        };

        // If this is the first daily report for this phase, set the real start date
        if (isFirstReportForPhase) {
          console.log("Setting dateDebutReelle to:", formData.reportDate);
          updatedPhase.dateDebutReelle = formData.reportDate; // This should already be in YYYY-MM-DD format
        } else {
          // Preserve existing dateDebutReelle
          updatedPhase.dateDebutReelle = formData.currentPhase.dateDebutReelle;
        }

        // If phase is marked as completed, set the real end date
        if (formData.isPhaseCompleted) {
          console.log(
            "Phase marked as completed, setting dateFinReelle to:",
            formData.reportDate
          );
          updatedPhase.dateFinReelle = formData.reportDate; // This should already be in YYYY-MM-DD format
        }

        console.log("Phase update payload:", updatedPhase);

        try {
          const phaseUpdateResponse = await fetch(
            `http://localhost:8080/api/phases/${formData.currentPhase.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(updatedPhase),
            }
          );

          console.log(
            "Phase update response status:",
            phaseUpdateResponse.status
          );
          console.log(
            "Phase update response headers:",
            Object.fromEntries(phaseUpdateResponse.headers.entries())
          );

          if (!phaseUpdateResponse.ok) {
            const errorText = await phaseUpdateResponse.text();
            console.error("Phase update failed - Response text:", errorText);
            throw new Error(
              `Phase update failed: ${phaseUpdateResponse.status} - ${errorText}`
            );
          }

          const phaseUpdateResult = await phaseUpdateResponse.json();
          console.log("Phase update response:", phaseUpdateResult);

          if (!phaseUpdateResult.success) {
            console.error("Failed to update phase:", phaseUpdateResult.message);
            alert(
              "Warning: Phase data could not be updated - " +
                phaseUpdateResult.message
            );
          } else {
            console.log("Phase updated successfully");
            console.log("Updated phase data returned:", phaseUpdateResult.data);
          }
        } catch (phaseUpdateError) {
          console.error("Error updating phase:", phaseUpdateError);
          console.error("Phase update error stack:", phaseUpdateError.stack);
          alert(
            "Warning: Error updating phase data - " + phaseUpdateError.message
          );
        }
      }

      alert("Daily report created successfully!");
      navigate(`/welldetails/${puitId}/`);
    } catch (error) {
      console.error("Error creating daily report:", error);
      alert("Error creating daily report: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle form discard
  const handleDiscard = () => {
    navigate(`/puits/${puitId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 text-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Daily Report</h1>
        <p className="text-gray-600">
          Complete the daily report for {puit?.nom}
        </p>
      </div>

      <div className="space-y-6">
        {/* General Information */}
        <div className="bg-white rounded-lg p-6 border shadow-md border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            General Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Report Name
              </label>
              <input
                type="text"
                name="reportName"
                value={formData.reportName}
                onChange={handleInputChange}
                className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Report Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Report Date
              </label>
              <input
                type="date"
                name="reportDate"
                value={formData.reportDate}
                onChange={handleInputChange}
                className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                style={{ colorScheme: "light" }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Well
              </label>
              <input
                type="text"
                value={puit?.nom || "Loading..."}
                className="bg-gray-100 w-full border border-gray-300 rounded px-3 py-2 text-gray-900 cursor-not-allowed"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Daily Report Details */}
        <div className="bg-white rounded-lg p-6 border shadow-md border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Daily Report Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-900">
                Current Phase
              </label>
              <div className="relative">
                <select
                  value={formData.currentPhase?.id || ""}
                  onChange={handlePhaseChange}
                  className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                  required
                >
                  <option value="">Select a phase</option>
                  {phases.map((phase) => (
                    <option key={phase.id} value={phase.id}>
                      Phase {phase.numeroPhase} -{" "}
                      {phase.diametre?.replace("POUCES_", "").replace("_", " ")}{" "}
                      - {phase.description}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-900">
                Current Depth (m)
              </label>
              <input
                type="number"
                name="currentDepth"
                value={formData.currentDepth}
                onChange={handleInputChange}
                className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="0"
                step="0.1"
                style={{ colorScheme: "light" }}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-900">
                Lithology
              </label>
              <input
                type="text"
                name="lithology"
                value={formData.lithology}
                onChange={handleInputChange}
                className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Rock formation description"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-900">
                Daily Cost (DZD)
              </label>
              <input
                type="number"
                name="dailyCost"
                value={formData.dailyCost}
                onChange={handleInputChange}
                className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="0"
                step="0.01"
                style={{ colorScheme: "light" }}
              />
            </div>
          </div>

          {/* Phase Completion Checkbox */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="phaseCompleted"
                name="isPhaseCompleted"
                checked={formData.isPhaseCompleted}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isPhaseCompleted: e.target.checked,
                  })
                }
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label
                htmlFor="phaseCompleted"
                className="text-sm font-medium text-gray-900"
              >
                Mark this phase as completed
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-7">
              Check this box if the current phase operations are finished with
              this daily report. This will set the real end date and final depth
              for the phase.
            </p>
          </div>
        </div>

        {/* Operations Section */}
        <div className="bg-white rounded-lg p-6 border shadow-md border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Operations Performed
            </h2>
            <button
              type="button"
              onClick={addOperation}
              className="bg-orange-500 text-white hover:bg-orange-600 hover:text-gray-900 transition-all duration-200 flex items-center px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <Plus size={16} className="mr-1" /> Add Operation
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-7">
            Add all operations performed on this day and specify their details
            and costs.
          </p>

          <div className="space-y-4">
            {formData.operations.map((operation) => (
              <div
                key={operation.id}
                className="border border-gray-200 rounded-lg p-4 bg-white relative"
              >
                <button
                  type="button"
                  onClick={() => removeOperation(operation.id)}
                  className="absolute bg-white border-none top-2 right-3 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 mb-3">
                  <div className="flex items-center space-x-3 col-span-1">
                    <div className="flex-col items-center justify-between w-20">
                      <span className="text-sm text-gray-900">Status</span>
                      <button
                        type="button"
                        className={`flex h-6 w-12 mt-2 items-center rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none ${
                          operation.status === true ||
                          operation.status === "TERMINE"
                            ? "bg-orange-500 justify-end"
                            : "bg-gray-300 justify-start"
                        }`}
                        onClick={() =>
                          handleOperationStatusChange(operation.id)
                        }
                      >
                        <span className="h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out" />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm mb-1 text-gray-900">
                      Operation Type
                    </label>
                    <div className="relative">
                      <select
                        value={operation.typeOperation?.code || ""}
                        onChange={(e) =>
                          handleOperationTypeChange(
                            operation.id,
                            e.target.value
                          )
                        }
                        className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                      >
                        <option value="">Select operation type</option>
                        {typeOperations.map((type) => (
                          <option key={type.code} value={type.code}>
                            {type.nom}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm mb-1 text-gray-900">
                      Description
                    </label>
                    <input
                      type="text"
                      value={operation.description}
                      onChange={(e) =>
                        handleOperationDescriptionChange(
                          operation.id,
                          e.target.value
                        )
                      }
                      className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="Operation description"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm mb-1 text-gray-900">
                      Cost (DZD)
                    </label>
                    <input
                      type="number"
                      value={operation.coutReel}
                      onChange={(e) =>
                        handleCostChange(operation.id, e.target.value)
                      }
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="0"
                      step="0.01"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                </div>

                {/* Indicators Section */}
                <div className="mt-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Indicators
                    </h3>
                    <button
                      type="button"
                      onClick={() => addIndicator(operation.id)}
                      className="text-orange-500 bg-white hover:text-orange-600 transition-all duration-200 flex items-center text-sm"
                    >
                      <Plus size={16} className="mr-1" /> Add Indicator
                    </button>
                  </div>

                  <div className="space-y-2">
                    {operation.indicators.map((indicator) => (
                      <div
                        key={indicator.id}
                        className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                      >
                        <div className="relative">
                          <select
                            value={indicator.typeIndicateur?.id || ""}
                            onChange={(e) =>
                              handleIndicatorTypeChange(
                                operation.id,
                                indicator.id,
                                e.target.value
                              )
                            }
                            className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none text-sm"
                          >
                            <option value="">Select indicator type</option>
                            {typeIndicateurs.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.nom}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <input
                          type="number"
                          value={indicator.valeurReelle}
                          onChange={(e) =>
                            handleIndicatorChange(
                              operation.id,
                              indicator.id,
                              "valeurReelle",
                              e.target.value
                            )
                          }
                          className="bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                          placeholder="Value"
                          step="0.01"
                        />
                        <input
                          type="text"
                          value={indicator.commentaire}
                          onChange={(e) =>
                            handleIndicatorChange(
                              operation.id,
                              indicator.id,
                              "commentaire",
                              e.target.value
                            )
                          }
                          className="bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                          placeholder="Comment"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeIndicator(operation.id, indicator.id)
                          }
                          className="text-white hover:text-red-500 transition-colors p-2 rounded"
                          style={{ backgroundColor: "#FF8500" }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 mt-8">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-8 py-2.5 bg-white border border-orange-300 text-orange-500 rounded-md hover:bg-orange-50 transition-all duration-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-10 py-2.5 bg-orange-500 text-gray-900 rounded-md hover:bg-orange-600 hover:text-gray-900 transition-all duration-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-600 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
