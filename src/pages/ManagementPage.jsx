import React, { useState, useEffect } from 'react'
import waakyeApi from '../api/waakyeApi'
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Users,
  ShoppingBag,
  Clock,
  Award,
  RefreshCw,
  BarChart3,
  Activity,
  DollarSign
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Bar,
  Area
} from 'recharts'

const ManagementPage = () => {
  const [branchId, setBranchId] = useState('1')
  const [kpis, setKpis] = useState(null)
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

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
      // Fetch KPIs for the selected branch
      const kpiResponse = await waakyeApi.getKPIs(parseInt(branchId))
      console.log('KPI Response:', kpiResponse.data)
      setKpis(kpiResponse.data)
      
      // Fetch growth metrics for branch comparison
      const growthResponse = await waakyeApi.getGrowthMetrics()
      console.log('Growth Metrics Response:', growthResponse.data)
      setMetrics(growthResponse.data || [])
      
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to load management data: ' + (err.response?.data?.detail || err.message))
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [branchId])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [branchId])

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#718096' }}>Loading management data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <p style={{ color: '#fc8181' }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchData} style={{ marginTop: 16 }}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    )
  }

  // Calculate KPI values with proper fallbacks
  const totalSales = kpis?.total_sales || 0
  const totalOrders = kpis?.total_orders || 0
  const avgTransaction = kpis?.average_transaction || 0
  const salesGrowth = kpis?.sales_growth || 0
  const inventoryTurnover = kpis?.inventory_turnover || 0
  const customerSatisfaction = kpis?.customer_satisfaction || 0

  // KPI Data for display
  const kpiData = [
    { 
      name: 'Total Sales', 
      value: totalSales, 
      icon: DollarSign, 
      color: '#48bb78',
      format: 'currency'
    },
    { 
      name: 'Total Orders', 
      value: totalOrders, 
      icon: ShoppingBag, 
      color: '#4299e1',
      format: 'number'
    },
    { 
      name: 'Avg Transaction', 
      value: avgTransaction, 
      icon: Award, 
      color: '#9f7aea',
      format: 'currency'
    },
    { 
      name: 'Sales Growth', 
      value: salesGrowth, 
      icon: TrendingUp, 
      color: salesGrowth >= 0 ? '#48bb78' : '#fc8181',
      format: 'percentage'
    },
  ]

  // Radar data for performance visualization
  const radarData = [
    { subject: 'Revenue', A: totalSales / 1000 || 0, fullMark: 100 },
    { subject: 'Orders', A: totalOrders || 0, fullMark: 500 },
    { subject: 'Avg Sale', A: avgTransaction || 0, fullMark: 200 },
    { subject: 'Growth', A: salesGrowth || 0, fullMark: 100 },
    { subject: 'Turnover', A: inventoryTurnover || 0, fullMark: 50 },
    { subject: 'Satisfaction', A: customerSatisfaction || 0, fullMark: 5 },
  ]

  // Branch comparison data
  const comparisonData = metrics.map(m => ({
    branch: m.branch,
    revenue: Math.round(m.revenue || 0),
    sales: Math.round(m.sales_units || 0),
    inventory: Math.round(m.inventory_units || 0),
    efficiency: Math.round(((m.revenue_per_unit || 0) / 50) * 100),
  }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2d3748' }}>🎯 Management Reports</h2>
          <p style={{ color: '#718096' }}>
            KPIs, operational metrics, and performance dashboards
            {lastUpdated && <span style={{ marginLeft: 12, fontSize: 12 }}>
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>}
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
          <button className="btn btn-outline" onClick={fetchData}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpiData.map((kpi, index) => (
          <div key={index} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="stat-label">{kpi.name}</div>
                <div className="stat-value" style={{ color: kpi.color }}>
                  {kpi.format === 'currency' && 'GHS '}
                  {kpi.format === 'percentage' && kpi.value >= 0 ? '+' : ''}
                  {typeof kpi.value === 'number' ? kpi.value.toFixed(2) : kpi.value}
                  {kpi.format === 'percentage' && '%'}
                </div>
              </div>
              <kpi.icon size={32} color={kpi.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <h3 className="card-title">Business Performance Radar</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar name="Performance" dataKey="A" stroke="#4299e1" fill="#4299e1" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Branch Comparison</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#48bb78" name="Revenue (GHS)" />
                <Bar yAxisId="left" dataKey="sales" fill="#4299e1" name="Sales Units" />
                <Area yAxisId="right" type="monotone" dataKey="efficiency" fill="#ed8936" stroke="#ed8936" name="Efficiency %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="card">
        <h3 className="card-title">Operational Metrics</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Revenue (GHS)</th>
                <th>Sales Units</th>
                <th>Inventory Units</th>
                <th>Revenue/Unit</th>
                <th>Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {metrics.length > 0 ? (
                metrics.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.branch}</strong></td>
                    <td>{item.revenue?.toFixed(2) || '0.00'}</td>
                    <td>{Math.round(item.sales_units || 0)}</td>
                    <td>{Math.round(item.inventory_units || 0)}</td>
                    <td>{item.revenue_per_unit?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: (item.revenue_per_unit || 0) > 30 ? '#f0fff4' : '#fff5f5',
                        color: (item.revenue_per_unit || 0) > 30 ? '#276749' : '#c53030',
                      }}>
                        {((item.revenue_per_unit || 0) / 50 * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 24, color: '#718096' }}>
                    No branch data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ManagementPage