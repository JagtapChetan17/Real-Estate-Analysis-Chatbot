import React, { useState, useEffect } from 'react'
import ChatWindow from './components/ChatWindow'
import UploadPanel from './components/UploadPanel'
import AnalysisPanel from './components/AnalysisPanel'
import { getAreas, getAnalysis } from './api/api'

const App = () => {
  const [messages, setMessages] = useState([])
  const [currentArea, setCurrentArea] = useState('')
  const [analysisData, setAnalysisData] = useState(null)
  const [areas, setAreas] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState('chat')
  const [backendStatus, setBackendStatus] = useState('checking')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [showUploadSidebar, setShowUploadSidebar] = useState(!(window.innerWidth < 1024))

  // Update browser tab title
  useEffect(() => {
    document.title = "EstateInsight AI - Smart Real Estate Analysis"
  }, [])

  useEffect(() => {
    loadAreas()
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setShowUploadSidebar(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadAreas = async () => {
    try {
      const response = await getAreas()
      setAreas(response.areas || [])
      setBackendStatus('connected')
      
      if (messages.length === 0) {
        addMessage('bot', 'Welcome! Upload an Excel file with real estate data to get started.')
      }
    } catch (error) {
      console.error('Error loading areas:', error)
      setBackendStatus('error')
      setAreas([])
      
      if (messages.length === 0) {
        addMessage('bot', 'Please upload an Excel file to analyze real data.')
      }
    }
  }

  const handleFileUpload = (newAreas) => {
    setAreas(newAreas)
    loadAreas()
    
    if (newAreas.length > 0) {
      addMessage('bot', `✅ Excel file uploaded successfully! Found ${newAreas.length} real areas. You can now analyze any area.`)
    } else {
      addMessage('bot', '⚠️ File uploaded but no areas found. Please check your Excel file format.')
    }
  }

  const handleAnalyze = async (area) => {
    if (!area.trim()) return

    setIsLoading(true)
    setCurrentArea(area)
    
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `Analyze ${area}`,
      area,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    
    if (isMobile) {
      setActiveView('analysis')
      setShowUploadSidebar(false)
    }

    try {
      const analysisResponse = await getAnalysis(area)
      setAnalysisData(analysisResponse)
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `📊 Analysis ready for ${area}. Click the Analysis tab to view detailed insights.`,
        area,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
      
    } catch (error) {
      console.error('Error analyzing area:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `❌ Sorry, I couldn't analyze data for ${area}. Please check if the area exists in your uploaded file.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const addMessage = (type, content, area) => {
    const message = {
      id: Date.now().toString(),
      type,
      content,
      area,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }

  const toggleUploadSidebar = () => {
    setShowUploadSidebar(!showUploadSidebar)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      {!isMobile && (
        <header className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-500 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-blue-600">
              EstateInsight AI
            </h1>
          </div>
          <p className="text-sm text-center text-gray-600">
            Smart Real Estate Analysis Powered by AI
          </p>
        </header>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm lg:hidden">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleUploadSidebar}
              className="p-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-blue-600">
                EstateInsight
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              backendStatus === 'connected' ? 'bg-green-500' : 
              backendStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-xs text-gray-600">
              {areas.length > 0 ? `${areas.length} areas` : 'No data'}
            </span>
          </div>
        </div>
      )}

      <div className="flex" style={{ 
        height: !isMobile ? 'calc(100vh - 80px)' : 'calc(100vh - 64px)'
      }}>
        {/* Upload Sidebar */}
        {(showUploadSidebar || !isMobile) && (
          <div className={`
            ${isMobile ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : 'w-1/3 min-w-80 flex-shrink-0'}
            flex flex-col border-r border-gray-200 bg-white h-full
          `}>
            {/* Mobile Sidebar Header */}
            {isMobile && (
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Upload Data</h2>
                <button
                  onClick={toggleUploadSidebar}
                  className="p-2 text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Sidebar Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <UploadPanel onFileUpload={handleFileUpload} />
                
                {/* Areas List */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-800">
                      Available Areas
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
                        {areas.length}
                      </span>
                      {areas.length > 0 && (
                        <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded">
                          Real Data
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {areas.length === 0 ? (
                    <div className="py-6 text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">No areas available</p>
                      <p className="mt-1 text-xs text-gray-400">Upload an Excel file to get started</p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-60">
                      <div className="space-y-2">
                        {areas.map((area, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnalyze(area)}
                            className="flex items-center justify-between w-full p-3 text-sm text-left text-gray-700 transition-colors border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200"
                          >
                            <div className="flex items-center flex-1 min-w-0">
                              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3 bg-blue-100 rounded-lg">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <span className="font-medium truncate">{area}</span>
                            </div>
                            <svg className="flex-shrink-0 w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 h-full min-w-0">
          {/* View Tabs - Desktop */}
          {!isMobile && (
            <div className="flex bg-white border-b border-gray-200">
              <button
                onClick={() => setActiveView('chat')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeView === 'chat'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Chat</span>
                </div>
              </button>
              <button
                onClick={() => setActiveView('analysis')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeView === 'analysis'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Analysis</span>
                </div>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden bg-white">
            {activeView === 'chat' ? (
              <ChatWindow
                messages={messages}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                areas={areas}
                isMobile={isMobile}
                onToggleSidebar={toggleUploadSidebar}
              />
            ) : (
              <AnalysisPanel
                area={currentArea}
                analysisData={analysisData}
                isLoading={isLoading}
                isMobile={isMobile}
                onBackToChat={() => setActiveView('chat')}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-2 bg-white border-t border-gray-200 lg:hidden">
          <div className="flex justify-around">
            <button
              onClick={toggleUploadSidebar}
              className={`flex flex-col items-center p-2 transition-colors ${
                showUploadSidebar ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="mt-1 text-xs">Upload</span>
            </button>
            
            <button
              onClick={() => setActiveView('chat')}
              className={`flex flex-col items-center p-2 transition-colors ${
                activeView === 'chat' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="mt-1 text-xs">Chat</span>
            </button>
            
            <button
              onClick={() => setActiveView('analysis')}
              className={`flex flex-col items-center p-2 transition-colors ${
                activeView === 'analysis' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="mt-1 text-xs">Analysis</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App