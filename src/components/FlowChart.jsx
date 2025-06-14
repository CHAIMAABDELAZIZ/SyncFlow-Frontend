// AverageComplianceFunnel.tsx
import React from "react";

const steps = [
  {
    label: "Dépassement de délais",
    value: 27800,
    topPercent: 8,
    bottomPercent: 4,
  },
  {
    label: "Dépassement des couts",
    value: 27800,
    topPercent: 32,
    bottomPercent: 21,
  },
];

export default function FlowChart() {
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
            <div className="text-2xl font-bold text-black">
              {(step.value / 1000).toFixed(1)} K
            </div>
            <div className="text-gray-400">{step.label}</div>

            {/* Lignes verticales */}
            <div className="relative mt-4 mb-4 h-32 flex flex-col justify-between items-center">
              <div className="absolute h-full w-[2px] border-l-2 border-dashed border-black"></div>
              <div className=""></div>
              <div className="bg-black text-white text-sm rounded-full px-3 py-1">
                {step.bottomPercent}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
