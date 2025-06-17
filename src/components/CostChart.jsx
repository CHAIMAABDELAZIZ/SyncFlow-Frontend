import React, { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";

const CostChart = () => {
  const [costlyOperations, setCostlyOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCostlyOperations = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/dashboard/data"
        );
        const data = await response.json();

        if (data.success) {
          setCostlyOperations(data.data.costlyOperations || []);
        } else {
          setError("Failed to fetch costly operations data");
        }
      } catch (err) {
        console.error("Error fetching costly operations:", err);
        setError("Error loading costly operations");
      } finally {
        setLoading(false);
      }
    };

    fetchCostlyOperations();
  }, []);

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toFixed(0);
  };

  const getOperationColor = (index) => {
    const colors = ["#fb923c", "#9ca3af", "#d1d5db"];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="col-span-3 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-56 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-3 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const maxCost = Math.max(...costlyOperations.map((op) => op.totalCost));
  const topOperations = costlyOperations.slice(0, 3);

  return (
    <div className="col-span-3 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-gray-800">Most costly operations</h2>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {costlyOperations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No operation cost data available</p>
        </div>
      ) : (
        <div className="mt-4 relative h-56">
          {/* Chart Grid */}
          <div className="absolute left-0 top-0 h-full w-full flex flex-col justify-between text-xs text-gray-500">
            <div className="border-b border-gray-100">
              {formatCurrency(maxCost)}
            </div>
            <div className="border-b border-gray-100">
              {formatCurrency(maxCost * 0.8)}
            </div>
            <div className="border-b border-gray-100">
              {formatCurrency(maxCost * 0.6)}
            </div>
            <div className="border-b border-gray-100">
              {formatCurrency(maxCost * 0.4)}
            </div>
            <div className="border-b border-gray-100">
              {formatCurrency(maxCost * 0.2)}
            </div>
            <div>0</div>
          </div>

          {/* Chart Lines */}
          <div className="absolute top-0 left-8 right-8 h-full pt-6">
            {/* Vertical Marker */}
            <div className="absolute top-0 left-1/2 h-full border-l-2 border-dashed border-gray-400"></div>

            {/* Chart visualization */}
            <svg viewBox="0 0 400 200" className="w-full h-full">
              {topOperations.map((operation, index) => {
                const height = (operation.totalCost / maxCost) * 180;
                const startY = 200 - height;
                const color = getOperationColor(index);

                return (
                  <g key={index}>
                    {/* Operation cost line */}
                    <path
                      d={`M${index * 120 + 50},200 C${index * 120 + 100},200 ${
                        index * 120 + 120
                      },${startY + 20} ${index * 120 + 150},${startY} S${
                        index * 120 + 200
                      },${startY - 10} ${index * 120 + 250},${startY - 20}`}
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Data point */}
                    <circle
                      cx={index * 120 + 150}
                      cy={startY}
                      r="8"
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Cost highlight point for top operation */}
            {topOperations.length > 0 && (
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="mt-1 ml-1">
                  <div className="bg-black text-white px-2 py-1 rounded text-xs">
                    <span>
                      {formatCurrency(topOperations[0].totalCost)} DZD
                    </span>
                    {topOperations[0].overrunPercentage > 0 && (
                      <span className="text-red-400 ml-1">
                        +{topOperations[0].overrunPercentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="absolute top-4 right-8 flex flex-col space-y-2">
              {topOperations.map((operation, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="px-3 py-1 text-white rounded-full text-xs"
                    style={{ backgroundColor: getOperationColor(index) }}
                  >
                    {operation.operationType}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Operation details */}
      {costlyOperations.length > 0 && (
        <div className="mt-6 space-y-2">
          {topOperations.map((operation, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-gray-600">{operation.operationType}</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {formatCurrency(operation.totalCost)} DZD
                </span>
                <span className="text-gray-400">
                  ({operation.operationCount} ops)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CostChart;
