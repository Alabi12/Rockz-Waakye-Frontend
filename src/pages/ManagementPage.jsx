import React, { useState, useEffect } from 'react'
import { waakyeApi } from '../api/waakyeApi'
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
  DollarSign  // <-- This was missing!
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
      const [kpiResponse, growthResponse] = await Promise.all([
        waakyeApi.getKPIs(parseInt(branchId)),
        waakyeApi.getGrowthMetrics()
      ])
      setKpis(kpiResponse.data)
      setMetrics(growthResponse.data || [])
    } catch (err) {
      setError('Failed to load management data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [branchId])

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Loading management data...</div>
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

  const kpiData = kpis ? [
    { name: 'Total Sales', value: kpis.total_sales || 0, icon: DollarSign, color: '#48bb78' },
    { name: 'Total Orders', value: kpis.total_orders || 0, icon: ShoppingBag, color: '#4299e1' },
    { name: 'Avg Transaction', value: kpis.average_transaction || 0, icon: Award, color: '#9f7aea' },
    { name: 'Sales Growth', value: kpis.sales_growth || 0, icon: TrendingUp, color: '#48bb78' },
  ] : []

  const radarData = kpis ? [
    { subject: 'Revenue', A: kpis.total_sales || 0, fullMark: 10000 },
    { subject: 'Orders', A: kpis.total_orders || 0, fullMark: 500 },
    { subject: 'Avg Sale', A: kpis.average_transaction || 0, fullMark: 200 },
    { subject: 'Growth', A: kpis.sales_growth || 0, fullMark: 100 },
    { subject: 'Turnover', A: kpis.inventory_turnover || 0, fullMark: 50 },
    { subject: 'Satisfaction', A: kpis.customer_satisfaction || 0, fullMark: 5 },
  ] : []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2d3748' }}>🎯 Management Reports</h2>
          <p style={{ color: '#718096' }}>KPIs, operational metrics, and performance dashboards</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
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
                  {typeof kpi.value === 'number' && kpi.name.includes('GHS') 
                    ? `GHS ${kpi.value.toFixed(2)}` 
                    : kpi.value.toFixed(1)}
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
              <ComposedChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#48bb78" name="Revenue (GHS)" />
                <Bar dataKey="sales_units" fill="#4299e1" name="Sales Units" />
                <Area type="monotone" dataKey="inventory_health" fill="#ed8936" stroke="#ed8936" name="Inventory Health" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
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
                <th>Inventory Health</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((item, index) => (
                <tr key={index}>
                  <td><strong>{item.branch}</strong></td>
                  <td>{item.revenue?.toFixed(2) || '0.00'}</td>
                  <td>{item.sales_units || 0}</td>
                  <td>{item.inventory_units || 0}</td>
                  <td>{item.revenue_per_unit?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: (item.inventory_health || 0) > 10 ? '#f0fff4' : '#fff5f5',
                      color: (item.inventory_health || 0) > 10 ? '#276749' : '#c53030',
                    }}>
                      {(item.inventory_health || 0).toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ManagementPage