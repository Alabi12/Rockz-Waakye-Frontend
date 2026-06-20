import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(request => {
  console.log('API Request:', request.method.toUpperCase(), request.url);
  return request;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.message || 'Something went wrong';
    console.error('API Error:', status, message);
    if (status === 502 || status === 500) {
      toast.error('Server error. Please check if the backend is running.');
    } else if (status === 404) {
      toast.error('Endpoint not found. Please check the URL.');
    } else {
      toast.error(message);
    }
    return Promise.reject(error);
  }
)

export const waakyeApi = {
  // Health check
  health: () => api.get('/health'),

  // Inventory
  getInventory: () => api.get('/analytics/inventory/consolidated'),
  getLocationSummary: () => api.get('/analytics/inventory/locations'),
  getMovementSummary: () => api.get('/analytics/movements/summary'),

  // Alerts
  getAnomalies: () => api.get('/analytics/alerts/anomalies'),
  getReconciliation: () => api.get('/analytics/alerts/reconciliation'),

  // Upload
  uploadFile: (branchId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/upload/${branchId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Financial (NEW)
  createTransaction: (data) => api.post('/financial/transactions', data),
  getTransactions: (branchId) => api.get(`/financial/transactions/${branchId}`),
  getProfitLoss: (branchId, period = 'monthly') => api.get(`/financial/profit-loss/${branchId}?period=${period}`),
  getBalanceSheet: (branchId) => api.get(`/financial/balance-sheet/${branchId}`),
  getKPIs: (branchId) => api.get(`/financial/kpis/${branchId}`),
  getProjections: (branchId, days = 30) => api.get(`/financial/projections/${branchId}?days=${days}`),
  getGrowthMetrics: () => api.get('/financial/growth-metrics'),
}

export default api