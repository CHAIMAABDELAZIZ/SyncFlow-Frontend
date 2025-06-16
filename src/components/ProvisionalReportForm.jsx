import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { PhaseAPI, OperationAPI, ForageAPI } from "../apiService";

// Phase and Operation status mappings
const DiametreLabels = {
  POUCES_26: '26"',
  POUCES_16: '16"',
  POUCES_12_25: '12 1/4"',
  POUCES_8_5: '8 1/2"',
};

const OperationStatutLabels = {
  PLANIFIE: "Planifié",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  PROBLEME: "Problème",
  ANNULE: "Annulé",
};

// Add missing mappings
const sizeToDiametre = {
  '26"': "POUCES_26",
  '16"': "POUCES_16",
  '12 1/4"': "POUCES_12_25",
  '8 1/2"': "POUCES_8_5",
};

const diametreToSize = Object.fromEntries(
  Object.entries(sizeToDiametre).map(([k, v]) => [v, k])
);

export default function ProvisionalReportForm() {
  const { wellId } = useParams();
  const [forageId, setForageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalOperations, setOriginalOperations] = useState({});
  const [originalPhases, setOriginalPhases] = useState({});
  const [activeTab, setActiveTab] = useState("form"); // 'form', 'phases', 'operations'
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [phases, setPhases] = useState([]);
  const [operations, setOperations] = useState([]);

  // New state for TypeOperations
  const [typeOperations, setTypeOperations] = useState([]);
  const [typeOperationsLoading, setTypeOperationsLoading] = useState(true);

  const inputStyle = {
    backgroundColor: "white",
  };

  const [dateErrors, setDateErrors] = useState({
    phases: [{}, {}, {}, {}],
  });

  const [formData, setFormData] = useState({
    title: "",
    phases: [
      {
        number: 1,
        size: '26"',
        description: "",
        startDate: "",
        endDate: "",
        plannedDepth: "",
        operations: [],
      },
      {
        number: 2,
        size: '16"',
        description: "",
        startDate: "",
        endDate: "",
        plannedDepth: "",
        operations: [],
      },
      {
        number: 3,
        size: '12 1/4"',
        description: "",
        startDate: "",
        endDate: "",
        plannedDepth: "",
        operations: [],
      },
      {
        number: 4,
        size: '8 1/2"',
        description: "",
        startDate: "",
        endDate: "",
        plannedDepth: "",
        operations: [],
      },
    ],
  });

  // Utility to debounce a function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch TypeOperations
  useEffect(() => {
    const fetchTypeOperations = async () => {
      try {
        setTypeOperationsLoading(true);
        const response = await axios.get(
          "http://localhost:8080/api/type-operations"
        );

        if (response.data.success && Array.isArray(response.data.data)) {
          setTypeOperations(response.data.data);
          console.log("TypeOperations loaded:", response.data.data);
        } else {
          console.warn(
            "Invalid TypeOperations response structure:",
            response.data
          );
          setTypeOperations([]);
        }
      } catch (err) {
        console.error("Error fetching TypeOperations:", err);
        setError("Failed to load operation types");
        setTypeOperations([]);
      } finally {
        setTypeOperationsLoading(false);
      }
    };

    fetchTypeOperations();
  }, []);

  // Enhanced data fetching
  useEffect(() => {
    const fetchForageAndReportData = async () => {
      try {
        if (!wellId || isNaN(wellId)) {
          throw new Error(`Invalid wellId: ${wellId}`);
        }
        const puitIdNumber = Number(wellId);

        // Fetch forage data using new API
        const forageResponse = await ForageAPI.getByPuitId(puitIdNumber);
        if (!forageResponse.success || !forageResponse.data.length) {
          throw new Error("No forages found for this well.");
        }
        const currentForageId = forageResponse.data[0].id;
        setForageId(currentForageId);

        // Fetch phases using new API
        const phasesResponse = await PhaseAPI.getByForage(currentForageId);
        if (phasesResponse.success && phasesResponse.data.length) {
          setPhases(phasesResponse.data);

          // Fetch operations for each phase
          const allOperations = [];
          const originalOps = {};
          const originalPhasesData = {};

          const fetchedPhases = await Promise.all(
            phasesResponse.data.map(async (phase) => {
              const opsResponse = await OperationAPI.getByPhase(phase.id);
              const phaseOperations = opsResponse.success
                ? opsResponse.data
                : [];

              // Store original operations by phaseId
              originalOps[phase.id] = phaseOperations.map((op) => ({
                id: op.id,
                cost: op.coutPrev || 0,
              }));

              // Store original phase dates and planned depth by phaseId
              originalPhasesData[phase.id] = {
                startDate: phase.dateDebutPrevue
                  ? phase.dateDebutPrevue.split("T")[0]
                  : "",
                endDate: phase.dateFinPrevue
                  ? phase.dateFinPrevue.split("T")[0]
                  : "",
                plannedDepth: phase.profondeurPrevue || "",
              };

              // Add to all operations with phase info
              allOperations.push(
                ...phaseOperations.map((op) => ({
                  ...op,
                  phaseId: phase.id,
                  phaseName: `${phase.numeroPhase} - ${
                    DiametreLabels[phase.diametre] || phase.diametre
                  }`,
                }))
              );

              return {
                number: phase.numeroPhase || 0,
                size: diametreToSize[phase.diametre] || "",
                description: phase.description || "",
                startDate: phase.dateDebutPrevue
                  ? phase.dateDebutPrevue.split("T")[0]
                  : "",
                endDate: phase.dateFinPrevue
                  ? phase.dateFinPrevue.split("T")[0]
                  : "",
                plannedDepth: phase.profondeurPrevue || "",
                operations: phaseOperations.map((op, index) => ({
                  id: op.id || index + 1,
                  name:
                    op.typeOperation?.nom ||
                    op.description ||
                    "Unknown Operation",
                  code: op.typeOperation?.code || null,
                  cost: op.coutPrev || 0,
                  status: op.statut === "PLANIFIE" || op.statut === "EN_COURS",
                  isNew: false,
                })),
              };
            })
          );

          setOperations(allOperations);
          setOriginalOperations(originalOps);
          setOriginalPhases(originalPhasesData);

          // Merge fetched phases with default phases
          const updatedPhases = formData.phases.map((defaultPhase) => {
            const fetchedPhase = fetchedPhases.find(
              (p) => p.number === defaultPhase.number
            );
            return fetchedPhase || defaultPhase;
          });

          setFormData((prev) => ({
            ...prev,
            title: `Report for Well #${puitIdNumber}`,
            phases: updatedPhases,
          }));
        } else {
          console.log("No phases found, using default form data");
          setFormData((prev) => ({
            ...prev,
            title: `Report for Well #${puitIdNumber}`,
          }));
        }
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForageAndReportData();
  }, [wellId]);

  // Phase status determination
  const getPhaseStatus = (phase) => {
    const now = new Date();
    const startDate = phase.dateDebutReelle || phase.dateDebutPrevue;
    const endDate = phase.dateFinReelle || phase.dateFinPrevue;

    if (!startDate) return "not-started";
    if (new Date(startDate) > now) return "scheduled";
    if (!endDate || new Date(endDate) > now) return "in-progress";
    return "completed";
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

  const getOperationStatusColor = (statut) => {
    const colors = {
      PLANIFIE: "#ffd700",
      EN_COURS: "#1890ff",
      TERMINE: "#52c41a",
      PROBLEME: "#ff4d4f",
      ANNULE: "#d9d9d9",
    };
    return colors[statut] || "#d9d9d9";
  };

  const validateDates = (phases, phaseIndex, dateType, newValue) => {
    const newErrors = { ...dateErrors };
    const updatedPhase = { ...phases[phaseIndex] };

    if (dateType === "startDate") {
      updatedPhase.startDate = newValue;
    } else {
      updatedPhase.endDate = newValue;
    }

    newErrors.phases[phaseIndex] = {};

    if (updatedPhase.startDate && updatedPhase.endDate) {
      if (new Date(updatedPhase.endDate) <= new Date(updatedPhase.startDate)) {
        newErrors.phases[phaseIndex].endDate =
          "End date must be after start date";
      }
    }

    if (phaseIndex > 0) {
      const previousPhase = phases[phaseIndex - 1];
      if (previousPhase.endDate && updatedPhase.startDate) {
        if (
          new Date(updatedPhase.startDate) < new Date(previousPhase.endDate)
        ) {
          newErrors.phases[phaseIndex].startDate = `Phase ${
            phaseIndex + 1
          } must start after Phase ${phaseIndex} ends`;
        }
      }
    }

    if (phaseIndex < phases.length - 1 && updatedPhase.endDate) {
      const nextPhase = phases[phaseIndex + 1];
      if (nextPhase.startDate) {
        if (new Date(nextPhase.startDate) < new Date(updatedPhase.endDate)) {
          newErrors.phases[phaseIndex + 1].startDate = `Phase ${
            phaseIndex + 2
          } must start after Phase ${phaseIndex + 1} ends`;
        }
      }
    }

    setDateErrors(newErrors);
    return newErrors;
  };

  const validateAllDates = () => {
    let hasErrors = false;
    const newErrors = { phases: [{}, {}, {}, {}] };

    formData.phases.forEach((phase, index) => {
      if (phase.startDate && phase.endDate) {
        if (new Date(phase.endDate) <= new Date(phase.startDate)) {
          newErrors.phases[index].endDate = "End date must be after start date";
          hasErrors = true;
        }
      }

      if (index > 0) {
        const prevPhase = formData.phases[index - 1];
        if (prevPhase.endDate && phase.startDate) {
          if (new Date(phase.startDate) < new Date(prevPhase.endDate)) {
            newErrors.phases[index].startDate = `Phase ${
              index + 1
            } must start after Phase ${index} ends`;
            hasErrors = true;
          }
        }
      }
    });

    setDateErrors(newErrors);
    return !hasErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhaseDescriptionChange = (phaseIndex, newDescription) => {
    setFormData((prev) => {
      const newPhases = [...prev.phases];
      newPhases[phaseIndex].description = newDescription;
      return { ...prev, phases: newPhases };
    });
  };

  const handlePlannedDepthChange = (phaseIndex, value) => {
    setFormData((prev) => {
      const newPhases = [...prev.phases];
      newPhases[phaseIndex].plannedDepth = value;
      return { ...prev, phases: newPhases };
    });
  };

  const handleDateChange = (phaseIndex, dateType, value) => {
    const updatedPhases = [...formData.phases];
    updatedPhases[phaseIndex][dateType] = value;
    validateDates(updatedPhases, phaseIndex, dateType, value);
    setFormData((prev) => ({ ...prev, phases: updatedPhases }));
  };

  const handleOperationStatusChange = (phaseIndex, operationId) => {
    setFormData((prev) => {
      const updatedPhases = [...prev.phases];
      const operation = updatedPhases[phaseIndex].operations.find(
        (op) => op.id === operationId
      );
      if (operation) operation.status = !operation.status;
      return { ...prev, phases: updatedPhases };
    });
  };

  const handleCostChange = (phaseIndex, operationId, value) => {
    const cost = Number(value);
    if (isNaN(cost) || cost < 0) {
      alert("Cost must be a non-negative number");
      return;
    }
    setFormData((prev) => {
      const updatedPhases = [...prev.phases];
      const operation = updatedPhases[phaseIndex].operations.find(
        (op) => op.id === operationId
      );
      if (operation) operation.cost = cost;
      return { ...prev, phases: updatedPhases };
    });
  };

  const getTypeOperationByCode = (code) => {
    return typeOperations.find((type) => type.code === code);
  };

  const getTypeOperationByName = (name) => {
    return typeOperations.find((type) => type.nom === name);
  };

  const handleOperationNameChange = (phaseIndex, operationId, value) => {
    setFormData((prev) => {
      const updatedPhases = [...prev.phases];
      const operation = updatedPhases[phaseIndex].operations.find(
        (op) => op.id === operationId
      );
      if (operation) {
        const selectedTypeOperation = getTypeOperationByName(value);
        operation.name = value;
        operation.code = selectedTypeOperation?.code || null;
      }
      return { ...prev, phases: updatedPhases };
    });
  };

  const addOperation = debounce((phaseIndex) => {
    console.log(`Adding operation to phase ${phaseIndex}`);
    setFormData((prev) => {
      const updatedPhases = [...prev.phases];
      const newId =
        Math.max(
          0,
          ...prev.phases.flatMap((phase) => phase.operations.map((op) => op.id))
        ) + 1;

      // Use first available TypeOperation if any exist
      const defaultTypeOperation =
        typeOperations.length > 0 ? typeOperations[0] : null;

      updatedPhases[phaseIndex].operations.push({
        id: newId,
        status: true,
        name: defaultTypeOperation?.nom || "",
        code: defaultTypeOperation?.code || null,
        cost: 0,
        isNew: true,
      });
      return { ...prev, phases: updatedPhases };
    });
  }, 300);

  const deleteOperation = (phaseIndex, operationId) => {
    setFormData((prev) => {
      const updatedPhases = [...prev.phases];
      updatedPhases[phaseIndex].operations = updatedPhases[
        phaseIndex
      ].operations.filter((op) => op.id !== operationId);
      return { ...prev, phases: updatedPhases };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllDates()) {
      alert("Please fix date errors before submitting");
      return;
    }

    if (!forageId) {
      alert("Forage ID not available. Please try again.");
      return;
    }

    try {
      // Fetch existing phases
      const existingPhasesResponse = await axios.get(
        `http://localhost:8080/api/phases/forage/${forageId}`
      );
      const existingPhases = existingPhasesResponse.data.success
        ? existingPhasesResponse.data.data
        : [];

      console.log("Existing phases from database:", existingPhases);

      const createdPhases = [];
      let operationsUpdated = false;
      let phasesUpdated = false;
      const invalidOperations = [];

      for (const [phaseIndex, phase] of formData.phases.entries()) {
        // Skip phases that have no data (empty description, no dates, no operations)
        const hasPhaseData =
          phase.description ||
          phase.startDate ||
          phase.endDate ||
          (phase.operations && phase.operations.length > 0);

        if (!hasPhaseData) {
          console.log(`Skipping phase ${phase.number} - no data to save`);
          continue;
        }

        // Look for existing phase by phase number (not by ID)
        const existingPhase = existingPhases.find(
          (p) => p.numeroPhase === phase.number
        );

        console.log(
          `Phase ${phase.number}: existing phase found:`,
          existingPhase
        );

        let phaseId;
        let currentPhaseData = null;

        if (existingPhase) {
          // Phase exists - update it if needed
          phaseId = existingPhase.id;
          currentPhaseData = existingPhase;

          console.log(
            `Found existing phase ${phase.number} with ID: ${phaseId}`
          );

          // Check for changes in description, dates, or planned depth
          const originalPhase = originalPhases[phaseId] || {
            startDate: existingPhase.dateDebutPrevue
              ? existingPhase.dateDebutPrevue.split("T")[0]
              : "",
            endDate: existingPhase.dateFinPrevue
              ? existingPhase.dateFinPrevue.split("T")[0]
              : "",
            plannedDepth: existingPhase.profondeurPrevue || "",
          };

          const descriptionChanged =
            (phase.description || "") !== (existingPhase.description || "");
          const startDateChanged = phase.startDate !== originalPhase.startDate;
          const endDateChanged = phase.endDate !== originalPhase.endDate;
          const plannedDepthChanged =
            parseFloat(phase.plannedDepth || 0) !==
            parseFloat(originalPhase.plannedDepth || 0);

          if (
            descriptionChanged ||
            startDateChanged ||
            endDateChanged ||
            plannedDepthChanged
          ) {
            const phasePayload = {
              id: phaseId,
              forage: { id: forageId },
              numeroPhase: phase.number,
              diametre: sizeToDiametre[phase.size],
              dateDebutPrevue: phase.startDate || null,
              dateFinPrevue: phase.endDate || null,
              profondeurPrevue: parseFloat(phase.plannedDepth) || null,
              description: phase.description || "",
            };

            console.log(
              `Updating existing phase ${phase.number}:`,
              `description changed: ${descriptionChanged},`,
              `start date changed: ${startDateChanged} (${originalPhase.startDate} -> ${phase.startDate}),`,
              `end date changed: ${endDateChanged} (${originalPhase.endDate} -> ${phase.endDate})`,
              `planned depth changed: ${plannedDepthChanged} (${originalPhase.plannedDepth} -> ${phase.plannedDepth})`,
              "Payload:",
              phasePayload
            );

            try {
              const phaseResponse = await axios.put(
                `http://localhost:8080/api/phases/${phaseId}`,
                phasePayload
              );
              if (!phaseResponse.data.success) {
                console.warn(`Failed to update phase ${phase.number}`);
                invalidOperations.push(
                  `Phase ${phase.number}: Failed to update phase`
                );
              } else {
                phasesUpdated = true;
                currentPhaseData = phaseResponse.data.data;
                console.log(`Successfully updated phase ${phase.number}`);

                // Update originalPhases with new values
                setOriginalPhases((prev) => ({
                  ...prev,
                  [phaseId]: {
                    startDate: phase.startDate,
                    endDate: phase.endDate,
                    plannedDepth: phase.plannedDepth,
                  },
                }));
              }
            } catch (phaseError) {
              console.error("Phase update error:", {
                error: phaseError,
                response: phaseError.response,
                data: phaseError.response?.data,
                status: phaseError.response?.status,
                statusText: phaseError.response?.statusText,
                payload: phasePayload,
              });
              invalidOperations.push(
                `Phase ${phase.number}: Error updating phase - ${
                  phaseError.response?.data?.message || phaseError.message
                }`
              );
              continue; // Skip to next phase if update fails
            }
          } else {
            console.log(
              `No changes detected for existing phase ${phase.number}, skipping update`
            );
          }
        } else {
          // Phase doesn't exist - create new one
          console.log(`Creating new phase ${phase.number}`);

          const phasePayload = {
            forage: { id: forageId },
            numeroPhase: phase.number,
            diametre: sizeToDiametre[phase.size],
            dateDebutPrevue: phase.startDate || null,
            dateFinPrevue: phase.endDate || null,
            profondeurPrevue: parseFloat(phase.plannedDepth) || null,
            description: phase.description || "",
          };

          console.log("Creating phase with payload:", phasePayload);

          try {
            const phaseResponse = await axios.post(
              "http://localhost:8080/api/phases",
              phasePayload
            );

            console.log("Phase creation response:", phaseResponse.data);

            if (!phaseResponse.data.success) {
              console.warn(
                `Failed to create phase ${phase.number}`,
                phaseResponse.data
              );
              invalidOperations.push(
                `Phase ${phase.number}: Failed to create phase - ${
                  phaseResponse.data.message || "Unknown error"
                }`
              );
              continue;
            }
            phaseId = phaseResponse.data.data.id;
            currentPhaseData = phaseResponse.data.data;
            createdPhases.push(phaseResponse.data.data);
            console.log(
              `Successfully created phase ${phase.number} with ID: ${phaseId}`
            );

            // Store original dates and planned depth for new phase
            setOriginalPhases((prev) => ({
              ...prev,
              [phaseId]: {
                startDate: phase.startDate,
                endDate: phase.endDate,
                plannedDepth: phase.plannedDepth,
              },
            }));
          } catch (phaseError) {
            console.error("Phase creation error:", {
              error: phaseError,
              response: phaseError.response,
              data: phaseError.response?.data,
              status: phaseError.response?.status,
              statusText: phaseError.response?.statusText,
              payload: phasePayload,
              requestUrl: "http://localhost:8080/api/phases",
              requestMethod: "POST",
            });

            let errorMessage = "Unknown error";
            if (phaseError.response?.data?.message) {
              errorMessage = phaseError.response.data.message;
            } else if (phaseError.response?.data?.error) {
              errorMessage = phaseError.response.data.error;
            } else if (phaseError.message) {
              errorMessage = phaseError.message;
            }

            invalidOperations.push(
              `Phase ${phase.number}: Error creating phase - ${errorMessage}`
            );
            continue;
          }
        }

        // Handle operations for the phase - only after phase is properly created/updated
        if (phase.operations?.length > 0 && currentPhaseData && phaseId) {
          // Validate phase timing before creating operations
          if (phase.startDate && new Date(phase.startDate) < new Date()) {
            console.warn(
              `Phase ${phase.number} start date is in the past, operations will be created with current timestamp`
            );
          }

          try {
            const existingOpsResponse = await axios.get(
              `http://localhost:8080/api/operations/phase/${phaseId}`
            );
            const existingOps = existingOpsResponse.data.success
              ? existingOpsResponse.data.data
              : [];

            console.log(
              `Processing ${phase.operations.length} operations for phase ${phase.number} (ID: ${phaseId})`
            );

            for (const operation of phase.operations) {
              // Enhanced operation validation using TypeOperations
              if (!operation.name || !operation.code) {
                invalidOperations.push(
                  `Phase ${phase.number}: Operation "${
                    operation.name || "No name"
                  }" is invalid or not selected`
                );
                console.warn(
                  `Invalid operation in phase ${phase.number}: "${
                    operation.name || "No name"
                  }"`
                );
                continue;
              }

              // Verify the operation type exists in our TypeOperations
              const typeOperation = getTypeOperationByCode(operation.code);
              if (!typeOperation) {
                invalidOperations.push(
                  `Phase ${phase.number}: Operation type "${operation.name}" (${operation.code}) not found in system`
                );
                console.warn(
                  `Type d'opération non trouvé : ${operation.name} (${operation.code})`
                );
                continue;
              }

              // Ensure cost is a number and non-negative
              const cost = Number(operation.cost) || 0;
              if (cost < 0) {
                invalidOperations.push(
                  `Phase ${phase.number}: Operation "${operation.name}" has invalid cost (${operation.cost})`
                );
                console.warn(
                  `Invalid cost for operation "${operation.name}" in phase ${phase.number}: ${operation.cost}`
                );
                continue;
              }

              const operationPayload = {
                phase: { id: phaseId },
                description:
                  operation.name || `Opération Phase ${phase.number}`,
                coutPrev: cost,
                coutReel: 0,
                statut: operation.status ? "PLANIFIE" : "TERMINE",
                typeOperation: { code: operation.code },
                createdBy: { id: 1 }, // TODO: Adapt to use logged-in user
              };

              // For provisional operations, don't set createdAt - let backend handle timing based on phase dates
              if (operation.status && phase.startDate) {
                console.log(
                  `Operation "${operation.name}" will be timed according to phase ${phase.number} start date: ${phase.startDate}`
                );
              }

              // Check if operation is new (added by user) or existing
              const isNew =
                operation.isNew ||
                !existingOps.some((op) => op.id === operation.id);

              if (isNew) {
                // Create new operation
                console.log(
                  `Creating operation "${operation.name}" in phase ${phase.number} with cost: ${cost}`,
                  "Payload:",
                  operationPayload
                );

                try {
                  const opResponse = await fetch(
                    "http://localhost:8080/api/operations",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                      },
                      body: JSON.stringify(operationPayload),
                    }
                  );

                  console.log(
                    "Operation creation response status:",
                    opResponse.status
                  );
                  console.log(
                    "Operation creation response headers:",
                    Object.fromEntries(opResponse.headers.entries())
                  );

                  if (!opResponse.ok) {
                    // Read the response once and handle errors
                    let errorMessage = "Unknown error";
                    let fullErrorData = null;

                    try {
                      const errorData = await opResponse.json();
                      console.error("Full error response:", errorData);
                      fullErrorData = errorData;
                      errorMessage =
                        errorData.message || errorData.error || errorMessage;
                    } catch (jsonError) {
                      console.error(
                        "Failed to parse JSON error response:",
                        jsonError
                      );
                      // If JSON parsing fails, try to get text
                      try {
                        const textError = await opResponse.text();
                        console.error("Error response text:", textError);
                        errorMessage = textError || errorMessage;
                      } catch (textError) {
                        console.error(
                          "Failed to read error response:",
                          textError
                        );
                        errorMessage = `HTTP ${opResponse.status}: ${opResponse.statusText}`;
                      }
                    }

                    console.error("Operation creation failed:", {
                      status: opResponse.status,
                      statusText: opResponse.statusText,
                      errorMessage,
                      fullErrorData,
                      payload: operationPayload,
                      url: "http://localhost:8080/api/operations",
                      method: "POST",
                    });

                    invalidOperations.push(
                      `Phase ${phase.number}: Failed to create operation "${operation.name}" - ${errorMessage}`
                    );
                    console.warn(
                      `❌ Échec création opération : ${errorMessage}`
                    );
                  } else {
                    const responseData = await opResponse.json();
                    console.log(
                      "Operation creation success response:",
                      responseData
                    );
                    const newOperationId = responseData.data?.id;
                    const returnedCost = responseData.data?.coutPrev;
                    const createdAt = responseData.data?.createdAt;
                    console.log(
                      `Created operation "${operation.name}" in phase ${phase.number} with ID: ${newOperationId}, cost: ${returnedCost}, createdAt: ${createdAt}`
                    );

                    // Update formData with backend-assigned ID and cost
                    if (newOperationId) {
                      setFormData((prev) => {
                        const updatedPhases = [...prev.phases];
                        const newOp = updatedPhases[phaseIndex].operations.find(
                          (op) => op.id === operation.id
                        );
                        if (newOp) {
                          newOp.id = newOperationId;
                          newOp.isNew = false;
                          newOp.cost = Number(returnedCost) || cost;
                        }
                        return { ...prev, phases: updatedPhases };
                      });
                    }
                    operationsUpdated = true;
                  }
                } catch (fetchError) {
                  console.error("Network error during operation creation:", {
                    error: fetchError,
                    message: fetchError.message,
                    operation: operation.name,
                    phase: phase.number,
                    payload: operationPayload,
                    stack: fetchError.stack,
                  });

                  invalidOperations.push(
                    `Phase ${phase.number}: Network error creating operation "${operation.name}" - ${fetchError.message}`
                  );
                  console.warn(`❌ Network error: ${fetchError.message}`);
                }
              } else {
                // Check for cost change in existing operation
                const originalOp = originalOperations[phaseId]?.find(
                  (op) => op.id === operation.id
                );
                if (originalOp && originalOp.cost !== cost) {
                  // Update operation via PUT if cost has changed
                  console.log(
                    `Updating operation "${operation.name}" in phase ${phase.number} with new cost: ${cost} (original: ${originalOp.cost})`
                  );
                  const updatePayload = {
                    ...operationPayload,
                    id: operation.id,
                  };

                  try {
                    const opResponse = await axios.put(
                      `http://localhost:8080/api/operations/${operation.id}`,
                      updatePayload
                    );
                    if (!opResponse.data.success) {
                      console.warn(
                        `Failed to update operation: ${operation.name}`
                      );
                      invalidOperations.push(
                        `Phase ${phase.number}: Failed to update operation "${operation.name}"`
                      );
                    } else {
                      const returnedCost = opResponse.data.data?.coutPrev;
                      console.log(
                        `Updated operation "${operation.name}" in phase ${phase.number} with cost: ${returnedCost}`
                      );

                      // Update formData with backend cost
                      setFormData((prev) => {
                        const updatedPhases = [...prev.phases];
                        const updatedOp = updatedPhases[
                          phaseIndex
                        ].operations.find((op) => op.id === operation.id);
                        if (updatedOp) {
                          updatedOp.cost = Number(returnedCost) || cost;
                        }
                        return { ...prev, phases: updatedPhases };
                      });
                      operationsUpdated = true;
                    }
                  } catch (updateError) {
                    console.error("Operation update error:", {
                      error: updateError,
                      response: updateError.response,
                      data: updateError.response?.data,
                      status: updateError.response?.status,
                      statusText: updateError.response?.statusText,
                      payload: updatePayload,
                    });
                    invalidOperations.push(
                      `Phase ${phase.number}: Error updating operation "${
                        operation.name
                      }" - ${
                        updateError.response?.data?.message ||
                        updateError.message
                      }`
                    );
                  }
                } else {
                  console.log(
                    `No changes detected for operation "${operation.name}" in phase ${phase.number}`
                  );
                }
              }
            }
          } catch (operationsError) {
            console.error("Error fetching existing operations:", {
              error: operationsError,
              response: operationsError.response,
              data: operationsError.response?.data,
              status: operationsError.response?.status,
              statusText: operationsError.response?.statusText,
              phaseId,
            });
            invalidOperations.push(
              `Phase ${phase.number}: Error fetching existing operations - ${
                operationsError.response?.data?.message ||
                operationsError.message
              }`
            );
          }
        }
      }

      // Provide feedback to the user
      if (invalidOperations.length > 0) {
        alert(
          `Some operations or phases could not be saved:\n${invalidOperations.join(
            "\n"
          )}`
        );
      } else if (
        createdPhases.length > 0 ||
        operationsUpdated ||
        phasesUpdated
      ) {
        alert(
          `Successfully processed: ${
            createdPhases.length
          } new phases created, ${
            operationsUpdated
              ? "operations updated/created"
              : "no operations changed"
          }, and ${
            phasesUpdated ? "existing phases updated" : "no phase updates"
          }.`
        );
      } else {
        alert("No changes were made to phases or operations.");
      }
    } catch (err) {
      console.error("Submission error details:", {
        error: err,
        message: err.message,
        response: err.response,
        responseData: err.response?.data,
        responseStatus: err.response?.status,
        responseStatusText: err.response?.statusText,
        responseHeaders: err.response?.headers,
        stack: err.stack,
        config: err.config,
      });

      // Enhanced error message for user
      let userErrorMessage = `Error: ${err.message}`;
      if (err.response?.data?.message) {
        userErrorMessage += `\nServer message: ${err.response.data.message}`;
      }
      if (err.response?.status) {
        userErrorMessage += `\nStatus: ${err.response.status}`;
      }

      alert(userErrorMessage);
    }
  };

  const handleDiscard = () => {
    setFormData({
      title: "",
      phases: [
        {
          number: 1,
          size: '26"',
          description: "",
          startDate: "",
          endDate: "",
          plannedDepth: "",
          operations: [],
        },
        {
          number: 2,
          size: '16"',
          description: "",
          startDate: "",
          endDate: "",
          plannedDepth: "",
          operations: [],
        },
        {
          number: 3,
          size: '12 1/4"',
          description: "",
          startDate: "",
          endDate: "",
          plannedDepth: "",
          operations: [],
        },
        {
          number: 4,
          size: '8 1/2"',
          description: "",
          startDate: "",
          endDate: "",
          plannedDepth: "",
          operations: [],
        },
      ],
    });
    setOriginalOperations({});
    setOriginalPhases({});
  };

  // Disable Save button if operations are invalid
  const hasInvalidOperations = formData.phases.some((phase) =>
    phase.operations.some(
      (op) =>
        !op.name ||
        !op.code ||
        !getTypeOperationByCode(op.code) ||
        isNaN(Number(op.cost)) ||
        Number(op.cost) < 0
    )
  );

  if (loading || typeOperationsLoading)
    return <div className="text-center py-6 text-gray-500">Loading...</div>;
  if (error)
    return <div className="text-center py-6 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Provisional Report</h1>
        <p className="text-gray-500">Jun 12 2025</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 ${
            activeTab === "form"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("form")}
        >
          Report Form
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 ${
            activeTab === "phases"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("phases")}
        >
          Phases Overview
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 ${
            activeTab === "operations"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("operations")}
        >
          Operations Management
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "form" && (
        <form onSubmit={handleSubmit}>
          {formData.phases.map((phase, phaseIndex) => (
            <div
              key={`phase-${phaseIndex}`}
              className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-4">
                Phase {phase.number} - Forage {phase.size}
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={phase.description}
                  onChange={(e) =>
                    handlePhaseDescriptionChange(phaseIndex, e.target.value)
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orange-500"
                  placeholder="Enter description for this phase"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm mb-1">
                    Date de début prévue
                  </label>
                  <input
                    type="date"
                    value={phase.startDate}
                    onChange={(e) =>
                      handleDateChange(phaseIndex, "startDate", e.target.value)
                    }
                    className={`w-full focus:outline-none focus:border-orange-500 border border-gray-300 rounded px-3 py-2 ${
                      dateErrors.phases[phaseIndex]?.startDate
                        ? "border-red-500"
                        : ""
                    }`}
                    style={{ ...inputStyle, colorScheme: "light" }}
                  />
                  {dateErrors.phases[phaseIndex]?.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {dateErrors.phases[phaseIndex].startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Date de fin prévue
                  </label>
                  <input
                    type="date"
                    value={phase.endDate}
                    onChange={(e) =>
                      handleDateChange(phaseIndex, "endDate", e.target.value)
                    }
                    className={`w-full focus:outline-none focus:border-orange-500 border border-gray-300 rounded px-3 py-2 ${
                      dateErrors.phases[phaseIndex]?.endDate
                        ? "border-red-500"
                        : ""
                    }`}
                    style={{ ...inputStyle, colorScheme: "light" }}
                  />
                  {dateErrors.phases[phaseIndex]?.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {dateErrors.phases[phaseIndex].endDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Profondeur prévue (m)
                  </label>
                  <input
                    type="number"
                    value={phase.plannedDepth || ""}
                    onChange={(e) =>
                      handlePlannedDepthChange(phaseIndex, e.target.value)
                    }
                    className="w-full focus:outline-none focus:border-orange-500 border border-gray-300 rounded px-3 py-2"
                    placeholder="0"
                    step="0.1"
                    style={{ ...inputStyle, colorScheme: "light" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Opérations prévues</h3>
                  <button
                    type="button"
                    onClick={() => addOperation(phaseIndex)}
                    disabled={typeOperations.length === 0}
                    className={`text-orange-500 bg-white hover:bg-orange-50 transition-all duration-200 flex items-center px-3 py-1.5 rounded-md shadow-sm border hover:border-1 focus:ring-1 focus:ring-orange-500 hover:border-orange-500 focus:outline-none border-orange-200 ${
                      typeOperations.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <span className="text-xl mr-1">+</span> Add operation
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-8">
                  Mentionner les opérations prévues pour cette phase et indiquer
                  leur coût prévisionnel
                </p>

                {typeOperations.length === 0 && (
                  <div className="text-center py-4 text-yellow-600 bg-yellow-50 rounded-md mb-4">
                    No operation types available. Please contact administrator
                    to add operation types.
                  </div>
                )}

                {phase.operations.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-12 bg-orange-500 text-white py-2 px-4 rounded-t-md">
                      <div className="col-span-2">Status</div>
                      <div className="col-span-5">Operation name</div>
                      <div className="col-span-4">Provisional cost</div>
                      <div className="col-span-1">Action</div>
                    </div>

                    {phase.operations.map((operation) => (
                      <div
                        key={`operation-${operation.id}`}
                        className="grid grid-cols-12 border-b border-x border-gray-200 py-2 px-4"
                      >
                        <div className="col-span-2 flex items-center">
                          <button
                            type="button"
                            className={`relative inline-flex h-7 w-14 items-center rounded-full ${
                              operation.status ? "bg-orange-500" : "bg-gray-300"
                            } transition-colors duration-200 ease-in-out focus:outline-none focus:ring-0`}
                            onClick={() =>
                              handleOperationStatusChange(
                                phaseIndex,
                                operation.id
                              )
                            }
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                                operation.status
                                  ? "translate-x-7"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        <div className="relative w-full col-span-5 flex items-center">
                          <select
                            value={operation.name}
                            onChange={(e) =>
                              handleOperationNameChange(
                                phaseIndex,
                                operation.id,
                                e.target.value
                              )
                            }
                            className="appearance-none w-full border border-gray-300 rounded-md pl-3 pr-10 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-150 ease-in-out shadow-sm"
                            style={inputStyle}
                          >
                            <option value="" disabled>
                              -- Sélectionnez une opération --
                            </option>
                            {typeOperations.map((typeOp) => (
                              <option key={typeOp.code} value={typeOp.nom}>
                                {typeOp.nom}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-3 text-gray-500">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="col-span-4 flex items-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={operation.cost}
                            onChange={(e) =>
                              handleCostChange(
                                phaseIndex,
                                operation.id,
                                e.target.value
                              )
                            }
                            className="w-24 border focus:outline-none focus:border-orange-500 border-gray-300 rounded px-3 py-1 text-right"
                            style={{ ...inputStyle, colorScheme: "light" }}
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              deleteOperation(phaseIndex, operation.id)
                            }
                            className="text-red-500 bg-white px-0 border-none focus:outline-none hover:text-red-800"
                            title="Supprimer l'opération"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mx-auto"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-1.5 text-gray-400">
                    No operations have been added yet.
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-center space-x-2">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-2"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={hasInvalidOperations}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasInvalidOperations ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Save
            </button>
          </div>
        </form>
      )}

      {activeTab === "phases" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Phases Overview</h2>
            <span className="text-gray-500">{phases.length} phases total</span>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="relative h-96">
              {phases.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  No phases found for this forage
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="space-y-4">
                    {phases.map((phase) => {
                      const status = getPhaseStatus(phase);
                      const diameter =
                        DiametreLabels[phase.diametre] || phase.diametre;
                      return (
                        <div
                          key={phase.id}
                          className={`relative p-4 border-2 rounded-lg cursor-pointer hover:shadow-md transition-all ${
                            selectedPhase === phase.id
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-300"
                          }`}
                          onClick={() =>
                            setSelectedPhase(
                              selectedPhase === phase.id ? null : phase.id
                            )
                          }
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-4 h-4 rounded-full ${getStatusColor(
                                status
                              )}`}
                            ></div>
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                Phase {phase.numeroPhase} - {diameter}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {phase.description}
                              </p>
                              <div className="text-xs text-gray-500 mt-1">
                                {phase.dateDebutPrevue &&
                                  `Start: ${phase.dateDebutPrevue}`}
                                {phase.dateFinPrevue &&
                                  ` | End: ${phase.dateFinPrevue}`}
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              {status.replace("-", " ").toUpperCase()}
                            </div>
                          </div>

                          {selectedPhase === phase.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">
                                    Planned Depth:
                                  </span>{" "}
                                  {phase.profondeurPrevue}m
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Actual Depth:
                                  </span>{" "}
                                  {phase.profondeurReelle || "TBD"}m
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Planned Start:
                                  </span>{" "}
                                  {phase.dateDebutPrevue || "TBD"}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Actual Start:
                                  </span>{" "}
                                  {phase.dateDebutReelle || "TBD"}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "operations" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Operations Management
            </h2>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPhase || "all"}
                onChange={(e) =>
                  setSelectedPhase(
                    e.target.value === "all" ? null : parseInt(e.target.value)
                  )
                }
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="all">All Phases</option>
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    Phase {phase.numeroPhase} -{" "}
                    {DiametreLabels[phase.diametre] || phase.diametre}
                  </option>
                ))}
              </select>
              <span className="text-gray-500">
                {
                  operations.filter(
                    (op) => !selectedPhase || op.phaseId === selectedPhase
                  ).length
                }{" "}
                operations
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Planned Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operations
                  .filter(
                    (op) => !selectedPhase || op.phaseId === selectedPhase
                  )
                  .map((operation) => (
                    <tr key={operation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-3`}
                            style={{
                              backgroundColor: getOperationStatusColor(
                                operation.statut
                              ),
                            }}
                          ></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {operation.typeOperation?.nom ||
                                "Unknown Operation"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {operation.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {operation.phaseName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor: getOperationStatusColor(
                              operation.statut
                            ),
                            color: "white",
                          }}
                        >
                          {OperationStatutLabels[operation.statut]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {operation.coutPrev
                          ? `${operation.coutPrev.toLocaleString()} DA`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {operation.coutReel
                          ? `${operation.coutReel.toLocaleString()} DA`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {operations.filter(
              (op) => !selectedPhase || op.phaseId === selectedPhase
            ).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No operations found for the selected criteria
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
