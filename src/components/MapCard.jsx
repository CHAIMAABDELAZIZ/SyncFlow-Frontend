import React from 'react';
import { Calendar, MoreVertical, Plus, Minus, Maximize } from 'lucide-react';

const MapCard = () => {
    return (
        <div className="col-span-3 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-800">Total drilling cost</h2>

            </div>

            <div className="flex items-center">

                {/* Map Visualization */}
                <div className="flex-1 relative">
                    <div className="h-64 bg-gray-100 rounded-lg relative overflow-hidden">
                        {/* Simplified Algeria Map Shape */}
                        <div className="h-64 bg-white rounded-lg relative overflow-hidden">
                            <img
                                src="src/assets/features.svg"
                                alt="Algeria Map"
                                className="w-full h-full object-contain"
                            />

                            {/* South Algeria Callout */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg">
                                    <p className="text-2xl font-bold">$3.2M</p>
                                    <p className="text-xs">South Algeria</p>
                                </div>
                            </div>
                        </div>


                    </div>

    
                </div>
            </div>
        </div>
    );
};

export default MapCard;