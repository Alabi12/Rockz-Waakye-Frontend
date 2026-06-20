import React, { useState, useEffect } from 'react'
import { waakyeApi } from '../api/waakyeApi'
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
  Coffee
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
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Area
} from 'recharts'

const GrowthPage = () => {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await waakyeApi.getGrowthMetrics()
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
      revenue_per_unit: m.revenue_per_unit || 0,
      inventory_health: m.inventory_health || 0,
      potential: ((m.revenue_per_unit || 0) * (m.inventory_health || 0)) / 100
    }))
    .sort((a, b) => b.potential - a.potential)

  // Branch performance ratings
  const performanceData = metrics.map(m => ({
    branch: m.branch,
    revenue: Math.round(m.revenue || 0),
    sales: Math.round(m.sales_units || 0),
    efficiency: Math.round(((m.revenue_per_unit || 0) / 50) * 100),
    health: Math.round(Math.min((m.inventory_health || 0) * 5, 100))
  }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2d3748' }}>🚀 Growth & Scalability</h2>
          <p style={{ color: '#718096' }}>Insights and opportunities for business expansion</p>
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
        <h3 className="card-title">Branch Performance Matrix</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#48bb78" name="Revenue (GHS)" />
              <Bar dataKey="sales" fill="#4299e1" name="Sales Units" />
              <Bar dataKey="efficiency" fill="#ed8936" name="Efficiency %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Opportunities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <h3 className="card-title">Growth Opportunities</h3>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {opportunities.map((op, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #edf2f7',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#2d3748' }}>{op.branch}</div>
                  <div style={{ fontSize: 13, color: '#718096' }}>
                    Revenue/Unit: GHS {op.revenue_per_unit?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: 20, 
                    fontWeight: 700,
                    color: op.potential > 50 ? '#48bb78' : '#ed8936'
                  }}>
                    {op.potential.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 11, color: '#a0aec0' }}>Growth Potential</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">📈 Scalability Insights</h3>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #edf2f7' }}>
              <Rocket size={24} color="#48bb78" />
              <div>
                <div style={{ fontWeight: 600 }}>Top Performer</div>
                <div style={{ fontSize: 14, color: '#4a5568' }}>
                  {metrics.length > 0 ? metrics.reduce((a, b) => (a.revenue || 0) > (b.revenue || 0) ? a : b)?.branch : 'N/A'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #edf2f7' }}>
              <Zap size={24} color="#ed8936" />
              <div>
                <div style={{ fontWeight: 600 }}>Growth Opportunity</div>
                <div style={{ fontSize: 14, color: '#4a5568' }}>
                  {opportunities.length > 0 ? opportunities[0]?.branch : 'N/A'}
                  <span style={{ color: '#48bb78', marginLeft: 8 }}>
                    (+{opportunities[0]?.potential?.toFixed(1)}% potential)
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #edf2f7' }}>
              <Store size={24} color="#4299e1" />
              <div>
                <div style={{ fontWeight: 600 }}>Best Inventory Health</div>
                <div style={{ fontSize: 14, color: '#4a5568' }}>
                  {metrics.length > 0 ? metrics.reduce((a, b) => (a.inventory_health || 0) > (b.inventory_health || 0) ? a : b)?.branch : 'N/A'}
                  <span style={{ color: '#48bb78', marginLeft: 8 }}>
                    ({metrics.reduce((a, b) => Math.max(a, b.inventory_health || 0), 0).toFixed(1)})
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
              <Coffee size={24} color="#9f7aea" />
              <div>
                <div style={{ fontWeight: 600 }}>Revenue Efficiency</div>
                <div style={{ fontSize: 14, color: '#4a5568' }}>
                  Best Revenue/Unit: GHS {Math.max(...metrics.map(m => m.revenue_per_unit || 0)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expansion Recommendations */}
      <div className="card">
        <h3 className="card-title">📋 Expansion Recommendations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ padding: 16, background: '#f0fff4', borderRadius: 8, border: '1px solid #c6f6d5' }}>
            <div style={{ fontWeight: 700, color: '#276749' }}>📍 Priority 1</div>
            <div style={{ marginTop: 8, fontSize: 14, color: '#2d3748' }}>
              <strong>{opportunities.length > 0 ? opportunities[0]?.branch : 'N/A'}</strong>
              <p style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>
                Highest growth potential. Consider expanding operations or opening a new location nearby.
              </p>
            </div>
          </div>
          <div style={{ padding: 16, background: '#ebf8ff', borderRadius: 8, border: '1px solid #bee3f8' }}>
            <div style={{ fontWeight: 700, color: '#2b6cb0' }}>📍 Priority 2</div>
            <div style={{ marginTop: 8, fontSize: 14, color: '#2d3748' }}>
              <strong>{opportunities.length > 1 ? opportunities[1]?.branch : 'N/A'}</strong>
              <p style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>
                Strong performance with room for growth. Optimize inventory and marketing.
              </p>
            </div>
          </div>
          <div style={{ padding: 16, background: '#fffaf0', borderRadius: 8, border: '1px solid #fbd38d' }}>
            <div style={{ fontWeight: 700, color: '#9c4221' }}>📍 Priority 3</div>
            <div style={{ marginTop: 8, fontSize: 14, color: '#2d3748' }}>
              <strong>{opportunities.length > 2 ? opportunities[2]?.branch : 'N/A'}</strong>
              <p style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>
                Consider operational improvements and targeted marketing to boost performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GrowthPage