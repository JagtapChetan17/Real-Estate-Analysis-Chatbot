import React, { useState } from 'react'
import { uploadFile } from '../api/api'
import Spinner from './Spinner'
import { card } from '../styles/inlineStyles'

const UploadPanel = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const validateFile = (file) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return 'Please upload an Excel file (.xlsx or .xls)'
    }

    if (file.size > 10 * 1024 * 1024) {
      return 'File size too large. Maximum size is 10MB.'
    }

    if (file.size === 0) {
      return 'File appears to be empty.'
    }

    return null
  }

  const handleFile = async (file) => {
    const validationError = validateFile(file)
    if (validationError) {
      setUploadMessage(`❌ ${validationError}`)
      return
    }

    setIsUploading(true)
    setUploadMessage('')

    try {
      const response = await uploadFile(file)
      console.log('Upload response:', response)
      
      if (response.areas && Array.isArray(response.areas)) {
        setUploadMessage(`✅ ${response.message} Found ${response.areas.length} areas.`)
        onFileUpload(response.areas)
      } else {
        setUploadMessage(`✅ ${response.message} (No areas found in file)`)
        onFileUpload([])
      }
    } catch (error) {
      console.error('Upload error:', error)
      let errorMessage = 'Upload failed. Please try again.'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setUploadMessage(`❌ ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div style={card.primary} className="p-4 md:p-6 animate-fadeIn">
      <div className="flex items-center space-x-2 mb-4 md:mb-5">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Upload Excel File
          </h2>
          <p className="text-xs md:text-sm text-gray-600">
            Upload your real estate data for analysis
          </p>
        </div>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-xl md:rounded-2xl p-6 md:p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105'
            : 'border-gray-300 hover:border-gray-400 bg-gradient-to-br from-white to-gray-50'
        } ${isUploading ? 'opacity-50' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && document.getElementById('file-upload').click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center space-y-3 md:space-y-4">
            <div className="relative">
              <Spinner size="lg" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
            </div>
            <div>
              <p className="text-gray-700 text-sm md:text-base font-medium">Uploading and processing file...</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Analyzing Excel data structure</p>
            </div>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse-slow"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              <p className="text-gray-700 font-semibold text-base md:text-lg">
                <span className="text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                Excel files only (.xlsx, .xls) up to 10MB
              </p>
              
              <div className="pt-2">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center space-x-2 px-5 md:px-6 py-2.5 md:py-3 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    isUploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="font-medium text-sm md:text-base">Choose Excel File</span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>

      {uploadMessage && (
        <div className={`mt-4 p-3 md:p-4 rounded-xl text-sm md:text-base transition-all duration-300 animate-slideUp ${
          uploadMessage.includes('✅') 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {uploadMessage.includes('✅') ? (
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{uploadMessage}</span>
          </div>
        </div>
      )}

      <div className="mt-5 md:mt-6 text-xs md:text-sm text-gray-600">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 01118 0z" />
          </svg>
          <p className="font-medium text-gray-700">How it works:</p>
        </div>
        <ul className="space-y-1.5 pl-1">
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Upload an Excel file with real estate data (year, area, price, sales, etc.)</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>The system automatically detects area/location columns</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>All unique areas appear in the "Available Areas" list</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Click any area to analyze it with AI-powered insights</span>
          </li>
        </ul>
        
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <p className="font-medium text-blue-800 text-xs mb-1">Expected Excel format:</p>
          <p className="text-xs text-blue-700">
            Columns like <code className="bg-white px-1 py-0.5 rounded text-blue-600">final_location</code>,{' '}
            <code className="bg-white px-1 py-0.5 rounded text-blue-600">year</code>,{' '}
            <code className="bg-white px-1 py-0.5 rounded text-blue-600">flat_weighted_average_rate</code>,{' '}
            <code className="bg-white px-1 py-0.5 rounded text-blue-600">total_sales_igr</code>, etc.
          </p>
        </div>
      </div>
    </div>
  )
}

export default UploadPanel