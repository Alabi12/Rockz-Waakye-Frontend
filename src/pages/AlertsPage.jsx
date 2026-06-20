import React, { useState, useEffect } from 'react'
import { waakyeApi } from '../api/waakyeApi'
import { AlertTriangle, RefreshCw, Bell, BellOff, Warehouse, Store, UtensilsCrossed } from 'lucide-react'

const AlertsPage = () => {
  const [anomalies, setAnomalies] = useState([])
  const [reconciliations, setReconciliations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const [anomalyRes, reconRes] = await Promise.all([
        waakyeApi.getAnomalies(),
        waakyeApi.getReconciliation(),
      ])
      setAnomalies(anomalyRes.data || [])
      setReconciliations(reconRes.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to load alerts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(fetchAlerts, 15000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'alert-high'
      case 'medium': return 'alert-medium'
      case 'low': return 'alert-low'
      default: return 'alert-low'
    }
  }

  const getLocationIcon = (location) => {
    if (!location) return <Store size={16} />
    const loc = location.toLowerCase()
    if (loc.includes('store')) return <Store size={16} color="#9f7aea" />
    if (loc.includes('kitchen')) return <UtensilsCrossed size={16} color="#f687b3" />
    if (loc.includes('warehouse')) return <Warehouse size={16} color="#48bb78" />
    return <Store size={16} />
  }

  const totalAlerts = anomalies.length + reconciliations.length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2d3748' }}>AI Alerts</h2>
          <p style={{ color: '#718096' }}>
            {totalAlerts} active alerts detected by the AI system
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchAlerts}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: '#fff5f5', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #fc8181' }}>
          <p style={{ color: '#c53030' }}>{error}</p>
        </div>
      )}

      {loading && totalAlerts === 0 ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Bell size={48} color="#a0aec0" />
          <p style={{ color: '#718096', marginTop: 12 }}>Checking for alerts...</p>
        </div>
      ) : totalAlerts === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <BellOff size={48} color="#48bb78" />
          <h3 style={{ marginTop: 12, color: '#2d3748' }}>No Alerts</h3>
          <p style={{ color: '#718096' }}>All branches are operating normally.</p>
        </div>
      ) : (
        <div>
          {anomalies.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 className="card-title">
                <AlertTriangle size={18} style={{ display: 'inline', marginRight: 8 }} />
                AI Anomaly Detection ({anomalies.length})
              </h3>
              <div>
                {anomalies.map((alert, index) => (
                  <div key={index} className={`alert-item ${getSeverityColor(alert.severity)}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getLocationIcon(alert.location)}
                      <div className="alert-title">
                        {alert.item_name || 'Unknown Item'}
                        {alert.location && <span style={{ fontWeight: 'normal', color: '#718096', marginLeft: 8 }}>
                          ({alert.location})
                        </span>}
                      </div>
                    </div>
                    <div className="alert-message">
                      {alert.branch_name && <strong>{alert.branch_name}: </strong>}
                      {alert.recommendation || alert.message || 'Review this anomaly'}
                    </div>
                    {alert.current_quantity !== undefined && (
                      <div style={{ marginTop: 4, fontSize: 13, color: '#4a5568' }}>
                        Current Stock: {Math.round(alert.current_quantity)} units
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {reconciliations.length > 0 && (
            <div className="card">
              <h3 className="card-title">
                <Bell size={18} style={{ display: 'inline', marginRight: 8 }} />
                Reconciliation Flags ({reconciliations.length})
              </h3>
              <div>
                {reconciliations.map((item, index) => (
                  <div key={index} className={`alert-item alert-medium`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getLocationIcon(item.location)}
                      <div className="alert-title">
                        {item.branch || 'Unknown Branch'}
                        {item.location && <span style={{ fontWeight: 'normal', color: '#718096', marginLeft: 8 }}>
                          ({item.location})
                        </span>}
                      </div>
                    </div>
                    <div className="alert-message">{item.message || item.item || 'Reconciliation variance detected'}</div>
                    {item.variance !== undefined && item.variance !== 0 && (
                      <div style={{ marginTop: 4, fontSize: 13, color: '#4a5568' }}>
                        Variance: {Math.round(item.variance)} units
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AlertsPage