import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Helper function to handle file downloads
const downloadFile = (data, filename, contentType) => {
  // Create blob from data
  const blob = new Blob([data], { type: contentType })
  
  // Create download link
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const uploadFile = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    })
    
    console.log('✅ Upload successful:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Upload error:', error)
    
    let errorMessage = 'Upload failed. Please try again.'
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    } else if (error.message) {
      errorMessage = error.message
    }
    
    throw new Error(errorMessage)
  }
}

export const getAreas = async () => {
  try {
    const response = await api.get('/areas/')
    console.log('✅ Areas loaded:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching areas:', error)
    return { areas: [], data_source: 'error' }
  }
}

export const getAnalysis = async (area) => {
  try {
    const response = await api.get('/analyze/', {
      params: { area }
    })
    console.log('✅ Analysis loaded:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching analysis:', error)
    
    let errorMessage = 'Analysis failed. Please try again.'
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    }
    
    throw new Error(errorMessage)
  }
}

export const getChartData = async (area, type = 'price') => {
  try {
    const response = await api.get('/chart/', {
      params: { area, type }
    })
    console.log('✅ Chart data loaded:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching chart data:', error)
    throw error
  }
}

export const getTableData = async (area, limit = 50, offset = 0) => {
  try {
    const response = await api.get('/table/', {
      params: { area, limit, offset }
    })
    console.log('✅ Table data loaded:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching table data:', error)
    throw error
  }
}

export const exportData = async (area, format = 'csv') => {
  try {
    console.log(`📤 Exporting data for ${area} in ${format} format...`)
    
    // Configure response type based on format
    const config = {
      params: { 
        area: area.trim(),
        format: format.toLowerCase()
      },
      responseType: format === 'excel' || format === 'csv' ? 'blob' : 'json'
    }
    
    const response = await api.get('/export/', config)
    
    if (format === 'csv') {
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const filename = `${area.replace(/\s+/g, '_')}_data_${timestamp}.csv`
      
      // Download CSV file
      downloadFile(response.data, filename, 'text/csv; charset=utf-8')
      
      return { 
        success: true, 
        message: 'Data exported successfully as CSV!',
        filename: filename
      }
    } 
    else if (format === 'excel') {
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const filename = `${area.replace(/\s+/g, '_')}_data_${timestamp}.xlsx`
      
      // Download Excel file
      downloadFile(
        response.data, 
        filename, 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      
      return { 
        success: true, 
        message: 'Data exported successfully as Excel!',
        filename: filename
      }
    }
    else if (format === 'json') {
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const filename = `${area.replace(/\s+/g, '_')}_data_${timestamp}.json`
      
      // Convert JSON data to string and download
      const jsonStr = JSON.stringify(response.data, null, 2)
      downloadFile(jsonStr, filename, 'application/json')
      
      return { 
        success: true, 
        message: 'Data exported successfully as JSON!',
        filename: filename
      }
    }
    
  } catch (error) {
    console.error('❌ Export error:', error)
    
    let errorMessage = 'Export failed. Please try again.'
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = `No data found for area "${area}". Please check the area name.`
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error
      }
    } else if (error.message) {
      errorMessage = error.message
    }
    
    throw new Error(errorMessage)
  }
}

export const compareAreas = async (area1, area2) => {
  try {
    const response = await api.get('/compare/', {
      params: { area1, area2 }
    })
    console.log('✅ Comparison loaded:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error comparing areas:', error)
    
    let errorMessage = 'Comparison failed. Please try again.'
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    }
    
    throw new Error(errorMessage)
  }
}

// Test API connection
export const testConnection = async () => {
  try {
    const response = await api.get('/health/')
    return response.data
  } catch (error) {
    console.error('❌ API connection error:', error)
    throw error
  }
}

export default api