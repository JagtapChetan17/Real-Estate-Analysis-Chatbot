import axios from 'axios'

// Use Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Download helper
const downloadFile = (data, filename, contentType) => {
  const blob = new Blob([data], { type: contentType })
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const uploadFile = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })

    return response.data
  } catch (error) {
    let msg = error.response?.data?.error || error.message || 'Upload failed'
    throw new Error(msg)
  }
}

export const getAreas = async () => {
  try {
    const response = await api.get('/areas/')
    return response.data
  } catch {
    return { areas: [], data_source: 'error' }
  }
}

export const getAnalysis = async (area) => {
  try {
    const response = await api.get('/analyze/', { params: { area } })
    return response.data
  } catch (error) {
    let msg = error.response?.data?.error || 'Analysis failed'
    throw new Error(msg)
  }
}

export const getChartData = async (area, type = 'price') => {
  try {
    const response = await api.get('/chart/', { params: { area, type } })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Chart fetch failed')
  }
}

export const getTableData = async (area, limit = 50, offset = 0) => {
  try {
    const response = await api.get('/table/', { params: { area, limit, offset } })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Table fetch failed')
  }
}

export const exportData = async (area, format = 'csv') => {
  try {
    const config = {
      params: { area: area.trim(), format: format.toLowerCase() },
      responseType: ['csv', 'excel'].includes(format) ? 'blob' : 'json',
    }

    const response = await api.get('/export/', config)

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const filename = `${area.replace(/\s+/g, '_')}_data_${timestamp}.${format === 'excel' ? 'xlsx' : format}`

    if (format === 'csv') {
      downloadFile(response.data, filename, 'text/csv; charset=utf-8')
    } else if (format === 'excel') {
      downloadFile(response.data, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    } else if (format === 'json') {
      downloadFile(JSON.stringify(response.data, null, 2), filename, 'application/json')
    }

    return { success: true, filename }
  } catch (error) {
    let msg = error.response?.data?.error || 'Export failed'
    throw new Error(msg)
  }
}

export const compareAreas = async (area1, area2) => {
  try {
    const response = await api.get('/compare/', { params: { area1, area2 } })
    return response.data
  } catch (error) {
    let msg = error.response?.data?.error || 'Comparison failed'
    throw new Error(msg)
  }
}

export const testConnection = async () => {
  try {
    const response = await api.get('/health/')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'API not reachable')
  }
}

export default api
