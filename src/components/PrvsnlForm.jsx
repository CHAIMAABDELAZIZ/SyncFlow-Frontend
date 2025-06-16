import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function PrvsnlForm() {
  const { id } = useParams();
  const [forageId, setForageId] = useState(null); // État pour stocker le forage_id
  const [loading, setLoading] = useState(true); // État pour gérer le chargement
  const [error, setError] = useState(null); // État pour gérer les erreurs

  const inputStyle = {
    backgroundColor: "white",
  };

  const operationTypes = [
    "Drilling",
    "Mud logging",
    "Cementing",
    "Water supply",
    "Well head",
    "Casing tubing",
    "Casing accessoire",
    "Run casing",
    "Drilling bit",
    "Coring",
    "Drilling mud",
    "Logging",
    "Testing",
    "Sécurité",
  ];

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

  // Récupérer le forage_id à partir du puit_id au chargement du composant
  useEffect(() => {
    const fetchForageId = async () => {
      try {
        // Log and validate id
        console.log("Extracted id from route:", id);
        if (!id || isNaN(id)) {
          throw new Error(`Invalid id: ${id}`);
        }
        const puitIdNumber = Number(id); // Convert to number
        console.log("Converted id to number:", puitIdNumber);

        // Try relative URL first
        let apiUrl = `/api/forages/puit/${puitIdNumber}`;
        console.log("Trying relative Request URL:", apiUrl);

        const fetchConfig = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        };
        console.log("Fetch configuration:", fetchConfig);

        let response = await fetch(apiUrl, fetchConfig);

        // Log response details
        console.log("Response status (relative):", response.status);
        console.log("Response ok (relative):", response.ok);
        console.log(
          "Response headers (relative):",
          Object.fromEntries(response.headers)
        );

        // If 404, try absolute URL as fallback
        if (!response.ok && response.status === 404) {
          console.log("Relative URL failed, trying absolute URL");
          apiUrl = `http://localhost:8080/api/forages/puit/${puitIdNumber}`;
          console.log("Trying absolute Request URL:", apiUrl);
          response = await fetch(apiUrl, fetchConfig);

          console.log("Response status (absolute):", response.status);
          console.log("Response ok (absolute):", response.ok);
          console.log(
            "Response headers (absolute):",
            Object.fromEntries(response.headers)
          );
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Error response body (first 500 chars):",
            errorText.substring(0, 500) || "Empty response"
          );
          throw new Error(
            `Failed to fetch forages: ${response.status} ${response.statusText}`
          );
        }

        let data;
        try {
          data = await response.json();
          console.log("Parsed response data:", data);
        } catch (parseErr) {
          const rawText = await response.text();
          console.error("JSON parsing error:", parseErr.message);
          console.error(
            "Raw response body (first 500 chars):",
            rawText.substring(0, 500) || "Empty response"
          );
          throw new Error(`Failed to parse response: ${parseErr.message}`);
        }

        if (data && data.success && data.data && data.data.length > 0) {
          console.log("Forage ID:", data.data[0].id);
          setForageId(data.data[0].id);
        } else {
          console.log("Response validation failed:", {
            hasData: !!data,
            isSuccess: data?.success,
            hasDataArray: !!data?.data,
            dataLength: data?.data?.length,
          });
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

  const handleCostChange = (phaseIndex, operationId, value) => {
    const updatedPhases = [...formData.phases];
    const operationIndex = updatedPhases[phaseIndex].operations.findIndex(
      (op) => op.id === operationId
    );
    if (operationIndex !== -1) {
      updatedPhases[phaseIndex].operations[operationIndex].cost = value;
      setFormData({
        ...formData,
        phases: updatedPhases,
      });
    }
  };

  const addOperation = (phaseIndex) => {
    const updatedPhases = [...formData.phases];
    const newId =
      Math.max(
        0,
        ...formData.phases.flatMap((phase) =>
          phase.operations.map((op) => op.id)
        )
      ) + 1;

    updatedPhases[phaseIndex].operations.push({
      id: newId,
      status: true,
      name: "New Operation",
      cost: 0,
    });

    setFormData({
      ...formData,
      phases: updatedPhases,
    });
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

  const handleOperationNameChange = (phaseIndex, operationId, value) => {
    const updatedPhases = [...formData.phases];
    const operationIndex = updatedPhases[phaseIndex].operations.findIndex(
      (op) => op.id === operationId
    );
    if (operationIndex !== -1) {
      updatedPhases[phaseIndex].operations[operationIndex].name = value;
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

  // DIAGNOSTIC DU PROBLÈME :
  // L'erreur 500 indique un problème côté serveur lors de la création de la phase 3
  // Voici comment améliorer le debugging et gérer l'erreur :

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

    const sizeToDiametre = {
      '26"': "POUCES_26",
      '16"': "POUCES_16",
      '12 1/4"': "POUCES_12_25",
      '8 1/2"': "POUCES_8_5",
    };

    const labelToCodeMap = {
      Drilling: "DRILLING",
      "Mud logging": "MUD_LOGGING",
      Cementing: "CEMENTING",
      "Water supply": "WATER_SUPPLY",
      "Well head": "WELL_HEAD",
      "Casing tubing": "CASING_TUBING",
      "Casing accessoire": "CASING_ACCESSORY",
      "Run casing": "RUN_CASING",
      "Drilling bit": "DRILLING_BIT",
      Coring: "CORING",
      "Drilling mud": "DRILLING_MUD",
      Logging: "LOGGING",
      Testing: "TESTING",
      Sécurité: "SECURITY",
    };

    const fetchPhasesByForage = async (forageId) => {
      const response = await fetch(`/api/phases/forage/${forageId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status} lors de la récupération des phases`
        );
      }
      const data = await response.json();
      return data.data || [];
    };

    try {
      const existingPhases = await fetchPhasesByForage(forageId);
      const phasesForCurrentForage = existingPhases.filter(
        (p) => String(p.forage?.id) === String(forageId)
      );
      const createdPhases = [];

      for (const phase of formData.phases) {
        const phaseExists = phasesForCurrentForage.some(
          (p) => p.numeroPhase === phase.number
        );
        if (phaseExists) {
          alert(
            `Phase ${phase.number} existe déjà pour ce forage. Elle sera ignorée.`
          );
          continue;
        }

        const diametre = sizeToDiametre[phase.size];
        if (!diametre) {
          alert(`Taille invalide pour la phase ${phase.number}.`);
          return;
        }

        const phasePayload = {
          forage: { id: forageId },
          numeroPhase: phase.number,
          diametre,
          dateDebutPrevue: phase.startDate || null,
          dateFinPrevue: phase.endDate || null,
          profondeurPrevue: parseFloat(phase.plannedDepth) || null,
          description: phase.description || "",
        };

        const phaseResponse = await fetch("/api/phases", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(phasePayload),
        });

        if (!phaseResponse.ok) {
          const errorText = await phaseResponse.text();
          alert(
            `Erreur lors de la création de la phase ${phase.number} : ${errorText}`
          );
          continue;
        }

        const phaseData = await phaseResponse.json();
        const createdPhase = phaseData.data;
        createdPhases.push(createdPhase);

        // ➕ Création des opérations
        if (phase.operations?.length > 0) {
          for (const operation of phase.operations) {
            const code = labelToCodeMap[operation.name];
            if (!code) {
              console.warn(`Type d'opération inconnu : ${operation.name}`);
              continue;
            }

            const operationPayload = {
              phase: { id: createdPhase.id },
              description: operation.name || `Opération Phase ${phase.number}`,
              coutPrev: operation.cost || 0, // ✅ correspond à "COUT_PREVU" en base
              coutReel: 0, // ✅ par défaut 0, ou tu peux mettre operation.actualCost si dispo
              statut: "PLANIFIE",
              typeOperation: { code },
              createdBy: { id: 1 }, // 🔐 À adapter pour prendre l'utilisateur connecté
            };

            const opResponse = await fetch("/api/operations", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(operationPayload),
            });

            if (!opResponse.ok) {
              const opError = await opResponse.text();
              console.warn(`❌ Échec création opération : ${opError}`);
            }
          }
        }
      }

      if (createdPhases.length > 0) {
        alert(`✅ ${createdPhases.length} phases créées avec succès.`);
      } else {
        alert(`ℹ️ Aucune phase nouvelle créée.`);
      }
    } catch (err) {
      console.error("Erreur générale:", err.message);
      alert(`❌ Erreur générale : ${err.message}`);
    }
  };

  const handleDiscard = () => {
    console.log("Form discarded");
  };
  function handlePhaseDescriptionChange(phaseIndex, newDescription) {
    setFormData((prev) => {
      const newPhases = [...prev.phases];
      newPhases[phaseIndex] = {
        ...newPhases[phaseIndex],
        description: newDescription,
      };
      return { ...prev, phases: newPhases };
    });
  }

  // Afficher un message de chargement ou d'erreur si nécessaire
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
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
          {/* Champ description de la phase */}
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
                className="text-orange-500 bg-white hover:bg-orange-50 transition-all duration-200 flex items-center px-3 py-1.5 rounded-md shadow-sm border hover:border-1 focus:ring-1 focus:ring-orangePtrm hover:border-orangePtrm focus:outline-none border-orange-200"
              >
                <span className="text-xl mr-1">+</span> Add operation
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-8">
              Mentionner les opérations prévues pour cette phase et indiquer
              leur coût prévisionnel
            </p>

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
                          className={`inline-block h-6 w-2 transform rounded-xl bg-white shadow transition-transform duration-200 ease-in-out ${
                            operation.status ? "translate-x-7" : "translate-x-1"
                          } border border-gray-100`}
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
                        <option value="" disabled hidden>
                          -- Sélectionnez une opération --
                        </option>
                        {operationTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
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

                    <div className="col-span-5 justify-between flex items-center">
                      <input
                        type="number"
                        value={operation.cost}
                        onChange={(e) =>
                          handleCostChange(
                            phaseIndex,
                            operation.id,
                            Number(e.target.value)
                          )
                        }
                        className="w-24 border focus:outline-none focus:border-1 focus:border-orangePtrm border-gray-300 rounded px-3 py-1 text-right"
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
          className="px-6 py-2 bg-orangePtrm focus:outline-none focus:border-orangePtrm focus:ring-1 focus:ring-orange-600 text-white rounded-md hover:bg-orange-600 transition-all duration-200 shadow-sm"
        >
          Save
        </button>
      </div>
    </form>
  );
}
