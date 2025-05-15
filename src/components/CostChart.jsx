import React from 'react';
import { MoreVertical } from 'lucide-react';

const CostChart = () => {
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

            <div className="mt-4 relative h-56">
                {/* Chart Grid */}
                <div className="absolute left-0 top-0 h-full w-full flex flex-col justify-between text-xs text-gray-500">
                    <div className="border-b border-gray-100">100</div>
                    <div className="border-b border-gray-100">80</div>
                    <div className="border-b border-gray-100">60</div>
                    <div className="border-b border-gray-100">40</div>
                    <div className="border-b border-gray-100">20</div>
                    <div>0</div>
                </div>

                {/* Chart Lines */}
                <div className="absolute top-0 left-8 right-8 h-full pt-6">
                    {/* Vertical Marker */}
                    <div className="absolute top-0 left-1/2 h-full border-l-2 border-dashed border-gray-400"></div>

                    {/* Bottom Marker */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-4 bg-black transform rotate-45"></div>
                    </div>

                    {/* Top Marker */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-4 bg-black transform rotate-45"></div>
                    </div>

                    {/* Lines */}
                    <svg viewBox="0 0 400 200" className="w-full h-full ">
                        {/* Build and Hold Line */}
                        <path
                            d="M0,180 C50,180 100,170 150,170 S200,160 250,150 S300,120 350,90 S400,70 450,60"
                            fill="none"
                            stroke="#d1d5db"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />

                        {/* Investment Line */}
                        <path
                            d="M0,180 C50,180 100,170 150,170 S200,160 250,140 S300,110 350,70 S400,50 450,40"
                            fill="none"
                            stroke="#9ca3af"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />

                        {/* Development Line */}
                        <path
                            d="M0,180 C50,180 100,170 150,150 S200,140 250,120 S300,65 350,40 S400,20 450,10"
                            fill="none"
                            stroke="#fb923c"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />

                        {/* Point  */}
                        <circle cx="250" cy="120" r="8" fill="#fb923c" stroke="white" strokeWidth="2" />
                    </svg>
                </div>

                {/* Orange Highlight Point */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="mt-1 ml-1">
                        <div className="bg-black text-white px-2 py-1 rounded text-xs">
                            <span>37</span>
                            <span className="text-green-400 ml-1">+1.8%</span>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="absolute top-4 right-8 flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <div className="px-3 py-1 bg-orange-400 text-white rounded-full text-xs">
                            Development
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-3 py-1 bg-gray-300 text-white rounded-full text-xs">
                            Investment
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-3 py-1 bg-gray-300 text-white rounded-full text-xs">
                            Build and Hold
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostChart;