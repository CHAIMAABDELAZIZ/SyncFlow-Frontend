import React, { useState, useEffect } from "react";
import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react";

const Card = () => {
  const [phaseCosts, setPhaseCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhaseCosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/dashboard/data"
        );
        const data = await response.json();

        if (data.success) {
          setPhaseCosts(data.data.phaseCosts || []);
        } else {
          setError("Failed to fetch phase costs data");
        }
      } catch (err) {
        console.error("Error fetching phase costs:", err);
        setError("Error loading phase costs");
      } finally {
        setLoading(false);
      }
    };

    fetchPhaseCosts();
  }, []);

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M DZD`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K DZD`;
    }
    return `${amount.toLocaleString()} DZD`;
  };

  // Calculate total amount from phase costs
  const getTotalAmount = () => {
    if (!phaseCosts) return "0";
    const total = phaseCosts.reduce((sum, phase) => {
      return sum + (phase.actualCost || phase.plannedCost || 0);
    }, 0);
    return formatCurrency(total);
  };

  // Transform phase costs to state data format
  const getStatesData = () => {
    if (!phaseCosts) return [];

    return phaseCosts.slice(0, 4).map((phase, index) => {
      const colors = ["#f44336", "#ff9800", "#8bc34a", "#cccccc"];
      return {
        state: `Phase${phase.phaseNumber || index + 1}`,
        amount: formatCurrency(phase.actualCost || phase.plannedCost || 0),
        color: colors[index] || "#cccccc",
      };
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl w-[1800px] max-w-3xl shadow-sm h-full">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl w-[1800px] max-w-3xl shadow-sm h-full">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const totalAmount = getTotalAmount();
  const statesData = getStatesData();

  return (
    <div className="bg-white p-6 rounded-xl w-[1800px] max-w-3xl shadow-sm h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl  text-gray-900">Phases</h1>
        <div className="flex items-center space-x-2">
          <button className="p-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M19,3H5C3.89,3,3,3.89,3,5v14c0,1.11,0.89,2,2,2h14c1.11,0,2-0.89,2-2V5C21,3.89,20.11,3,19,3z M10,17l-5-5l1.41-1.41 L10,14.17l7.59-7.59L19,8L10,17z" />
            </svg>
          </button>
          <button className="p-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row justify-between items-center">
        {/* Left side - Gauge */}
        <div className="relative mb-8 md:mb-0">
          <div className="w-96 h-48 relative">
            {/* Semi-circular gauge */}
            <svg className="w-full h-full" viewBox="0 0 200 100">
              {/* Background track */}
              <path
                d="M10,100 A90,90 0 0,1 190,100"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />

              {/* Multi-colored progress */}
              <path
                d="M10,100 A90,90 0 0,1 190,100"
                stroke="url(#gauge-gradient)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient
                  id="gauge-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#8bc34a" />
                  <stop offset="50%" stopColor="#ffeb3b" />
                  <stop offset="100%" stopColor="#f44336" />
                </linearGradient>
              </defs>
            </svg>

            {/* Central text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
              <span className="text-5xl text-black">{totalAmount}</span>
              <span className="text-xl text-gray-500 mt-1">Total Amount</span>
            </div>
          </div>
        </div>

        {/* Right side - States list */}
        <div className="w-full md:w-1/2">
          <div className="space-y-4">
            {statesData.map((item, index) => (
              <div key={index} className="flex items-center">
                {/* Color dot */}
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: item.color }}
                ></div>

                {/* State code */}
                <span className="text-2xl  w-16 text-gray-900">
                  {item.state}
                </span>

                {/* Dotted line */}
                <div className="flex-grow mx-2">
                  <div className="border-b border-dotted border-gray-300"></div>
                </div>

                {/* Amount */}
                <span className="text-2xl  text-gray-900">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
