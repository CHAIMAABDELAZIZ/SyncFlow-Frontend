import React from "react";

const Info = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Jun 1 - Aug 31, 2025</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-4 md:mt-0">
        <div className="p-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-5xl text-black font-bold">7,052</span>
            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-medium">
              $23.2M
            </span>
          </div>
          <p className="text-gray-500 mt-1"> Wells done </p>
        </div>

        <div className="p-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-5xl text-black font-bold">34</span>
            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-medium">
              $13.2M
            </span>
          </div>
          <p className="text-gray-500 mt-1">Wells in progress</p>
        </div>
      </div>
    </div>
  );
};

export default Info;
