import React, { useState, useEffect } from 'react'
import waakyeApi from '../api/waakyeApi'  // ← Changed from { waakyeApi }
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingBag,
  Award,
  Target,
  RefreshCw,
  Rocket,
  Store,
  BarChart3,
  Zap,
  Coffee,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts'

const GrowthPage = () => {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedBranches, setExpandedBranches] = useState([])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await waakyeApi.getGrowthMetrics()
      console.log('Growth Metrics Response:', response.data)
      setMetrics(response.data || [])
    } catch (err) {
      setError('Failed to load growth metrics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleBranch = (branchId) => {
    setExpandedBranches(prev =>
      prev.includes(branchId)
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    )
  }

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Loading growth metrics...</div>
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <p style={{ color: '#fc8181' }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchData} style={{ marginTop: 16 }}>
          Retry
        </button>
      </div>
    )
  }

  const totalRevenue = metrics.reduce((sum, m) => sum + (m.revenue || 0), 0)
  const totalSales = metrics.reduce((sum, m) => sum + (m.sales_units || 0), 0)
  const avgRevenuePerBranch = totalRevenue / (metrics.length || 1)

  // Calculate growth opportunities
  const opportunities = metrics
    .map(m => ({
      branch: m.branch,
      branch_id: m.branch_id,
      revenue_per_unit: m.revenue_per_unit || 0,
      inventory_health: m.inventory_health || 0,
      potential: ((m.revenue_per_unit || 0) * (m.inventory_health || 0)) / 100
    }))
    .sort((a, b) => b.potential - a.potential)

  // Branch performance ratings
  const performanceData = metrics.map(m => ({
    branch: m.branch,
    branch_id: m.branch_id,
    revenue: Math.round(m.revenue || 0),
    sales: Math.round(m.sales_units || 0),
    inventory: Math.round(m.inventory_units || 0),
    kitchen: Math.round(m.kitchen_units || 0),
    efficiency: Math.round(((m.revenue_per_unit || 0) / 50) * 100),
    health: Math.round(Math.min((m.inventory_health || 0) * 5, 100))
  }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2d3748' }}>🚀 Growth & Scalability</h2>
          <p style={{ color: '#718096' }}>
            {metrics.length} branches • Total Revenue: GHS {totalRevenue.toFixed(2)}
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchData}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Growth Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ color: '#48bb78' }}>
            GHS {totalRevenue.toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Sales</div>
          <div className="stat-value" style={{ color: '#4299e1' }}>
            {Math.round(totalSales)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Revenue/Branch</div>
          <div className="stat-value" style={{ color: '#9f7aea' }}>
            GHS {avgRevenuePerBranch.toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Branches</div>
          <div className="stat-value" style={{ color: '#ed8936' }}>
            {metrics.length}
          </div>
        </div>
      </div>

      {/* Branch Performance Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="card-title">All Branches Performance</h3>
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#48bb78" name="Revenue (GHS)" />
              <Bar yAxisId="left" dataKey="sales" fill="#4299e1" name="Sales Units" />
              <Area yAxisId="right" type="monotone" dataKey="health" fill="#ed8936" stroke="#ed8936" name="Health %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Branch Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        {metrics.map((branch, index) => (
          <div key={index} className="card" style={{ cursor: 'pointer' }} onClick={() => toggleBranch(branch.branch_id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2d3748' }}>{branch.branch}</h4>
                <div style={{ fontSize: 13, color: '#718096' }}>
                  Revenue: GHS {branch.revenue?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div style={{ 
                padding: '4px 12px', 
                borderRadius: 20, 
                fontSize: 12, 
                fontWeight: 600,
                background: (branch.inventory_health || 0) > 10 ? '#f0fff4' : '#fff5f5',
                color: (branch.inventory_health || 0) > 10 ? '#276749' : '#c53030'
              }}>
                {(branch.inventory_health || 0).toFixed(1)}
              </div>
            </div>
            
            {expandedBranches.includes(branch.branch_id) && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #edf2f7' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div><span style={{ color: '#718096' }}>Sales Units:</span> {Math.round(branch.sales_units || 0)}</div>
                  <div><span style={{ color: '#718096' }}>Inventory:</span> {Math.round(branch.inventory_units || 0)}</div>
                  <div><span style={{ color: '#718096' }}>Kitchen Stock:</span> {Math.round(branch.kitchen_units || 0)}</div>
                  <div><span style={{ color: '#718096' }}>Revenue/Unit:</span> GHS {branch.revenue_per_unit?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            )}
            <div style={{ marginTop: 8, fontSize: 12, color: '#a0aec0' }}>
              {expandedBranches.includes(branch.branch_id) ? 'Tap to collapse' : 'Tap to expand'}
            </div>
          </div>
        ))}
      </div>

      {/* Growth Opportunities */}
      <div className="card">
        <h3 className="card-title">📈 Growth Opportunities by Branch</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {opportunities.map((op, index) => (
            <div key={index} style={{ 
              padding: 16, 
              background: index === 0 ? '#f0fff4' : index === 1 ? '#ebf8ff' : '#f7fafc',
              borderRadius: 8,
              border: index === 0 ? '2px solid #48bb78' : '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#2d3748' }}>{op.branch}</span>
                {index === 0 && <Rocket size={16} color="#48bb78" />}
                {index === 1 && <Target size={16} color="#4299e1" />}
              </div>
              <div style={{ marginTop: 8, fontSize: 14, color: '#4a5568' }}>
                Revenue/Unit: GHS {op.revenue_per_unit?.toFixed(2) || '0.00'}
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: '#718096' }}>
                Inventory Health: {op.inventory_health?.toFixed(1) || '0.0'}
              </div>
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: op.potential > 50 ? '#48bb78' : '#ed8936' }}>
                Potential: {op.potential.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GrowthPage