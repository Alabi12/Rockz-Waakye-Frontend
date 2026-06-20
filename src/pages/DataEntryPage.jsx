import React, { useState, useEffect } from 'react'
import { waakyeApi } from '../api/waakyeApi'
import toast from 'react-hot-toast'
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Save,
  List
} from 'lucide-react'

const DataEntryPage = () => {
  const [formData, setFormData] = useState({
    branch_id: '1',
    category: 'Revenue',
    sub_category: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  })
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const branches = [
    { id: '1', name: 'Branch A - Accra Mall' },
    { id: '2', name: 'Branch B - Madina Market' },
    { id: '3', name: 'Branch C - Tema Station' },
    { id: '4', name: 'Central Kitchen' },
  ]

  const categories = ['Revenue', 'COGS', 'Expense', 'Liability', 'Equity', 'Cash']
  
  const subCategories = {
    Revenue: ['Sales', 'Other Income', 'Discounts Given'],
    COGS: ['Raw Materials', 'Packaging', 'Direct Labor'],
    Expense: ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Supplies', 'Transport', 'Maintenance', 'Insurance'],
    Liability: ['Loans', 'Accounts Payable', 'Accrued Expenses'],
    Equity: ['Owner Investment', 'Retained Earnings'],
    Cash: ['Cash In', 'Cash Out', 'Bank Transfers']
  }

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await waakyeApi.getTransactions(parseInt(formData.branch_id))
      setTransactions(response.data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [formData.branch_id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      await waakyeApi.createTransaction({
        branch_id: parseInt(formData.branch_id),
        category: formData.category,
        sub_category: formData.sub_category || formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description || `${formData.category} entry`
      })
      
      toast.success('Transaction recorded successfully!')
      setFormData(prev => ({ ...prev, amount: '', description: '' }))
      fetchTransactions()
    } catch (error) {
      toast.error('Failed to record transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      Revenue: '#48bb78',
      COGS: '#ed8936',
      Expense: '#fc8181',
      Liability: '#9f7aea',
      Equity: '#4299e1',
      Cash: '#68d391'
    }
    return colors[category] || '#a0aec0'
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2d3748' }}>📝 Manual Data Entry</h2>
        <p style={{ color: '#718096' }}>Enter financial transactions manually when file uploads aren't available</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Input Form */}
        <div className="card">
          <h3 className="card-title">Record Transaction</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#4a5568' }}>
                Branch
              </label>
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
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
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#4a5568' }}>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  background: 'white'
                }}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#4a5568' }}>
                Sub-Category
              </label>
              <select
                name="sub_category"
                value={formData.sub_category}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  background: 'white'
                }}
              >
                <option value="">Select sub-category...</option>
                {(subCategories[formData.category] || []).map(sc => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#4a5568' }}>
                Amount (GHS)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14
                }}
                step="0.01"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#4a5568' }}>
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Save size={16} />
              {submitting ? 'Saving...' : 'Record Transaction'}
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="card">
          <h3 className="card-title">Recent Transactions</h3>
          {loading ? (
            <p style={{ color: '#718096' }}>Loading...</p>
          ) : transactions.length === 0 ? (
            <p style={{ color: '#718096' }}>No transactions recorded yet.</p>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {transactions.slice(0, 20).map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    borderBottom: '1px solid #edf2f7'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        background: getCategoryColor(t.category),
                        color: 'white'
                      }}>
                        {t.category}
                      </span>
                      <span style={{ fontSize: 13, color: '#4a5568' }}>{t.sub_category}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#a0aec0' }}>
                      {new Date(t.date).toLocaleDateString()}
                      {t.description && ` • ${t.description}`}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: t.category === 'Expense' ? '#fc8181' : '#48bb78' }}>
                    {t.category === 'Expense' ? '-' : '+'} GHS {t.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="card-title">Quick Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {categories.slice(0, 4).map(cat => {
            const total = transactions
              .filter(t => t.category === cat)
              .reduce((sum, t) => sum + t.amount, 0)
            return (
              <div key={cat} style={{ textAlign: 'center', padding: 12, background: '#f7fafc', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#718096' }}>{cat}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: getCategoryColor(cat) }}>
                  GHS {total.toFixed(2)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DataEntryPage