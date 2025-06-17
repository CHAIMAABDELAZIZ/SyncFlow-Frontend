import React, { useState, useEffect } from "react";

const MapCard = () => {
  const [totalCosts, setTotalCosts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTotalCosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/dashboard/data"
        );
        const data = await response.json();

        if (data.success) {
          setTotalCosts(data.data.totalPhasesCost || {});
        } else {
          setError("Failed to fetch total costs data");
        }
      } catch (err) {
        console.error("Error fetching total costs:", err);
        setError("Error loading total costs");
      } finally {
        setLoading(false);
      }
    };

    fetchTotalCosts();
  }, []);

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M DZD`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K DZD`;
    }
    return `${amount.toLocaleString()} DZD`;
  };

  if (loading) {
    return (
      <div className="col-span-3 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !totalCosts) {
    return (
      <div className="col-span-3 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <div className="text-center text-red-500">
          <p>{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-3 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-gray-800">Total Drilling Cost</h2>
      </div>

      <div className="flex items-center">
        {/* Map Visualization */}
        <div className="flex-1 relative">
          <div className="h-64 bg-gray-100 rounded-lg relative overflow-hidden">
            <div className="h-64 bg-white rounded-lg relative overflow-hidden">
              <img
                src="src/assets/features.svg"
                alt="Algeria Map"
                className="w-full h-full object-contain"
              />

              {/* Cost Callout */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg text-center">
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      totalCosts.totalActualCost || totalCosts.totalPlannedCost
                    )}
                  </p>
                  <p className="text-xs">
                    {totalCosts.totalActualCost > 0
                      ? "Actual Total"
                      : "Planned Total"}
                  </p>
                  {totalCosts.costOverrun > 0 && (
                    <p className="text-xs text-red-300 mt-1">
                      +{formatCurrency(totalCosts.costOverrun)} overrun
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg">
                <p className="text-sm font-medium text-gray-800">
                  {totalCosts.totalPhases} Active Phases
                </p>
                {totalCosts.costOverrunPercentage !== 0 && (
                  <p
                    className={`text-xs ${
                      totalCosts.costOverrunPercentage > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {totalCosts.costOverrunPercentage > 0 ? "+" : ""}
                    {totalCosts.costOverrunPercentage.toFixed(1)}% vs planned
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapCard;
