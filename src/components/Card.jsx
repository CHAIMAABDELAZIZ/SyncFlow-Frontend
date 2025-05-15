import { useState } from 'react';

export default function BorrowersByState() {
    // Data to match exactly what's in the image
    const totalAmount = "$25.5M";
    const statesData = [
        { state: "QLD", amount: "$18.5M", color: "#f44336" }, // red
        { state: "SA", amount: "$3.9M", color: "#ff9800" },   // orange
        { state: "WA", amount: "$3.2M", color: "#8bc34a" },   // green
        { state: "VIC", amount: "$0M", color: "#cccccc" }     // grey
    ];

    return (
        <div className="bg-white p-6 rounded-xl w-[1800px] max-w-3xl shadow-sm h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl  text-gray-900">Borrowers by State</h1>
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
                                strokeWidth="8" // plus fin
                                fill="none"
                            />

                            {/* Multi-colored progress */}
                            <path
                                d="M10,100 A90,90 0 0,1 190,100"
                                stroke="url(#gauge-gradient)"
                                strokeWidth="10" // plus fin
                                fill="none"
                                strokeLinecap="round"
                            />

                            {/* Gradient definition */}
                            <defs>
                                <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#8bc34a" />
                                    <stop offset="50%" stopColor="#ffeb3b" />
                                    <stop offset="100%" stopColor="#f44336" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Central text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
                            <span className="text-5xl text-black ">{totalAmount}</span>
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
                                <span className="text-2xl  w-16 text-gray-900">{item.state}</span>

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
}