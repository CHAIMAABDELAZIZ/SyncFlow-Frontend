import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Navbar";
import Card from "../components/Card";
import MapCard from "../components/MapCard";
import FlowChart from "../components/FlowChart";
import CostChart from "../components/CostChart";
import Info from "../components/info";

function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/dashboard/data"
        );
        const data = await response.json();

        if (data.success) {
          setDashboardData(data.data);
          console.log("Dashboard data loaded:", data.data);
        } else {
          setError("Failed to fetch dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <Info />
        <div className="grid grid-cols-6 gap-6 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-span-3">
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <Info />
        <div className="text-center py-8">
          <div className="text-red-500 text-xl mb-4">
            ⚠️ Error Loading Dashboard
          </div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <Info dashboardData={dashboardData} />
      <div className="grid grid-cols-6 gap-6 w-full">
        <div className="col-span-3">
          <Card />
        </div>
        <div className="col-span-3">
          <MapCard />
        </div>
        <div className="col-span-3">
          <FlowChart />
        </div>
        <div className="col-span-3">
          <CostChart />
        </div>
      </div>
    </div>
  );
}

export default Home;
