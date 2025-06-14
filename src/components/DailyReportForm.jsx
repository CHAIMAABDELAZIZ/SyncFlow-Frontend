import React from 'react';
import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function DailyReportForm() {
    const [formData, setFormData] = useState({
        reportName: '',
        reportDate: '',
        concernedWell: 'Well#A-109',
        phase: '',
        actualDepth: '',
        lithology: '',
        dailyCost: '',
        operations: [
            {
                id: 1,
                status: true,
                name: 'Drilling',
                cost: 500,
                indicators: [
                    { id: 1, value: '' }
                ]
            }
        ]
    });

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle operation status toggle
    const handleOperationStatusChange = (operationId) => {
        const updatedOperations = [...formData.operations];
        const operationIndex = updatedOperations.findIndex(op => op.id === operationId);
        if (operationIndex !== -1) {
            updatedOperations[operationIndex].status = !updatedOperations[operationIndex].status;
            setFormData({
                ...formData,
                operations: updatedOperations
            });
        }
    };

    // Handle operation cost change
    const handleCostChange = (operationId, value) => {
        const updatedOperations = [...formData.operations];
        const operationIndex = updatedOperations.findIndex(op => op.id === operationId);
        if (operationIndex !== -1) {
            updatedOperations[operationIndex].cost = value;
            setFormData({
                ...formData,
                operations: updatedOperations
            });
        }
    };

    // Handle operation name change
    const handleOperationNameChange = (operationId, value) => {
        const updatedOperations = [...formData.operations];
        const operationIndex = updatedOperations.findIndex(op => op.id === operationId);
        if (operationIndex !== -1) {
            updatedOperations[operationIndex].name = value;
            setFormData({
                ...formData,
                operations: updatedOperations
            });
        }
    };

    // Add new operation
    const addOperation = () => {
        const newId = Math.max(0, ...formData.operations.map(op => op.id)) + 1;

        const newOperation = {
            id: newId,
            status: true,
            name: 'Drilling',
            cost: 0,
            indicators: [
                { id: 1, value: '' }
            ]
        };

        setFormData({
            ...formData,
            operations: [...formData.operations, newOperation]
        });
    };

    // Remove operation
    const removeOperation = (operationId) => {
        const updatedOperations = formData.operations.filter(op => op.id !== operationId);
        setFormData({
            ...formData,
            operations: updatedOperations
        });
    };

    // Add indicator to operation
    const addIndicator = (operationId) => {
        const updatedOperations = [...formData.operations];
        const operationIndex = updatedOperations.findIndex(op => op.id === operationId);

        if (operationIndex !== -1) {
            const newIndicatorId = Math.max(0, ...updatedOperations[operationIndex].indicators.map(ind => ind.id)) + 1;
            updatedOperations[operationIndex].indicators.push({
                id: newIndicatorId,
                value: ''
            });

            setFormData({
                ...formData,
                operations: updatedOperations
            });
        }
    };

    // Remove indicator from operation
    const removeIndicator = (operationId, indicatorId) => {
        const updatedOperations = [...formData.operations];
        const operationIndex = updatedOperations.findIndex(op => op.id === operationId);

        if (operationIndex !== -1) {
            updatedOperations[operationIndex].indicators =
                updatedOperations[operationIndex].indicators.filter(ind => ind.id !== indicatorId);

            setFormData({
                ...formData,
                operations: updatedOperations
            });
        }
    };

    // Handle indicator value change
    const handleIndicatorChange = (operationId, indicatorId, value) => {
        const updatedOperations = [...formData.operations];
        const operationIndex = updatedOperations.findIndex(op => op.id === operationId);

        if (operationIndex !== -1) {
            const indicatorIndex = updatedOperations[operationIndex].indicators.findIndex(ind => ind.id === indicatorId);

            if (indicatorIndex !== -1) {
                updatedOperations[operationIndex].indicators[indicatorIndex].value = value;

                setFormData({
                    ...formData,
                    operations: updatedOperations
                });
            }
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        alert('Daily report submitted successfully!');
    };

    // Handle form discard
    const handleDiscard = () => {
        console.log('Form discarded');
    };

    return (
        <div className="min-h-screen p-6 text-gray-900">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Daily Report</h1>
                <p className="text-gray-600">Complete the daily report information</p>
            </div>

            <div className="space-y-6">
                {/* General Information */}
                <div className="bg-white rounded-lg p-6 border shadow-md border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">General Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-900">Report Name</label>
                            <input
                                type="text"
                                name="reportName"
                                value={formData.reportName}
                                onChange={handleInputChange}
                                className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="Report Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-900">Report Date</label>
                            <input
                                type="date"
                                name="reportDate"
                                value={formData.reportDate}
                                onChange={handleInputChange}
                                className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                style={{ colorScheme: 'light' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-900">Well</label>
                            <div className="relative">
                                <select
                                    name="concernedWell"
                                    value={formData.concernedWell}
                                    onChange={handleInputChange}
                                    className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                                >
                                    <option value="Well#A-109">Well#A-109</option>
                                    <option value="Well#B-201">Well#B-201</option>
                                    <option value="Well#C-303">Well#C-303</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Report Details */}
                <div className="bg-white rounded-lg p-6 border shadow-md border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Daily Report Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm mb-1 text-gray-900">Current Phase</label>
                            <div className="relative">
                                <select
                                    name="phase"
                                    value={formData.phase}
                                    onChange={handleInputChange}
                                    className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                                >
                                    <option value="">Select a phase</option>
                                    <option value="Phase 1 - Drilling 26''">Phase 1 - Drilling 26''</option>
                                    <option value="Phase 2 - Drilling 16''">Phase 2 - Drilling 16''</option>
                                    <option value="Phase 3 - Drilling 12 ¼''">Phase 3 - Drilling 12 ¼''</option>
                                    <option value="Phase 4 - Drilling 8 ½''">Phase 4 - Drilling 8 ½''</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-gray-900">Current Depth (ft)</label>
                            <input
                                type="number"
                                name="actualDepth"
                                value={formData.actualDepth}
                                onChange={handleInputChange}
                                className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="0"
                                style={{ colorScheme: 'light' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-gray-900">Lithology</label>
                            <div className="relative">
                                <select
                                    name="lithology"
                                    value={formData.lithology}
                                    onChange={handleInputChange}
                                    className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                                >
                                    <option value="">Select lithology</option>
                                    <option value="Sandstone">Sandstone</option>
                                    <option value="Shale">Shale</option>
                                    <option value="Limestone">Limestone</option>
                                    <option value="Dolomite">Dolomite</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>


                        <div>
                            <label className="block text-sm mb-1 text-gray-900">Daily Cost (DZD)</label>
                            <input
                                type="number"
                                name="dailyCost"
                                value={formData.dailyCost}
                                onChange={handleInputChange}
                                className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="0"
                                style={{ colorScheme: 'light' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Operations Section */}
                <div className="bg-white rounded-lg p-6 border shadow-md border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">Operations Performed</h2>
                        <button
                            type="button"
                            onClick={addOperation}
                            className="bg-orange-500 text-white hover:bg-orange-600 hover:text-gray-900 transition-all duration-200 flex items-center px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        >
                            <Plus size={16} className="mr-1" /> Add Operation
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-7">
                        Select all operations performed on this day from the complete list of possible operations, then indicate the cost of each selected operation.
                    </p>

                    <div className="space-y-4">
                        {formData.operations.map((operation) => (
                            <div key={operation.id} className="border border-gray-200 rounded-lg p-4 bg-white relative">
                                <button
                                    type="button"
                                    onClick={() => removeOperation(operation.id)}
                                    className="absolute bg-white border-none top-2 right-3 text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-3">
                                    <div className="flex items-center space-x-3 col-span-1">
                                        <div className="flex-col items-center justify-between w-20">
                                            <span className="text-sm text-gray-900">Status</span>
                                            <button
                                                type="button"
                                                className={`flex h-6 w-12 mt-2 items-center rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none ${operation.status ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'}`}
                                                onClick={() => handleOperationStatusChange(operation.id)}
                                            >
                                                <span className="h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-sm mb-1 text-gray-900">Operation Name</label>
                                        <div className="relative">
                                            <select
                                                value={operation.name}
                                                onChange={(e) => handleOperationNameChange(operation.id, e.target.value)}
                                                className="bg-white w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                                            >
                                                <option value="Drilling">Drilling</option>
                                                <option value="Drilling Fluid">Drilling Fluid</option>
                                                <option value="Run Casing">Run Casing</option>
                                                <option value="Cementing">Cementing</option>
                                                <option value="Logging">Logging</option>
                                                <option value="Testing">Testing</option>
                                                <option value="Completion">Completion</option>
                                                <option value="Abandonment">Abandonment</option>
                                                <option value="Coring / VSP">Coring / VSP</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-sm mb-1 text-gray-900">Cost (DZD)</label>
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                value={operation.cost}
                                                onChange={(e) => handleCostChange(operation.id, Number(e.target.value))}
                                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                placeholder="0"
                                                style={{ colorScheme: 'light' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Indicators Section */}
                                <div className="mt-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-medium text-gray-900">Indicators</h3>
                                        <button
                                            type="button"
                                            onClick={() => addIndicator(operation.id)}
                                            className="text-orange-500 bg-white hover:text-orange-600 transition-all duration-200 flex items-center text-sm"
                                        >
                                            <Plus size={16} className="mr-1" /> Add Indicator
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {operation.indicators.map((indicator) => (
                                            <div key={indicator.id} className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={indicator.value}
                                                    onChange={(e) => handleIndicatorChange(operation.id, indicator.id, e.target.value)}
                                                    className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                    placeholder="Indicator name ; indicator value"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeIndicator(operation.id, indicator.id)}
                                                    className="text-white hover:text-red-500  transition-colors"
                                                    style={{
                                                        backgroundColor: '#FF8500',

                                                    }}
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-6 mt-8">
                    <button
                        type="button"
                        onClick={handleDiscard}
                        className="px-8 py-2.5 bg-white border border-orange-300 text-orange-500 rounded-md hover:bg-orange-50 transition-all duration-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-10 py-2.5 bg-orange-500 text-gray-900 rounded-md hover:bg-orange-600 hover:text-gray-900 transition-all duration-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-600"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}