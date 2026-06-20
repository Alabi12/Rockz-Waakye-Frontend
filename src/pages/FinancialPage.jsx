import React, { useState, useEffect } from 'react'
import { waakyeApi } from '../api/waakyeApi'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  RefreshCw,
  Download,
  Calendar
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
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#4299e1', '#48bb78', '#ed8936', '#fc8181', '#9f7aea']

const FinancialPage = () => {
  const [branchId, setBranchId] = useState('1')
  const [period, setPeriod] = useState('monthly')
  const [profitLoss, setProfitLoss] = useState(null)
  const [balanceSheet, setBalanceSheet] = useState(null)
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
      const [plResponse, bsResponse] = await Promise.all([
        waakyeApi.getProfitLoss(parseInt(branchId), period),
        waakyeApi.getBalanceSheet(parseInt(branchId))
      ])
      setProfitLoss(plResponse.data)
      setBalanceSheet(bsResponse.data)
    } catch (err) {
      setError('Failed to load financial data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [branchId, period])

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Loading financial data...</div>
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

  const plData = profitLoss ? [
    { name: 'Revenue', value: profitLoss.total_revenue || 0, color: '#48bb78' },
    { name: 'COGS', value: profitLoss.total_cogs || 0, color: '#ed8936' },
    { name: 'Expenses', value: profitLoss.total_expenses || 0, color: '#fc8181' },
    { name: 'Net Profit', value: profitLoss.net_profit || 0, color: '#4299e1' },
  ] : []

  const expenseBreakdown = profitLoss ? [
    { name: 'Revenue', value: profitLoss.total_revenue || 0 },
    { name: 'COGS', value: profitLoss.total_cogs || 0 },
    { name: 'Expenses', value: profitLoss.total_expenses || 0 },
  ] : []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2d3748' }}>📊 Financial Reports</h2>
          <p style={{ color: '#718096' }}>Profit & Loss, Balance Sheet, and Financial Analysis</p>
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
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '8px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              background: 'white'
            }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <button className="btn btn-outline" onClick={fetchData}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Profit & Loss Summary */}
      {profitLoss && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value" style={{ color: '#48bb78' }}>
              GHS {profitLoss.total_revenue?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Gross Profit</div>
            <div className="stat-value" style={{ color: '#4299e1' }}>
              GHS {profitLoss.gross_profit?.toFixed(2) || '0.00'}
            </div>
            <div className="stat-change positive">
              Margin: {profitLoss.gross_margin?.toFixed(1)}%
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Net Profit</div>
            <div className="stat-value" style={{ color: profitLoss.net_profit > 0 ? '#48bb78' : '#fc8181' }}>
              GHS {profitLoss.net_profit?.toFixed(2) || '0.00'}
            </div>
            <div className={`stat-change ${profitLoss.net_profit > 0 ? 'positive' : 'negative'}`}>
              Net Margin: {profitLoss.net_margin?.toFixed(1)}%
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value" style={{ color: '#fc8181' }}>
              GHS {profitLoss.total_expenses?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <h3 className="card-title">Profit & Loss Breakdown</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `GHS ${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#4299e1">
                  {plData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Revenue vs COGS vs Expenses</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `GHS ${value.toFixed(2)}`} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Balance Sheet */}
      {balanceSheet && (
        <div className="card">
          <h3 className="card-title">Balance Sheet</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
            <div>
              <h4 style={{ color: '#4299e1', marginBottom: 12 }}>Assets</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf2f7' }}>
                <span>Cash</span>
                <span>GHS {balanceSheet.assets?.cash?.toFixed(2) || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf2f7' }}>
                <span>Inventory</span>
                <span>GHS {balanceSheet.assets?.inventory?.toFixed(2) || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf2f7' }}>
                <span>Kitchen Stock</span>
                <span>GHS {balanceSheet.assets?.kitchen_stock?.toFixed(2) || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700, borderTop: '2px solid #e2e8f0' }}>
                <span>Total Assets</span>
                <span>GHS {balanceSheet.assets?.total_assets?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#ed8936', marginBottom: 12 }}>Liabilities</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf2f7' }}>
                <span>Total Liabilities</span>
                <span>GHS {balanceSheet.liabilities?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#48bb78', marginBottom: 12 }}>Equity</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf2f7' }}>
                <span>Total Equity</span>
                <span>GHS {balanceSheet.equity?.toFixed(2) || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700, borderTop: '2px solid #e2e8f0' }}>
                <span>Liabilities + Equity</span>
                <span>GHS {balanceSheet.total_liabilities_equity?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinancialPage