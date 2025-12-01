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
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleUploadSidebar}
              className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
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

      {/* Desktop Header */}
      {!isMobile && (
        <header className="hidden lg:block text-center py-4 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-blue-600">
              EstateInsight AI
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            Smart Real Estate Analysis Powered by AI
          </p>
        </header>
      )}

      <div className="flex h-full" style={{ 
        height: isMobile ? 'calc(100vh - 64px)' : 'calc(100vh - 80px)'
      }}>
        {/* Upload Sidebar */}
        {(showUploadSidebar || !isMobile) && (
          <div className={`
            ${isMobile ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : 'w-1/3 min-w-80 flex-shrink-0'}
            flex flex-col border-r border-gray-200 bg-white h-full
          `}>
            {/* Mobile Sidebar Header */}
            {isMobile && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <h2 className="text-lg font-semibold text-gray-800">Upload Data</h2>
                <button
                  onClick={toggleUploadSidebar}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <UploadPanel onFileUpload={handleFileUpload} />
                
                {/* Areas List */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-800">
                      Available Areas
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                        {areas.length}
                      </span>
                      {areas.length > 0 && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Real Data
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {areas.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">No areas available</p>
                      <p className="text-xs mt-1 text-gray-400">Upload an Excel file to get started</p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto">
                      <div className="space-y-2">
                        {areas.map((area, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnalyze(area)}
                            className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-100 text-sm text-gray-700 flex items-center justify-between hover:border-blue-200"
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <span className="truncate font-medium">{area}</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* View Tabs - Desktop */}
          {!isMobile && (
            <div className="flex border-b border-gray-200 bg-white">
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-40">
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
              <span className="text-xs mt-1">Upload</span>
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
              <span className="text-xs mt-1">Chat</span>
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
              <span className="text-xs mt-1">Analysis</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App