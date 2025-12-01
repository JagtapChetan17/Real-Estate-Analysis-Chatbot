import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const Chart = ({ data, type, area }) => {
  const isMobile = window.innerWidth < 768

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          font: {
            size: isMobile ? 10 : 12,
          },
          padding: isMobile ? 10 : 20,
        },
      },
      title: {
        display: true,
        text: type === 'price' 
          ? `Price Trends for ${area} (₹/sqft)`
          : type === 'demand'
          ? `Demand Trends for ${area}`
          : `Property Composition for ${area}`,
        font: {
          size: isMobile ? 14 : 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              if (type === 'price') {
                label += `₹${context.parsed.y.toLocaleString()}`
              } else if (type === 'demand') {
                if (context.parsed.y >= 10000000) {
                  label += `₹${(context.parsed.y / 10000000).toFixed(1)}Cr`
                } else if (context.parsed.y >= 100000) {
                  label += `₹${(context.parsed.y / 100000).toFixed(1)}L`
                } else {
                  label += context.parsed.y.toLocaleString()
                }
              } else {
                label += context.parsed.toLocaleString()
              }
            }
            return label
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: isMobile ? 12 : 14,
        },
        bodyFont: {
          size: isMobile ? 11 : 13,
        },
        padding: 12,
      },
    },
    scales: type !== 'composition' ? {
      y: {
        beginAtZero: type === 'demand',
        ticks: {
          callback: function(value) {
            if (type === 'price') {
              return '₹' + value.toLocaleString()
            } else if (type === 'demand') {
              if (value >= 10000000) {
                return `₹${(value / 10000000).toFixed(1)}Cr`
              } else if (value >= 100000) {
                return `₹${(value / 100000).toFixed(1)}L`
              } else {
                return value.toLocaleString()
              }
            }
            return value.toLocaleString()
          },
          font: {
            size: isMobile ? 10 : 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    } : {},
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  }

  const ChartComponent = type === 'price' ? Line : type === 'demand' ? Bar : Pie

  return (
    <div className="h-64 md:h-80 lg:h-96">
      {data.datasets && data.datasets.length > 0 ? (
        <>
          <ChartComponent data={data} options={options} />
          <div className="mt-3 md:mt-4 text-center">
            <span className="inline-flex items-center px-3 py-1 md:px-4 md:py-2 rounded-full bg-green-100 text-green-800 text-xs md:text-sm font-medium shadow-sm">
              <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Real Data from Uploaded Excel File
            </span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <svg className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-base md:text-lg font-medium mb-2 text-gray-600">No Chart Data Available</p>
          <p className="text-xs md:text-sm text-center text-gray-500 max-w-md">
            {type === 'price' 
              ? 'No price data found in the uploaded Excel file for this area.'
              : type === 'demand'
              ? 'No demand/sales data found in the uploaded Excel file for this area.'
              : 'No composition data available for this area.'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default Chart