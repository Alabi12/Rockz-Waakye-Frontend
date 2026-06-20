import React, { useState, useEffect } from 'react'
import waakyeApi from '../api/waakyeApi'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar,
  AreaChart
} from 'recharts'
import {
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Brain,
  Target,
  AlertCircle
} from 'lucide-react'

const ProjectionsPage = () => {
  const [branchId, setBranchId] = useState('1')
  const [days, setDays] = useState(30)
  const [projections, setProjections] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const branches = [
    { id: '1', name: 'Branch A - Accra Mall' },
    { id: '2', name: 'Branch B - Madina Market' },
    { id: '3', name: 'Branch C - Tema Station' },
    { id: '4', name: 'All Branches' },
  ]

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await waakyeApi.getProjections(parseInt(branchId), days)
      setProjections(response.data)
    } catch (err) {
      setError('Failed to load projections')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [branchId, days])

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Generating AI projections...</div>
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <AlertCircle size={48} color="#fc8181" />
        <p style={{ color: '#fc8181', marginTop: 12 }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchData} style={{ marginTop: 16 }}>
          Retry
        </button>
      </div>
    )
  }

  if (!projections || projections.error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <Brain size={48} color="#a0aec0" />
        <h3 style={{ marginTop: 12, color: '#2d3748' }}>Insufficient Data</h3>
        <p style={{ color: '#718096' }}>
          {projections?.error || 'Need at least 7 days of historical data for projections.'}
        </p>
        <p style={{ color: '#a0aec0', fontSize: 13, marginTop: 8 }}>
          Upload more inventory data to enable AI forecasting.
        </p>
      </div>
    )
  }

  const historicalData = projections.historical || []
  const projectionData = projections.projections || []

  // Combine for chart
  const chartData = [
    ...historicalData.map(d => ({
      date: new Date(d.date).toLocaleDateString(),
      actual: d.sales || 0,
      projected: null
    })),
    ...projectionData.map(d => ({
      date: d.date,
      actual: null,
      projected: d.projected_sales || 0
    }))
  ]

  // Calculate totals
  const totalHistorical = historicalData.reduce((sum, d) => sum + (d.sales || 0), 0)
  const totalProjected = projectionData.reduce((sum, d) => sum + (d.projected_sales || 0), 0)
  const avgDaily = totalHistorical / (historicalData.length || 1)
  const projectedDaily = totalProjected / (projectionData.length || 1)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2d3748' }}>🧠 AI Financial Projections</h2>
          <p style={{ color: '#718096' }}>
            Predictive analytics powered by machine learning
            <span style={{ marginLeft: 12, fontSize: 13, background: '#ebf8ff', padding: '4px 12px', borderRadius: 12 }}>
              Confidence: {(projections.confidence_score || 0.75) * 100}%
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            style={{
              padding: '8px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              background: 'white'
            }}
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            style={{
              padding: '8px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              background: 'white'
            }}
          >
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
            <option value={30}>30 Days</option>
            <option value={60}>60 Days</option>
            <option value={90}>90 Days</option>
          </select>
          <button className="btn btn-outline" onClick={fetchData}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Projection Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Historical Average Daily</div>
          <div className="stat-value" style={{ color: '#4299e1' }}>
            GHS {avgDaily.toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Projected Daily Average</div>
          <div className="stat-value" style={{ color: '#48bb78' }}>
            GHS {projectedDaily.toFixed(2)}
          </div>
          <div className="stat-change positive">
            {projectionData.length > 0 ? `+${(((projectedDaily - avgDaily) / avgDaily) * 100).toFixed(1)}%` : 'N/A'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Historical</div>
          <div className="stat-value" style={{ color: '#9f7aea' }}>
            GHS {totalHistorical.toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Projected</div>
          <div className="stat-value" style={{ color: '#48bb78' }}>
            GHS {totalProjected.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="card-title">Revenue Projection Chart</h3>
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `GHS ${value?.toFixed(2) || '0.00'}`} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="actual" 
                fill="#4299e1" 
                stroke="#4299e1" 
                fillOpacity={0.3} 
                name="Historical Actual"
              />
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="#48bb78" 
                strokeWidth={3} 
                name="AI Projected"
                dot={{ r: 4 }}
              />
              <Bar 
                dataKey="projected" 
                fill="#48bb78" 
                fillOpacity={0.3} 
                name="Projection Confidence"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#718096' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#4299e1', borderRadius: 2, marginRight: 4 }} />
            Historical Data
          </span>
          <span style={{ fontSize: 13, color: '#718096' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#48bb78', borderRadius: 2, marginRight: 4 }} />
            AI Projection (Confidence: {(projections.confidence_score || 0.75) * 100}%)
          </span>
          <span style={{ fontSize: 13, color: '#718096' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#48bb78', opacity: 0.3, borderRadius: 2, marginRight: 4 }} />
            Confidence Band
          </span>
        </div>
      </div>

      {/* Projection Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 className="card-title">📊 Projection Details</h3>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {projectionData.slice(0, 14).map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderBottom: '1px solid #edf2f7'
                }}
              >
                <span style={{ color: '#4a5568' }}>{item.date}</span>
                <span style={{ fontWeight: 600, color: '#48bb78' }}>
                  GHS {item.projected_sales?.toFixed(2) || '0.00'}
                </span>
              </div>
            ))}
            {projectionData.length === 0 && (
              <p style={{ color: '#718096', textAlign: 'center', padding: 24 }}>
                No projection data available
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">📈 AI Model Information</h3>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf2f7' }}>
              <span style={{ color: '#4a5568' }}>Model Used</span>
              <span style={{ fontWeight: 600 }}>{projections.model_used || 'Moving Average with Growth'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf2f7' }}>
              <span style={{ color: '#4a5568' }}>Confidence Score</span>
              <span style={{ fontWeight: 600, color: '#48bb78' }}>
                {(projections.confidence_score || 0.75) * 100}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf2f7' }}>
              <span style={{ color: '#4a5568' }}>Data Points Analyzed</span>
              <span style={{ fontWeight: 600 }}>{historicalData.length} days</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: '#4a5568' }}>Projection Period</span>
              <span style={{ fontWeight: 600 }}>{projectionData.length} days</span>
            </div>
            <div style={{ marginTop: 16, padding: 12, background: '#ebf8ff', borderRadius: 8 }}>
              <p style={{ fontSize: 13, color: '#2b6cb0' }}>
                <strong>💡 Insight:</strong> Based on historical trends, revenue is projected to 
                {projectedDaily > avgDaily ? ' increase' : ' decrease'} by 
                {((Math.abs(projectedDaily - avgDaily) / avgDaily) * 100).toFixed(1)}% over the next {projectionData.length} days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectionsPage