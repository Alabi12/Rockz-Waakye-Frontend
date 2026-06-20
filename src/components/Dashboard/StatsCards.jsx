import React from 'react'
import { Package, Warehouse, Store, UtensilsCrossed, AlertCircle } from 'lucide-react'

const StatsCards = ({ inventory }) => {
  const totalItems = inventory.length
  const totalCentral = inventory.reduce((sum, item) => sum + (item.warehouse_central_qty || 0), 0)
  const totalAnnex = inventory.reduce((sum, item) => sum + (item.warehouse_annex_qty || 0), 0)
  const totalStore = inventory.reduce((sum, item) => sum + (item.total_branch_store_qty || 0), 0)
  const totalKitchen = inventory.reduce((sum, item) => sum + (item.total_branch_kitchen_qty || 0), 0)
  const lowStockItems = inventory.filter(item => item.total_branch_store_qty < 5 || item.total_branch_kitchen_qty < 3).length

  const stats = [
    {
      label: 'Total Items',
      value: totalItems,
      icon: Package,
      color: '#4299e1',
    },
    {
      label: 'Warehouse Central',
      value: Math.round(totalCentral),
      icon: Warehouse,
      color: '#48bb78',
    },
    {
      label: 'Warehouse Annex',
      value: Math.round(totalAnnex),
      icon: Warehouse,
      color: '#ed8936',
    },
    {
      label: 'Branch Stores',
      value: Math.round(totalStore),
      icon: Store,
      color: '#9f7aea',
    },
    {
      label: 'Branch Kitchens',
      value: Math.round(totalKitchen),
      icon: UtensilsCrossed,
      color: '#f687b3',
    },
    {
      label: 'Low Stock Alerts',
      value: lowStockItems,
      icon: AlertCircle,
      color: '#fc8181',
    },
  ]

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
            <stat.icon size={32} color={stat.color} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards