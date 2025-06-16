import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function PrvsnlForm() {
  const { id } = useParams();
  const [forageId, setForageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for TypeOperations
  const [typeOperations, setTypeOperations] = useState([]);
  const [typeOperationsLoading, setTypeOperationsLoading] = useState(true);
  const [originalOperations, setOriginalOperations] = useState({});
  const [originalPhases, setOriginalPhases] = useState({});

  const inputStyle = {
    backgroundColor: "white",
  };

  // Utility to debounce function calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
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

  // Fetch TypeOperations
  useEffect(() => {
    const fetchTypeOperations = async () => {
      try {
        setTypeOperationsLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/type-operations"
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setTypeOperations(data.data);
            console.log("TypeOperations loaded:", data.data);
          } else {
            console.warn("Invalid TypeOperations response structure:", data);
            setTypeOperations([]);
          }
        } else {
          throw new Error(`Failed to fetch TypeOperations: ${response.status}`);
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

  // Enhanced forage data fetching with existing operations
  useEffect(() => {
    const fetchForageId = async () => {
      try {
        console.log("Extracted id from route:", id);
        if (!id || isNaN(id)) {
          throw new Error(`Invalid id: ${id}`);
        }
        const puitIdNumber = Number(id);
        console.log("Converted id to number:", puitIdNumber);

        let apiUrl = `/api/forages/puit/${puitIdNumber}`;
        const fetchConfig = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        };

        let response = await fetch(apiUrl, fetchConfig);

        if (!response.ok && response.status === 404) {
          console.log("Relative URL failed, trying absolute URL");
          apiUrl = `http://localhost:8080/api/forages/puit/${puitIdNumber}`;
          response = await fetch(apiUrl, fetchConfig);
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch forages: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        if (data && data.success && data.data && data.data.length > 0) {
          const currentForageId = data.data[0].id;
          setForageId(currentForageId);

          // Fetch existing phases and operations
          await fetchExistingData(currentForageId, puitIdNumber);
        } else {
          throw new Error("No forages found for this id");
        }
      } catch (err) {
        console.error("Error details:", err.message, err.stack);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForageId();
  }, [id]);

  // Function to fetch existing phases and operations
  const fetchExistingData = async (currentForageId, puitIdNumber) => {
    try {
      // Fetch existing phases
      const phasesResponse = await fetch(
        `http://localhost:8080/api/phases/forage/${currentForageId}`
      );
      if (phasesResponse.ok) {
        const phasesData = await phasesResponse.json();
        if (phasesData.success && phasesData.data.length > 0) {
          const originalOps = {};
          const originalPhasesData = {};

          // Enhanced phase processing with operations
          const fetchedPhases = await Promise.all(
            phasesData.data.map(async (phase) => {
              const opsResponse = await fetch(
                `http://localhost:8080/api/operations/phase/${phase.id}`
              );
              const phaseOperations = opsResponse.ok
                ? (await opsResponse.json()).data || []
                : [];

              // Store original operations by phaseId
              originalOps[phase.id] = phaseOperations.map((op) => ({
                id: op.id,
                cost: op.coutPrev || 0,
              }));

              // Store original phase data
              originalPhasesData[phase.id] = {
                startDate: phase.dateDebutPrevue
                  ? phase.dateDebutPrevue.split("T")[0]
                  : "",
                endDate: phase.dateFinPrevue
                  ? phase.dateFinPrevue.split("T")[0]
                  : "",
                plannedDepth: phase.profondeurPrevue || "",
              };

              // Convert to form format
              const diametreToSize = {
                POUCES_26: '26"',
                POUCES_16: '16"',
                POUCES_12_25: '12 1/4"',
                POUCES_8_5: '8 1/2"',
              };

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

          setOriginalOperations(originalOps);
          setOriginalPhases(originalPhasesData);

          // Merge with default phases
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
        }
      }
    } catch (err) {
      console.warn("Error fetching existing data:", err);
      // Continue with default data if fetching fails
      setFormData((prev) => ({
        ...prev,
        title: `Report for Well #${puitIdNumber}`,
      }));
    }
  };

  // Enhanced operation type handling functions
  const getTypeOperationByCode = (code) => {
    return typeOperations.find((type) => type.code === code);
  };

  const getTypeOperationByName = (name) => {
    return typeOperations.find((type) => type.nom === name);
  };

  // Validate date logic
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (phaseIndex, dateType, value) => {
    const updatedPhases = [...formData.phases];
    updatedPhases[phaseIndex][dateType] = value;
    validateDates(updatedPhases, phaseIndex, dateType, value);
    setFormData({
      ...formData,
      phases: updatedPhases,
    });
  };

  const handlePlannedDepthChange = (phaseIndex, value) => {
    setFormData((prev) => {
      const newPhases = [...prev.phases];
      newPhases[phaseIndex].plannedDepth = value;
      return { ...prev, phases: newPhases };
    });
  };

  const handleOperationStatusChange = (phaseIndex, operationId) => {
    const updatedPhases = [...formData.phases];
    const operationIndex = updatedPhases[phaseIndex].operations.findIndex(
      (op) => op.id === operationId
    );
    if (operationIndex !== -1) {
      updatedPhases[phaseIndex].operations[operationIndex].status =
        !updatedPhases[phaseIndex].operations[operationIndex].status;
      setFormData({
        ...formData,
        phases: updatedPhases,
      });
    }
  };

  // Enhanced add operation with debouncing
  const addOperation = debounce((phaseIndex) => {
    console.log(`Adding operation to phase ${phaseIndex}`);
    const updatedPhases = [...formData.phases];
    const newId =
      Math.max(
        0,
        ...formData.phases.flatMap((phase) =>
          phase.operations.map((op) => op.id)
        )
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

    setFormData({
      ...formData,
      phases: updatedPhases,
    });
  }, 300);

  // Enhanced cost change handler with validation
  const handleCostChange = (phaseIndex, operationId, value) => {
    const cost = Number(value);
    if (isNaN(cost) || cost < 0) {
      alert("Cost must be a non-negative number");
      return;
    }

    const updatedPhases = [...formData.phases];
    const operationIndex = updatedPhases[phaseIndex].operations.findIndex(
      (op) => op.id === operationId
    );
    if (operationIndex !== -1) {
      updatedPhases[phaseIndex].operations[operationIndex].cost = cost;
      setFormData({
        ...formData,
        phases: updatedPhases,
      });
    }
  };

  const deleteOperation = (phaseIndex, operationId) => {
    const updatedPhases = [...formData.phases];
    const operationIndex = updatedPhases[phaseIndex].operations.findIndex(
      (op) => op.id === operationId
    );
    if (operationIndex !== -1) {
      updatedPhases[phaseIndex].operations.splice(operationIndex, 1);
      setFormData({
        ...formData,
        phases: updatedPhases,
      });
    }
  };

  // Enhanced operation name change handler
  const handleOperationNameChange = (phaseIndex, operationId, value) => {
    const updatedPhases = [...formData.phases];
    const operationIndex = updatedPhases[phaseIndex].operations.findIndex(
      (op) => op.id === operationId
    );
    if (operationIndex !== -1) {
      const selectedTypeOperation = getTypeOperationByName(value);
      updatedPhases[phaseIndex].operations[operationIndex] = {
        ...updatedPhases[phaseIndex].operations[operationIndex],
        name: value,
        code: selectedTypeOperation?.code || null,
      };
      setFormData({
        ...formData,
        phases: updatedPhases,
      });
    }
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

  // Enhanced submit handler with better operation validation and error handling
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

    // Enhanced validation for operations
    const invalidOperations = [];
    formData.phases.forEach((phase, phaseIndex) => {
      phase.operations.forEach((operation) => {
        if (!operation.name || !operation.code) {
          invalidOperations.push(
            `Phase ${phase.number}: Operation "${
              operation.name || "No name"
            }" is invalid or not selected`
          );
        }

        // Verify the operation type exists in our TypeOperations
        const typeOperation = getTypeOperationByCode(operation.code);
        if (operation.code && !typeOperation) {
          invalidOperations.push(
            `Phase ${phase.number}: Operation type "${operation.name}" (${operation.code}) not found in system`
          );
        }

        // Validate cost
        const cost = Number(operation.cost) || 0;
        if (cost < 0) {
          invalidOperations.push(
            `Phase ${phase.number}: Operation "${operation.name}" has invalid cost (${operation.cost})`
          );
        }
      });
    });

    if (invalidOperations.length > 0) {
      alert(
        `Please fix the following issues before submitting:\n${invalidOperations.join(
          "\n"
        )}`
      );
      return;
    }

    const sizeToDiametre = {
      '26"': "POUCES_26",
      '16"': "POUCES_16",
      '12 1/4"': "POUCES_12_25",
      '8 1/2"': "POUCES_8_5",
    };

    try {
      // Fetch existing phases - use absolute URL
      const existingPhasesResponse = await fetch(
        `http://localhost:8080/api/phases/forage/${forageId}`
      );
      const existingPhasesData = await existingPhasesResponse.json();
      const existingPhases = existingPhasesData.success
        ? existingPhasesData.data
        : [];

      const createdPhases = [];
      let operationsUpdated = false;
      let phasesUpdated = false;
      const processingErrors = [];

      for (const [phaseIndex, phase] of formData.phases.entries()) {
        // Check if phase has any data to save
        const hasPhaseData =
          phase.description ||
          phase.startDate ||
          phase.endDate ||
          phase.plannedDepth ||
          (phase.operations && phase.operations.length > 0);

        if (!hasPhaseData) {
          console.log(`Skipping phase ${phase.number} - no data to save`);
          continue;
        }

        // Look for existing phase by phase number
        const existingPhase = existingPhases.find(
          (p) => p.numeroPhase === phase.number
        );
        let phaseId;
        let currentPhaseData = null;

        if (existingPhase) {
          // Phase exists - update it if needed
          phaseId = existingPhase.id;
          currentPhaseData = existingPhase;

          // Check for changes
          const originalPhase = originalPhases[phaseId] || {
            startDate: existingPhase.dateDebutPrevue
              ? existingPhase.dateDebutPrevue.split("T")[0]
              : "",
            endDate: existingPhase.dateFinPrevue
              ? existingPhase.dateFinPrevue.split("T")[0]
              : "",
            plannedDepth: existingPhase.profondeurPrevue || "",
          };

          const hasChanges =
            (phase.description || "") !== (existingPhase.description || "") ||
            phase.startDate !== originalPhase.startDate ||
            phase.endDate !== originalPhase.endDate ||
            parseFloat(phase.plannedDepth || 0) !==
              parseFloat(originalPhase.plannedDepth || 0);

          if (hasChanges) {
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

            try {
              // Use fetch instead of axios
              const phaseResponse = await fetch(
                `http://localhost:8080/api/phases/${phaseId}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                  body: JSON.stringify(phasePayload),
                }
              );

              if (!phaseResponse.ok) {
                const errorText = await phaseResponse.text();
                processingErrors.push(
                  `Phase ${phase.number}: Failed to update - ${errorText}`
                );
                continue;
              }

              const phaseResult = await phaseResponse.json();
              if (phaseResult.success) {
                currentPhaseData = phaseResult.data;
                phasesUpdated = true;
                console.log(`Successfully updated phase ${phase.number}`);
              }
            } catch (phaseError) {
              processingErrors.push(
                `Phase ${phase.number}: Error updating - ${phaseError.message}`
              );
              continue;
            }
          }
        } else {
          // Phase doesn't exist - create new one
          const phasePayload = {
            forage: { id: forageId },
            numeroPhase: phase.number,
            diametre: sizeToDiametre[phase.size],
            dateDebutPrevue: phase.startDate || null,
            dateFinPrevue: phase.endDate || null,
            profondeurPrevue: parseFloat(phase.plannedDepth) || null,
            description: phase.description || "",
          };

          try {
            // Use fetch instead of axios
            const phaseResponse = await fetch(
              "http://localhost:8080/api/phases",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify(phasePayload),
              }
            );

            if (!phaseResponse.ok) {
              const errorText = await phaseResponse.text();
              processingErrors.push(
                `Phase ${phase.number}: Failed to create - ${errorText}`
              );
              continue;
            }

            const phaseResult = await phaseResponse.json();
            if (phaseResult.success) {
              phaseId = phaseResult.data.id;
              currentPhaseData = phaseResult.data;
              createdPhases.push(phaseResult.data);
              console.log(
                `Successfully created phase ${phase.number} with ID: ${phaseId}`
              );
            }
          } catch (phaseError) {
            processingErrors.push(
              `Phase ${phase.number}: Error creating - ${phaseError.message}`
            );
            continue;
          }
        }

        // Handle operations for the phase - enhanced validation
        if (phase.operations?.length > 0 && currentPhaseData && phaseId) {
          try {
            const existingOpsResponse = await fetch(
              `http://localhost:8080/api/operations/phase/${phaseId}`
            );
            const existingOps = existingOpsResponse.ok
              ? (await existingOpsResponse.json()).data || []
              : [];

            for (const operation of phase.operations) {
              // Enhanced operation validation
              if (!operation.name || !operation.code) {
                processingErrors.push(
                  `Phase ${phase.number}: Operation "${
                    operation.name || "No name"
                  }" is invalid`
                );
                continue;
              }

              // Verify the operation type exists
              const typeOperation = getTypeOperationByCode(operation.code);
              if (!typeOperation) {
                processingErrors.push(
                  `Phase ${phase.number}: Operation type "${operation.name}" not found in system`
                );
                continue;
              }

              // Validate cost
              const cost = Number(operation.cost) || 0;
              if (cost < 0) {
                processingErrors.push(
                  `Phase ${phase.number}: Operation "${operation.name}" has invalid cost`
                );
                continue;
              }

              const isNew =
                operation.isNew ||
                !existingOps.some((op) => op.id === operation.id);

              if (isNew) {
                // Create new operation
                const operationPayload = {
                  phase: { id: phaseId },
                  description:
                    operation.name || `Opération Phase ${phase.number}`,
                  coutPrev: cost,
                  coutReel: 0,
                  statut: operation.status ? "PLANIFIE" : "ANNULE",
                  typeOperation: { code: operation.code },
                };

                console.log(
                  `Creating operation for phase ${phase.number}:`,
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

                  if (opResponse.ok) {
                    const opResult = await opResponse.json();
                    if (opResult.success) {
                      console.log(
                        `Created operation "${operation.name}" in phase ${phase.number}`
                      );
                      operationsUpdated = true;
                    } else {
                      processingErrors.push(
                        `Phase ${phase.number}: Failed to create operation "${operation.name}"`
                      );
                    }
                  } else {
                    const errorText = await opResponse.text();
                    processingErrors.push(
                      `Phase ${phase.number}: Failed to create operation "${operation.name}" - ${errorText}`
                    );
                  }
                } catch (opError) {
                  processingErrors.push(
                    `Phase ${phase.number}: Network error creating operation "${operation.name}"`
                  );
                }
              } else {
                // Check for cost change in existing operation
                const originalOp = originalOperations[phaseId]?.find(
                  (op) => op.id === operation.id
                );
                if (originalOp && originalOp.cost !== cost) {
                  const updatePayload = {
                    id: operation.id,
                    phase: { id: phaseId },
                    description: operation.name,
                    coutPrev: cost,
                    coutReel: 0,
                    statut: operation.status ? "PLANIFIE" : "ANNULE",
                    typeOperation: { code: operation.code },
                  };

                  try {
                    const opResponse = await fetch(
                      `http://localhost:8080/api/operations/${operation.id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Accept: "application/json",
                        },
                        body: JSON.stringify(updatePayload),
                      }
                    );

                    if (opResponse.ok) {
                      const opResult = await opResponse.json();
                      if (opResult.success) {
                        console.log(
                          `Updated operation "${operation.name}" in phase ${phase.number}`
                        );
                        operationsUpdated = true;
                      }
                    } else {
                      processingErrors.push(
                        `Phase ${phase.number}: Failed to update operation "${operation.name}"`
                      );
                    }
                  } catch (updateError) {
                    processingErrors.push(
                      `Phase ${phase.number}: Error updating operation "${operation.name}"`
                    );
                  }
                }
              }
            }
          } catch (operationsError) {
            processingErrors.push(
              `Phase ${phase.number}: Error processing operations - ${operationsError.message}`
            );
          }
        }
      }

      // Enhanced feedback to user
      if (processingErrors.length > 0) {
        alert(
          `Some operations or phases could not be saved:\n${processingErrors.join(
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
      console.error("Submission error:", err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  // Added missing handlePhaseDescriptionChange function
  const handlePhaseDescriptionChange = (phaseIndex, newDescription) => {
    setFormData((prev) => {
      const newPhases = [...prev.phases];
      newPhases[phaseIndex] = {
        ...newPhases[phaseIndex],
        description: newDescription,
      };
      return { ...prev, phases: newPhases };
    });
  };

  const handleDiscard = () => {
    console.log("Form discarded");
  };

  // Check for invalid operations to disable Save button
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

  // Loading and error states
  if (loading || typeOperationsLoading) {
    return <div className="text-center py-6 text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">Error: {error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Fill a provisional report
        </h1>
        <p className="text-gray-500">Jun 1 2025</p>
      </div>

      {/* Title and Well Section */}
      <div className="bg-white rounded-lg p-6 mb-8 border shadow-md border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-medium mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orangePtrm"
              placeholder="Enter title of the report"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Phases Sections */}
      {formData.phases.map((phase, phaseIndex) => (
        <div
          key={`phase-${phaseIndex}`}
          className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200"
        >
          <h2 className="text-xl font-semibold mb-4">
            Phase {phase.number} - Forage {phase.size}
          </h2>

          {/* Phase description */}
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
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-orangePtrm"
              placeholder="Enter description for this phase"
              style={inputStyle}
            />
          </div>

          {/* Dates and Planned Depth */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm mb-1">Date de début prévue</label>
              <input
                type="date"
                value={phase.startDate}
                onChange={(e) =>
                  handleDateChange(phaseIndex, "startDate", e.target.value)
                }
                className={`w-full focus:outline-none focus:border-orangePtrm border border-gray-300 rounded px-3 py-2 ${
                  dateErrors.phases[phaseIndex]?.startDate
                    ? "border-red-500"
                    : ""
                }`}
                style={{
                  ...inputStyle,
                  colorScheme: "light",
                }}
              />
              {dateErrors.phases[phaseIndex]?.startDate && (
                <p className="text-red-500 text-xs mt-1">
                  {dateErrors.phases[phaseIndex].startDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Date de fin prévue</label>
              <input
                type="date"
                value={phase.endDate}
                onChange={(e) =>
                  handleDateChange(phaseIndex, "endDate", e.target.value)
                }
                className={`w-full focus:outline-none focus:border-orangePtrm border border-gray-300 rounded px-3 py-2 ${
                  dateErrors.phases[phaseIndex]?.endDate ? "border-red-500" : ""
                }`}
                style={{
                  ...inputStyle,
                  colorScheme: "light",
                }}
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
                className="w-full focus:outline-none focus:border-orangePtrm border border-gray-300 rounded px-3 py-2"
                placeholder="0"
                step="0.1"
                style={{
                  ...inputStyle,
                  colorScheme: "light",
                }}
              />
            </div>
          </div>

          {/* Operations */}
          <div>
            <div className="flex justify-between items-center mb-0">
              <h3 className="font-medium">Opérations prévues</h3>
              <button
                type="button"
                onClick={() => addOperation(phaseIndex)}
                disabled={typeOperations.length === 0}
                className={`text-orange-500 bg-white hover:bg-orange-50 transition-all duration-200 flex items-center px-3 py-1.5 rounded-md shadow-sm border hover:border-1 focus:ring-1 focus:ring-orangePtrm hover:border-orangePtrm focus:outline-none border-orange-200 ${
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
                No operation types available. Please contact administrator to
                add operation types.
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
                          handleOperationStatusChange(phaseIndex, operation.id)
                        }
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                            operation.status ? "translate-x-7" : "translate-x-1"
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
                        className={`appearance-none w-full border rounded-md pl-3 pr-10 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-150 ease-in-out shadow-sm ${
                          !operation.code
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
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
                      {!operation.code && (
                        <div className="absolute -bottom-6 left-0 text-xs text-red-500">
                          Please select a valid operation type
                        </div>
                      )}
                    </div>

                    <div className="col-span-5 justify-between flex items-center">
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
                        className={`w-24 border focus:outline-none focus:border-1 focus:border-orangePtrm rounded px-3 py-1 text-right ${
                          isNaN(Number(operation.cost)) ||
                          Number(operation.cost) < 0
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={{
                          ...inputStyle,
                          colorScheme: "light",
                        }}
                      />
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            deleteOperation(phaseIndex, operation.id)
                          }
                          className="text-red-500 bg-white px-0 border-none focus:outline-none sm:mr-12 hover:text-red-800"
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                No operations have been added yet.
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-6 mt-8">
        <button
          type="button"
          onClick={handleDiscard}
          className="px-6 py-2 focus:outline-none focus:border-orangePtrm focus:ring-1 hover:border-orangePtrm focus:ring-orangePtrm bg-white border border-orange-300 text-orangePtrm rounded-md hover:bg-orange-50 transition-all duration-200 shadow-sm"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={hasInvalidOperations}
          className={`px-6 py-2 bg-orangePtrm focus:outline-none focus:border-orangePtrm focus:ring-1 focus:ring-orange-600 text-white rounded-md hover:bg-orange-600 transition-all duration-200 shadow-sm ${
            hasInvalidOperations ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Save
        </button>
      </div>
    </form>
  );
}
