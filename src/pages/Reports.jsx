// app/reports/page.jsx
import React from 'react'
import ReportsTable from '../components/ReportsTable'
import InfoReports from '../components/InfoReports'

export default function Reports() {
    return (
        <div className="text-black p-4 space-y-6">
            {/* Your existing Info component remains unchanged */}

            {/* The new reports table component */}
            <ReportsTable />
        </div>
    )
}