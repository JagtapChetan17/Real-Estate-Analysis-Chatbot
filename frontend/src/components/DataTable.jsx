import React, { useState } from 'react'

const DataTable = ({ data, area }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 8

  if (!data.rows || data.rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 md:py-12 text-gray-500">
        <svg className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-base md:text-lg font-medium mb-2">No Real Data Available</p>
        <p className="text-xs md:text-sm text-center">
          No table data found in the uploaded Excel file for {area}.
        </p>
      </div>
    )
  }

  // Calculate pagination
  const totalPages = Math.ceil(data.rows.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentRows = data.rows.slice(startIndex, endIndex)

  const formatCellValue = (value, columnName) => {
    if (value === null || value === undefined || value === 'N/A') {
      return <span className="text-gray-400">-</span>
    }

    if (typeof value === 'string' && value.startsWith('₹')) {
      return <span className="font-mono text-green-600 text-xs md:text-sm">{value}</span>
    }

    if (typeof value === 'number') {
      if (columnName.toLowerCase().includes('rate') || columnName.toLowerCase().includes('price')) {
        return <span className="font-mono text-blue-600 text-xs md:text-sm">₹{value.toLocaleString()}</span>
      }
      if (columnName.toLowerCase().includes('sales')) {
        if (value >= 10000000) {
          return <span className="font-mono text-green-600 text-xs md:text-sm">₹{(value / 10000000).toFixed(1)}Cr</span>
        } else if (value >= 100000) {
          return <span className="font-mono text-green-600 text-xs md:text-sm">₹{(value / 100000).toFixed(1)}L</span>
        }
        return <span className="font-mono text-green-600 text-xs md:text-sm">₹{value.toLocaleString()}</span>
      }
      return <span className="font-mono text-xs md:text-sm">{value.toLocaleString()}</span>
    }

    return <span className="text-xs md:text-sm">{value}</span>
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Data Source Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full bg-green-100 text-green-800 text-xs md:text-sm">
            <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Real Excel Data
          </span>
          <span className="text-xs md:text-sm text-gray-600">
            Showing {data.rows.length} records for {area}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {data.columns.map((column, index) => (
                <th
                  key={index}
                  className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRows.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex} 
                    className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap"
                  >
                    {formatCellValue(cell, data.columns[cellIndex])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs md:text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, data.rows.length)} of {data.rows.length} records
          </div>
          <div className="flex space-x-1 md:space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Data Quality Note */}
      <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs md:text-sm font-medium text-blue-800">Real Data Source</p>
            <p className="text-xs md:text-sm text-blue-700 mt-1">
              This table shows actual data extracted from your uploaded Excel file. 
              All values are displayed exactly as they appear in your dataset.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataTable