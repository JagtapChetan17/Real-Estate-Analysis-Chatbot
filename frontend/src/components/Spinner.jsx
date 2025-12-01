import React from 'react'

const Spinner = ({ size = 'md', color = 'text-blue-500' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses[size]} ${color}`}></div>
  )
}

export default Spinner