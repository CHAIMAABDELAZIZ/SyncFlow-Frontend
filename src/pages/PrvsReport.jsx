import DailyReportForm from '@/components/DailyReportForm'
import PrvsnlForm from '@/components/PrvsnlForm'
import React from 'react'

export default function PrvsReport() {
  return (
    <div className="text-black p-4 space-y-6 ">
          {/* Your existing Info component remains unchanged */}
          {/* <div>
            <h1 className="text-3xl font-bold text-gray-900">Fill a provisional report</h1>
            <p className="text-gray-500">Jun 1 2025</p>
          </div> */}
          
          {/* The new reports table component */}
          <PrvsnlForm/>
          {/* <DailyReportForm/> */}
        </div>
  )
}
