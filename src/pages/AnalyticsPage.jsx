import React, { useState, useEffect } from 'react'
import waakyeApi from '../api/waakyeApi'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Treemap,
} from 'recharts'
import { RefreshCw, TrendingUp, Warehouse, Store, UtensilsCrossed } from 'lucide-react'

const COLORS = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f687b3', '#fc8181', '#68d391', '#b794f4']

const AnalyticsPage = () => {
  const [inventory, setInventory] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [inventoryRes, movementsRes] = await Promise.all([
        waakyeApi.getInventory(),
        waakyeApi.getMovementSummary(),
      ])
      setInventory(inventoryRes.data || [])
      setMovements(movementsRes.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Prepare data for charts
  const barData = inventory.map(item => ({
    name: item.item_name,
    'Warehouse Central': Math.round(item.warehouse_central_qty || 0),
    'Warehouse Annex': Math.round(item.warehouse_annex_qty || 0),
    'Branch Stores': Math.round(item.total_branch_store_qty || 0),
    'Branch Kitchens': Math.round(item.total_branch_kitchen_qty || 0),
  }))

  const totalValue = inventory.reduce((sum, item) => 
    sum + (item.warehouse_central_qty || 0) + (item.warehouse_annex_qty || 0) + 
    (item.total_branch_store_qty || 0) + (item.total_branch_kitchen_qty || 0), 0
  )

  // Movement summary data
  const movementData = movements.map(m => ({
    name: m.movement_type?.replace(/_/g, ' ') || 'Unknown',
    value: m.total_quantity || 0,
  }))

  if (loading && inventory.length === 0) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Loading analytics...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2d3748' }}>Analytics</h2>
          <p style={{ color: '#718096' }}>
            Total inventory: {totalValue} units across all locations
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchData}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: '#fff5f5', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #fc8181' }}>
          <p style={{ color: '#c53030' }}>{error}</p>
        </div>
      )}

      {inventory.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: '#718096' }}>No inventory data available. Upload files to see analytics.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Bar Chart - All Locations */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="card-title">📊 Inventory by Location</h3>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Warehouse Central" fill="#48bb78" />
                  <Bar dataKey="Warehouse Annex" fill="#ed8936" />
                  <Bar dataKey="Branch Stores" fill="#9f7aea" />
                  <Bar dataKey="Branch Kitchens" fill="#f687b3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Movement Summary */}
          <div className="card">
            <h3 className="card-title">🔄 Movement Summary</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={movementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {movementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supply Chain Summary Table */}
          <div className="card">
            <h3 className="card-title">🏭 Supply Chain Summary</h3>
            <div style={{ fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 600 }}>Location</span>
                <span style={{ fontWeight: 600 }}>Total Units</span>
                <span style={{ fontWeight: 600 }}>Items</span>
              </div>
              {['warehouse_central_qty', 'warehouse_annex_qty', 'total_branch_store_qty', 'total_branch_kitchen_qty'].map((key) => {
                const total = inventory.reduce((sum, item) => sum + (item[key] || 0), 0)
                const count = inventory.filter(item => (item[key] || 0) > 0).length
                const labels = {
                  warehouse_central_qty: 'Warehouse Central',
                  warehouse_annex_qty: 'Warehouse Annex',
                  total_branch_store_qty: 'Branch Stores',
                  total_branch_kitchen_qty: 'Branch Kitchens',
                }
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #edf2f7' }}>
                    <span>{labels[key]}</span>
                    <span style={{ fontWeight: 600 }}>{Math.round(total)}</span>
                    <span style={{ color: '#718096' }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Full Inventory Table */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="card-title">📋 Complete Inventory Breakdown</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th>Central</th>
                    <th>Annex</th>
                    <th>Stores</th>
                    <th>Kitchens</th>
                    <th>Total</th>
                    <th>Forecast</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const total = (item.warehouse_central_qty || 0) + (item.warehouse_annex_qty || 0) + 
                                  (item.total_branch_store_qty || 0) + (item.total_branch_kitchen_qty || 0)
                    return (
                      <tr key={item.sku}>
                        <td><strong>{item.item_name}</strong></td>
                        <td>{item.sku}</td>
                        <td>{Math.round(item.warehouse_central_qty || 0)}</td>
                        <td>{Math.round(item.warehouse_annex_qty || 0)}</td>
                        <td>{Math.round(item.total_branch_store_qty || 0)}</td>
                        <td>{Math.round(item.total_branch_kitchen_qty || 0)}</td>
                        <td><strong>{Math.round(total)}</strong></td>
                        <td>{Math.round(item.forecast_demand_7d || 0)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsPage