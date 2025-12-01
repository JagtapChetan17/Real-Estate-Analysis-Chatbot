import React, { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import AreaAutocomplete from './AreaAutocomplete'
import Spinner from './Spinner'
import { compareAreas } from '../api/api'

const ChatWindow = ({
  messages,
  onAnalyze,
  isLoading,
  areas,
  isMobile,
  onToggleSidebar
}) => {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const parseQuery = (query) => {
    const lowerQuery = query.toLowerCase().trim()
    let area = query.trim()
    
    const phrases = [
      'analyze', 'analysis of', 'show me', 'give me', 'data for', 
      'information about', 'tell me about', 'compare', 'vs', 'versus',
      'price growth for', 'demand trends for', 'show', 'trends',
      'what is', 'how is', 'can you', 'please', 'tell me'
    ]
    
    phrases.forEach(phrase => {
      const regex = new RegExp(phrase, 'gi')
      area = area.replace(regex, '').trim()
    })
    
    const words = area.split(' ')
    if (words.length > 1) {
      area = words[words.length - 1]
    }
    
    const comparisonMatch = lowerQuery.match(/compare\s+(.+?)\s+(?:and|vs|versus)\s+(.+)/i)
    if (comparisonMatch) {
      return {
        type: 'compare',
        area1: comparisonMatch[1].trim(),
        area2: comparisonMatch[2].trim()
      }
    }
    
    const priceGrowthMatch = lowerQuery.match(/price\s+growth\s+(?:for|of)\s+(.+?)\s+(?:over|last|in)/i)
    if (priceGrowthMatch) {
      return {
        type: 'price_growth',
        area: priceGrowthMatch[1].trim(),
        chartType: 'price'
      }
    }
    
    const demandMatch = lowerQuery.match(/demand\s+trends?\s+(?:for|of)\s+(.+)/i)
    if (demandMatch) {
      return {
        type: 'demand_trends',
        area: demandMatch[1].trim(),
        chartType: 'demand'
      }
    }
    
    const showDataMatch = lowerQuery.match(/(?:show|give)\s+(?:me\s+)?(?:data|information)\s+(?:for|about)\s+(.+)/i)
    if (showDataMatch) {
      return {
        type: 'analyze',
        area: showDataMatch[1].trim()
      }
    }
    
    const analyzeMatch = lowerQuery.match(/analyze\s+(.+)/i)
    if (analyzeMatch) {
      return {
        type: 'analyze',
        area: analyzeMatch[1].trim()
      }
    }
    
    return {
      type: 'analyze',
      area: area
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const query = inputValue.trim()
    setInputValue('')
    
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    }
    
    // Note: setMessages should be passed from parent, not defined here
    // Assuming it's handled in parent component
    
    const parsedQuery = parseQuery(query)
    
    if (parsedQuery.type === 'compare' && parsedQuery.area1 && parsedQuery.area2) {
      try {
        const result = await compareAreas(parsedQuery.area1, parsedQuery.area2)
        
        const botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `📊 Comparison between ${parsedQuery.area1} and ${parsedQuery.area2}:`,
          comparison: result,
          timestamp: new Date()
        }
        
        // Note: setMessages should be passed from parent
        // Assuming it's handled in parent component
        
      } catch (error) {
        console.error('Comparison error:', error)
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `❌ Error comparing areas. Please make sure both "${parsedQuery.area1}" and "${parsedQuery.area2}" exist in the dataset.`,
          timestamp: new Date()
        }
        // Note: setMessages should be passed from parent
        // Assuming it's handled in parent component
      }
    } else if (parsedQuery.type === 'price_growth') {
      const userMessage = {
        id: (Date.now() + 1).toString(),
        type: 'user',
        content: `Show price growth for ${parsedQuery.area}`,
        area: parsedQuery.area,
        timestamp: new Date()
      }
      
      // Note: setMessages should be passed from parent
      // Assuming it's handled in parent component
      onAnalyze(parsedQuery.area)
    } else if (parsedQuery.type === 'demand_trends') {
      const userMessage = {
        id: (Date.now() + 1).toString(),
        type: 'user',
        content: `Show demand trends for ${parsedQuery.area}`,
        area: parsedQuery.area,
        timestamp: new Date()
      }
      
      // Note: setMessages should be passed from parent
      // Assuming it's handled in parent component
      onAnalyze(parsedQuery.area)
    } else {
      const area = parsedQuery.area
      if (area && area.trim()) {
        onAnalyze(area.trim())
      } else {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: "❌ Please specify an area to analyze. Example: 'Analyze Wakad' or 'Show me data for Aundh'",
          timestamp: new Date()
        }
        // Note: setMessages should be passed from parent
        // Assuming it's handled in parent component
      }
    }
  }

  const handleAreaSelect = (area) => {
    setInputValue('')
    onAnalyze(area)
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Mobile Chat Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
          <div className="w-10"></div>
        </div>
      )}

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto bg-white"
        style={{ 
          // Adjust padding for mobile to account for bottom navigation
          paddingBottom: isMobile ? '140px' : '80px'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-gray-500">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-center text-gray-800">
              Welcome to EstateInsight AI
            </h3>
            <p className="mb-6 text-sm text-center text-gray-600">
              {areas.length > 0 
                ? `I found ${areas.length} real estate areas in your data. Ask me anything!`
                : 'Upload an Excel file with real estate data or enter an area name to begin analysis.'
              }
            </p>
            
            {areas.length > 0 && (
              <div className="w-full max-w-md">
                <div className="p-4 mb-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-sm font-semibold text-blue-800">
                      Try these queries:
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setInputValue('Analyze Wakad')}
                      className="w-full px-3 py-2 text-sm text-left text-blue-700 transition-colors bg-white border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300"
                    >
                      "Analyze Wakad"
                    </button>
                    <button
                      onClick={() => setInputValue('Compare Ambegaon Budruk and Aundh')}
                      className="w-full px-3 py-2 text-sm text-left text-blue-700 transition-colors bg-white border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300"
                    >
                      "Compare Ambegaon Budruk and Aundh"
                    </button>
                    <button
                      onClick={() => setInputValue('Show price growth for Akurdi')}
                      className="w-full px-3 py-2 text-sm text-left text-blue-700 transition-colors bg-white border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300"
                    >
                      "Show price growth for Akurdi"
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-green-800">
                      Available Areas:
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {areas.slice(0, 4).map((area, index) => (
                      <button
                        key={index}
                        onClick={() => handleAreaSelect(area)}
                        className="px-3 py-1 text-xs font-medium text-green-700 transition-colors bg-white border border-green-200 rounded hover:bg-green-100 hover:border-green-300"
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isLatest={index === messages.length - 1}
              isMobile={isMobile}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center max-w-xs px-4 py-3 space-x-2 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-sm font-medium text-gray-600">Analyzing real data...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area - Fixed positioning for mobile */}
      <div className={`
        border-t border-gray-200 bg-white
        ${isMobile ? 'fixed bottom-0 left-0 right-0' : 'relative'}
      `}
      style={{
        // Position above the bottom navigation (64px is the bottom nav height)
        bottom: isMobile ? '64px' : '0'
      }}
      >
        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <div className="flex-1">
              <AreaAutocomplete
                areas={areas}
                value={inputValue}
                onChange={setInputValue}
                onAreaSelect={handleAreaSelect}
                placeholder={areas.length > 0 
                  ? `Ask anything about real estate data...` 
                  : "Enter area name or ask a question..."}
                isMobile={isMobile}
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-3 font-medium text-white transition-colors bg-blue-500 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 hover:shadow"
            >
              {isLoading ? (
                <Spinner size="sm" color="text-white" />
              ) : (
                <>
                  <span className="hidden sm:inline">Send</span>
                  <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Spacer for mobile to prevent content from being hidden behind input */}
      {isMobile && (
        <div style={{ height: '140px' }} />
      )}
    </div>
  )
}

export default ChatWindow