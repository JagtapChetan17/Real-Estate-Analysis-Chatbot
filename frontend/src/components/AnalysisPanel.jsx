import React, { useState, useEffect } from 'react'
import Chart from './Chart'
import DataTable from './DataTable'
import Spinner from './Spinner'
import { getChartData, getTableData, exportData, compareAreas } from '../api/api'

const AnalysisPanel = ({
  area,
  analysisData,
  isLoading,
  isMobile,
  onBackToChat
}) => {
  const [activeTab, setActiveTab] = useState('summary')
  const [chartType, setChartType] = useState('price')
  const [chartData, setChartData] = useState(null)
  const [tableData, setTableData] = useState(null)
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState(null)
  const [compareArea, setCompareArea] = useState('')
  const [comparisonResult, setComparisonResult] = useState(null)
  const [comparing, setComparing] = useState(false)

  useEffect(() => {
    if (area && activeTab === 'chart') {
      loadChartData()
    }
  }, [area, activeTab, chartType])

  useEffect(() => {
    if (area && activeTab === 'table') {
      loadTableData()
    }
  }, [area, activeTab])

  const loadChartData = async () => {
    if (!area) return
    
    setIsChartLoading(true)
    try {
      const data = await getChartData(area, chartType)
      setChartData(data)
    } catch (error) {
      console.error('Error loading chart data:', error)
      setChartData({ labels: [], datasets: [] })
    } finally {
      setIsChartLoading(false)
    }
  }

  const loadTableData = async () => {
    if (!area) return
    
    setIsTableLoading(true)
    try {
      const data = await getTableData(area)
      setTableData(data)
    } catch (error) {
      console.error('Error loading table data:', error)
      setTableData({ columns: [], rows: [], total: 0 })
    } finally {
      setIsTableLoading(false)
    }
  }

  const handleExport = async (format) => {
    if (!area) return
    
    setExporting(true)
    setExportMessage(null)
    
    try {
      const result = await exportData(area, format)
      
      // Show success message
      setExportMessage({
        type: 'success',
        text: result.message,
        filename: result.filename
      })
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setExportMessage(null)
      }, 5000)
      
    } catch (error) {
      console.error('Export error:', error)
      
      // Show error message
      setExportMessage({
        type: 'error',
        text: error.message
      })
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setExportMessage(null)
      }, 5000)
      
    } finally {
      setExporting(false)
    }
  }

  const handleCompare = async () => {
    if (!area || !compareArea.trim()) return
    
    setComparing(true)
    try {
      const result = await compareAreas(area, compareArea)
      setComparisonResult(result)
    } catch (error) {
      console.error('Comparison error:', error)
      // Show error alert
      alert(`Error comparing areas: ${error.message}`)
    } finally {
      setComparing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Analyzing real estate data for</p>
          <p className="text-lg font-bold text-blue-600 mt-1">{area}</p>
          <p className="text-sm text-gray-500 mt-2">Processing from uploaded Excel file...</p>
        </div>
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <div className="text-center text-gray-500 max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700">No Analysis Data</h3>
          <p className="text-gray-500 text-sm mb-4">Select an area to see detailed analysis</p>
          {isMobile && (
            <button
              onClick={onBackToChat}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Back to Chat
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onBackToChat}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-800 truncate max-w-xs">
            {area}
          </h2>
          <div className="w-10"></div>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-800">{area}</h2>
                  <p className="text-gray-600 text-sm">
                    Real estate analysis from uploaded Excel data
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Real Data</span>
              </div>
              {analysisData.key_metrics?.record_count && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{analysisData.key_metrics.record_count} Records</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex overflow-x-auto scrollbar-thin">
          {['summary', 'chart', 'table', 'compare', 'export'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                if (tab === 'compare') {
                  setComparisonResult(null)
                  setCompareArea('')
                }
                if (tab === 'export') {
                  setExportMessage(null)
                }
              }}
              className={`flex-1 min-w-0 py-3 px-2 text-center font-medium transition-all duration-300 border-b-2 whitespace-nowrap text-sm ${
                activeTab === tab
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                {tab === 'summary' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {tab === 'chart' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )}
                {tab === 'table' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                {tab === 'compare' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )}
                {tab === 'export' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
                <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div 
        className="flex-1 overflow-y-auto p-4 bg-white"
        style={{ paddingBottom: isMobile ? '120px' : '20px' }}
      >
        {/* Export Success/Error Message */}
        {exportMessage && (
          <div className={`mb-4 p-3 rounded-lg border ${
            exportMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {exportMessage.type === 'success' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="font-medium">{exportMessage.text}</span>
                {exportMessage.filename && (
                  <span className="text-sm opacity-75">({exportMessage.filename})</span>
                )}
              </div>
              <button
                onClick={() => setExportMessage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
                        </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-2 lg:space-y-0">
              <h3 className="text-base font-semibold text-gray-800 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>AI Analysis Summary</span>
              </h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                AI Generated
              </span>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-blue-800 font-medium text-sm mb-2">AI Analysis</p>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {analysisData.ai_summary || "Generating AI analysis..."}
                  </p>
                </div>
              </div>
            </div>
            
            {analysisData.key_metrics && Object.keys(analysisData.key_metrics).length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Key Metrics</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Price Metrics */}
                  {analysisData.key_metrics.price_data && Object.keys(analysisData.key_metrics.price_data).length > 0 && (
                    <div className="bg-white border border-blue-100 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <h5 className="font-semibold text-blue-700">Price Metrics (₹/sqft)</h5>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(analysisData.key_metrics.price_data).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-sm text-gray-600 capitalize">
                              {key.replace('_weighted_average_rate', '').replace('_', ' ')}:
                            </span>
                            <div className="text-right">
                              <div className="font-bold text-blue-600">₹{value.avg?.toLocaleString('en-IN') || 'N/A'}</div>
                              <div className="text-xs text-gray-500">
                                Range: ₹{value.min?.toLocaleString('en-IN') || 'N/A'} - ₹{value.max?.toLocaleString('en-IN') || 'N/A'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Sales Metrics */}
                  {analysisData.key_metrics.sales_data && Object.keys(analysisData.key_metrics.sales_data).length > 0 && (
                    <div className="bg-white border border-green-100 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h5 className="font-semibold text-green-700">Sales Metrics</h5>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(analysisData.key_metrics.sales_data).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-sm text-gray-600 capitalize">
                              {key.replace('_igr', '').replace('_', ' ')}:
                            </span>
                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                {key.includes('sales') ? `₹${(value.total / 10000000).toFixed(1)}Cr` : value.total?.toLocaleString('en-IN')}
                              </div>
                              <div className="text-xs text-gray-500">
                                Avg: {key.includes('sales') ? `₹${(value.avg / 10000000).toFixed(1)}Cr` : value.avg?.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <div className="flex flex-col space-y-3 mb-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Data Visualization</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {['price', 'demand', 'composition'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-1 text-xs ${
                      chartType === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {type === 'price' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      )}
                      {type === 'demand' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      )}
                      {type === 'composition' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      )}
                    </svg>
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            {isChartLoading ? (
              <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
                <Spinner size="md" />
                <span className="text-gray-600 mt-3 text-sm font-medium">Loading chart data...</span>
              </div>
            ) : chartData ? (
              <div style={{ height: isMobile ? '300px' : '400px' }}>
                <Chart data={chartData} type={chartType} area={area} isMobile={isMobile} />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium mb-1 text-gray-600">No Chart Data</p>
                <p className="text-xs text-gray-500">
                  No {chartType} data found for {area} in the uploaded file
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'table' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-2 lg:space-y-0">
              <h3 className="text-base font-semibold text-gray-800 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Data Table</span>
              </h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                Raw Excel Data
              </span>
            </div>
            
            {isTableLoading ? (
              <div className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border border-gray-200">
                <Spinner size="md" />
                <span className="text-gray-600 mt-3 text-sm font-medium">Loading table data...</span>
              </div>
            ) : tableData ? (
              <DataTable data={tableData} area={area} isMobile={isMobile} />
            ) : (
              <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium mb-1 text-gray-600">No Table Data</p>
                <p className="text-xs text-gray-500">
                  No table data found for {area}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Compare Areas</span>
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-medium mb-2">Compare {area} with another area</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={compareArea}
                  onChange={(e) => setCompareArea(e.target.value)}
                  placeholder="Enter area name to compare..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleCompare}
                  disabled={!compareArea.trim() || comparing}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                  {comparing ? 'Comparing...' : 'Compare'}
                </button>
              </div>
            </div>
            
            {comparing ? (
              <div className="flex flex-col items-center justify-center h-32">
                <Spinner size="md" />
                <span className="text-gray-600 mt-3 text-sm font-medium">Comparing areas...</span>
              </div>
            ) : comparisonResult ? (
              comparisonResult.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{comparisonResult.error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Comparison: {comparisonResult.area1} vs {comparisonResult.area2}
                    </h4>
                    
                    {comparisonResult.comparison && Object.keys(comparisonResult.comparison).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(comparisonResult.comparison).map(([key, data]) => (
                          <div key={key} className="border-b border-gray-100 pb-3 last:border-b-0">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-700 capitalize">
                                {key.replace('_', ' ')}
                              </span>
                              <span className={`text-sm font-medium px-2 py-1 rounded ${
                                data.difference_percent > 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : data.difference_percent < 0 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {data.difference_percent > 0 ? '+' : ''}{data.difference_percent.toFixed(1)}%
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">
                                  {key.includes('sales') ? `₹${(data[comparisonResult.area1] / 10000000).toFixed(1)}Cr` : 
                                   data[comparisonResult.area1]?.toLocaleString('en-IN')}
                                </div>
                                <div className="text-xs text-gray-500">{comparisonResult.area1}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                  {key.includes('sales') ? `₹${(data[comparisonResult.area2] / 10000000).toFixed(1)}Cr` : 
                                   data[comparisonResult.area2]?.toLocaleString('en-IN')}
                                </div>
                                <div className="text-xs text-gray-500">{comparisonResult.area2}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No comparison data available</p>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Enter an area name to compare with {area}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Export Data</span>
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-medium mb-2">Download {area} data in your preferred format</p>
              <p className="text-gray-600 text-sm mb-4">Export the filtered data for {area} for further analysis or sharing.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { format: 'csv', name: 'CSV', color: 'blue', description: 'Comma Separated Values', icon: '📊' },
                  { format: 'excel', name: 'Excel', color: 'green', description: 'Microsoft Excel', icon: '📈' },
                  { format: 'json', name: 'JSON', color: 'purple', description: 'JavaScript Object Notation', icon: '📄' }
                ].map((item) => (
                  <button
                    key={item.format}
                    onClick={() => handleExport(item.format)}
                    disabled={exporting}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-300 ${
                      exporting
                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      item.color === 'blue' ? 'bg-blue-100' :
                      item.color === 'green' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      <span className="text-xl">{item.icon}</span>
                    </div>
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="text-xs text-gray-500 mt-1 text-center">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {exporting && (
              <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg bg-gray-50">
                <Spinner size="md" />
                <span className="ml-3 text-gray-600 mt-3">Preparing download...</span>
                <p className="text-sm text-gray-500 mt-2">Exporting data for {area}</p>
              </div>
            )}
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 01118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Export Information</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    The exported data will contain all records for <strong>{area}</strong> from your uploaded Excel file.
                    All original data formatting and values are preserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalysisPanel