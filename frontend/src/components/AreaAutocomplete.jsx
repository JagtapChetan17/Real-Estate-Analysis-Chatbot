import React, { useState, useRef, useEffect } from 'react'

const AreaAutocomplete = ({
  areas,
  value,
  onChange,
  onAreaSelect,
  placeholder = "Enter area name...",
  isMobile = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredAreas, setFilteredAreas] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (value.trim()) {
      const filtered = areas.filter(area =>
        area.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setFilteredAreas(filtered)
    } else {
      setFilteredAreas([])
    }
  }, [value, areas])

  const handleInputChange = (e) => {
    onChange(e.target.value)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (area) => {
    onChange(area)
    setShowSuggestions(false)
    onAreaSelect(area)
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    if (value.trim()) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <div className="relative w-full">
      <div className="w-full border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-0 rounded-lg"
        />
      </div>
      
      {showSuggestions && filteredAreas.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
          {filteredAreas.map((area, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(area)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium text-gray-800">{area}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AreaAutocomplete