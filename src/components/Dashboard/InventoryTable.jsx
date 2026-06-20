import React from 'react'

const InventoryTable = ({ inventory }) => {
  if (inventory.length === 0) {
    return <p style={{ color: '#718096' }}>No inventory data available. Upload a file to get started.</p>
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Item</th>
            <th>SKU</th>
            <th>Warehouse Central</th>
            <th>Warehouse Annex</th>
            <th>Branch Stores</th>
            <th>Branch Kitchens</th>
            <th>Forecast (7d)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => {
            const total = (item.warehouse_central_qty || 0) + (item.warehouse_annex_qty || 0) + 
                          (item.total_branch_store_qty || 0) + (item.total_branch_kitchen_qty || 0)
            const lowStock = (item.total_branch_store_qty || 0) < 5 || (item.total_branch_kitchen_qty || 0) < 3
            
            return (
              <tr key={item.sku}>
                <td><strong>{item.item_name}</strong></td>
                <td>{item.sku}</td>
                <td>{Math.round(item.warehouse_central_qty || 0)}</td>
                <td>{Math.round(item.warehouse_annex_qty || 0)}</td>
                <td>{Math.round(item.total_branch_store_qty || 0)}</td>
                <td>{Math.round(item.total_branch_kitchen_qty || 0)}</td>
                <td>{Math.round(item.forecast_demand_7d || 0)}</td>
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: lowStock ? '#fff5f5' : '#f0fff4',
                    color: lowStock ? '#c53030' : '#276749',
                  }}>
                    {lowStock ? '⚠️ Low Stock' : '✅ In Stock'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryTable