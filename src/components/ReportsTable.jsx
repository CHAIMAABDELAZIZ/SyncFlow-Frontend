import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '../components/ui/dropdown-menu';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 8;

export default function ReportsTable() {
    const [activeTab, setActiveTab] = useState('Journaliers');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReports, setSelectedReports] = useState([]);
    const [reports, setReports] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setError(null);
        setLoading(true);
        if (activeTab === 'Prévisionnels') {
            const fetchWells = async () => {
                try {
                    const response = await axios.get('http://localhost:8080/api/puits');
                    if (response.data.success) {
                        const reportData = response.data.data.map((well, index) => ({
                            id: index + 1,
                            identifier: `report-${well.id}`,
                            well: well.name || `Well #${well.id}`,
                            wellId: well.id.toString(),
                        }));
                        setReports(reportData);
                    } else {
                        throw new Error('API response indicates failure');
                    }
                } catch (error) {
                    console.error('Error fetching wells:', error.message);
                    setError(`Failed to fetch wells: ${error.message}`);
                    setReports(
                        Array.from({ length: 40 }, (_, i) => ({
                            id: i + 1,
                            identifier: `report-x${i + 2323}`,
                            well: 'Well #A-105',
                            wellId: `x${i + 2323}`,
                        }))
                    );
                } finally {
                    setLoading(false);
                }
            };
            fetchWells();
        } else {
            setReports(
                Array.from({ length: 40 }, (_, i) => ({
                    id: i + 1,
                    identifier: `Report_x${i + 2323}.xlsx`,
                    well: 'Well #A-105',
                    wellId: `x${i + 2323}`,
                }))
            );
            setLoading(false);
        }
    }, [activeTab]);

    const filteredReports = reports.filter((report) =>
        report.identifier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
    const paginatedReports = filteredReports.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredReports);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
        XLSX.writeFile(workbook, 'Reports.xlsx');
    };

    const toggleSelect = (id) => {
        setSelectedReports((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
    };

    const isSelected = (id) => selectedReports.includes(id);

    const handleRowClick = (wellId) => {
        navigate(`/provisional-report/${wellId}`);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-semibold">Reports lists</h1>
                <div className="flex gap-2">
                    <Button
                        className="bg-white border border-orange-500 text-gray-700 hover:bg-orange-50"
                        onClick={exportToExcel}
                    >
                        Export
                    </Button>
                    <Button
                        onClick={() => navigate('/home')}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        + Add a report
                    </Button>
                </div>
            </div>

            <p className="text-gray-500 text-sm mb-4">
                A descriptive of the{' '}
                <span className="text-orange-600 font-medium cursor-pointer">list of reports</span>
            </p>

            <div className="flex gap-2 mb-4 bg-white p-2 rounded">
                {['Journaliers', 'Prévisionnels'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded px-4 py-2 text-sm border transition-all ${activeTab === tab
                            ? 'bg-white text-black border-orange-500'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-500 hover:text-orange-500'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>



            {loading && <div className="text-center py-6 text-gray-500">Loading...</div>}
            {error && !loading && <div className="mb-4 text-red-500 text-sm">{error}</div>}

            {!loading && (
                <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 items-center bg-white px-4 py-3 text-sm font-medium">
                        <div className="col-span-1">
                            <input
                                type="checkbox"
                                disabled
                                className="appearance-none w-4 h-4 border border-gray-300 rounded bg-white checked:bg-orange-500 disabled:opacity-50"
                            />
                        </div>
                        <div className="col-span-5">Identifier</div>
                        <div className="col-span-4">Well Associated</div>
                    </div>

                    {paginatedReports.length > 0 ? (
                        paginatedReports.map((report) => (
                            <div
                                key={report.id}
                                className="grid grid-cols-12 items-center px-4 py-3 border-t hover:bg-gray-50 text-sm bg-white cursor-pointer"
                                onClick={() => handleRowClick(report.wellId)}
                            >
                                <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
                                    <label className="relative inline-block w-4 h-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected(report.id)}
                                            onChange={() => toggleSelect(report.id)}
                                            className="peer appearance-none w-4 h-4 border border-gray-300 rounded bg-white checked:bg-orange-500"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <svg
                                            className="absolute top-0 left-0 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </label>




                                </div>
                                <div className="col-span-5">{report.identifier}</div>
                                <div className="col-span-4">{report.well}</div>

                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-gray-500">No reports available.</div>
                    )}
                </div>
            )}

            {!loading && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <span>
                        {filteredReports.length > 0
                            ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1} – ${Math.min(
                                currentPage * ITEMS_PER_PAGE,
                                filteredReports.length
                            )} of ${filteredReports.length} items`
                            : '0 items'}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}

                            style={{
                                backgroundColor: '#ffffff', // light gray, change to any valid CSS color
                                color: '#000' // optional: text color for contrast
                            }}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            style={{ backgroundColor: '#FF8500', }}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}