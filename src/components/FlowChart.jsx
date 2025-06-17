// AverageComplianceFunnel.tsx
import React, { useState, useEffect } from "react";

export default function FlowChart() {
  const [overruns, setOverruns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverruns = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/dashboard/data"
        );
        const data = await response.json();

        if (data.success) {
          setOverruns(data.data.overruns || {});
        } else {
          setError("Failed to fetch overruns data");
        }
      } catch (err) {
        console.error("Error fetching overruns:", err);
        setError("Error loading overruns");
      } finally {
        setLoading(false);
      }
    };

    fetchOverruns();
  }, []);

  if (loading) {
    return (
      <div className="relative bg-white p-6 rounded-2xl shadow-md w-full h-full max-w-4xl overflow-hidden">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !overruns) {
    return (
      <div className="relative bg-white p-6 rounded-2xl shadow-md w-full h-full max-w-4xl overflow-hidden">
        <div className="text-center text-red-500">
          <p>{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const steps = [
    {
      label: "Dépassement de délais",
      value: overruns.timeOverruns || 0,
      total: overruns.totalPhases || 1,
      topPercent: Math.round(
        ((overruns.timeOverruns || 0) / (overruns.totalPhases || 1)) * 100
      ),
      bottomPercent: Math.round((overruns.totalTimeOverrunDays || 0) / 30), // Convert to months approximation
    },
    {
      label: "Dépassement des coûts",
      value: overruns.costOverruns || 0,
      total: overruns.totalPhases || 1,
      topPercent: Math.round(
        ((overruns.costOverruns || 0) / (overruns.totalPhases || 1)) * 100
      ),
      bottomPercent: Math.round((overruns.totalCostOverrun || 0) / 1000000), // Convert to millions
    },
  ];

  return (
    <div className="relative bg-white p-6 rounded-2xl shadow-md w-full h-full max-w-4xl overflow-hidden">
      <h2 className="text-lg font-semibold mb-4 text-black">
        Average operations compliance check
      </h2>

      {/* SVG BAND */}
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="absolute top-24 left-0 w-full h-40 opacity-70"
      >
        <defs>
          <linearGradient id="bandGradient" x1="0" x2="100%" y1="0" y2="0">
            <stop offset="0%" stopColor="#22c55e" /> {/* green-500 */}
            <stop offset="50%" stopColor="#f97316" /> {/* orange-500 */}
            <stop offset="100%" stopColor="#ef4444" /> {/* red-500 */}
          </linearGradient>
        </defs>
        <path
          d="M0,15 C20,10 30,10 50,15 C70,20 80,20 100,15 L100,25 C80,30 70,30 50,25 C30,20 20,20 0,25 Z"
          fill="url(#bandGradient)"
        />
      </svg>

      {/* LIGNES ET DONNÉES */}
      <div className="flex justify-between relative z-10">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 text-center">
            <div className="text-2xl font-bold text-black">{step.value}</div>
            <div className="text-gray-400">{step.label}</div>
            <div className="text-sm text-gray-500">
              {step.topPercent}% of {step.total} phases
            </div>

            {/* Lignes verticales */}
            <div className="relative mt-4 mb-4 h-32 flex flex-col justify-between items-center">
              <div className="absolute h-full w-[2px] border-l-2 border-dashed border-black"></div>
              <div className="bg-black text-white text-sm rounded-full px-3 py-1">
                {step.topPercent}%
              </div>
              <div className="bg-black text-white text-sm rounded-full px-3 py-1">
                {step.bottomPercent}
                {index === 0 ? "mo" : "M"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {overruns.totalPhases === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <p className="text-gray-500">No phase data available</p>
        </div>
      )}
    </div>
  );
}
