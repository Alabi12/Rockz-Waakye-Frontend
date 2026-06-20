import React, { useState, useEffect } from 'react'
import waakyeApi from '../api/waakyeApi'
import StatsCards from '../components/Dashboard/StatsCards'
import InventoryTable from '../components/Dashboard/InventoryTable'
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react'

const DashboardPage = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await waakyeApi.getInventory()
      setInventory(response.data || [])
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError('Failed to load inventory data')
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

  if (loading && inventory.length === 0) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2d3748' }}>Supply Chain Dashboard</h2>
          <p style={{ color: '#718096', fontSize: 14 }}>
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
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

      <StatsCards inventory={inventory} />
      
      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="card-title">📦 Inventory Overview Across All Locations</h3>
        <InventoryTable inventory={inventory} />
      </div>
    </div>
  )
}

export default DashboardPage