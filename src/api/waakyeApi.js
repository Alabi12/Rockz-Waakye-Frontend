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

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${API_BASE}/auth/refresh`, {
          refresh_token: refreshToken
        })
        localStorage.setItem('access_token', response.data.access_token)
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

// ============ AUTHENTICATION ============
export const authApi = {
  login: (username, password) => 
    api.post('/auth/login', new URLSearchParams({ username, password })),
  
  logout: () => api.post('/auth/logout'),
  
  refresh: (refreshToken) => 
    api.post('/auth/refresh', { refresh_token: refreshToken }),
  
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    }),
  
  getMe: () => api.get('/auth/me'),
}

// ============ USER MANAGEMENT ============
export const userApi = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
}

// ============ BRANCH MANAGEMENT ============
export const branchApi = {
  getBranches: () => api.get('/branches'),
  getBranch: (id) => api.get(`/branches/${id}`),
  createBranch: (data) => api.post('/branches', data),
  updateBranch: (id, data) => api.put(`/branches/${id}`, data),
  deleteBranch: (id) => api.delete(`/branches/${id}`),
}

// ============ WAREHOUSE MANAGEMENT ============
export const warehouseApi = {
  getWarehouses: () => api.get('/warehouse'),
  getWarehouse: (id) => api.get(`/warehouse/${id}`),
  getWarehouseStock: (id) => api.get(`/warehouse/${id}/stock`),
  createWarehouse: (data) => api.post('/warehouse', data),
  updateWarehouse: (id, data) => api.put(`/warehouse/${id}`, data),
  adjustStock: (warehouseId, data) => 
    api.post(`/warehouse/${warehouseId}/stock`, data),
  createTransfer: (data) => api.post('/warehouse/transfer', data),
  getTransfers: (status) => 
    api.get(`/warehouse/transfers${status ? `?status=${status}` : ''}`),
}

// ============ INVENTORY & ANALYTICS ============
export const inventoryApi = {
  getInventory: () => api.get('/analytics/inventory/consolidated'),
  getLocationSummary: () => api.get('/analytics/inventory/locations'),
  getMovementSummary: () => api.get('/analytics/movements/summary'),
  uploadFile: (branchId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/upload/${branchId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ============ ALERTS ============
export const alertApi = {
  getAnomalies: () => api.get('/analytics/alerts/anomalies'),
  getReconciliation: () => api.get('/analytics/alerts/reconciliation'),
}

// ============ FINANCIAL ============
export const financialApi = {
  createTransaction: (data) => api.post('/financial/transactions', data),
  getTransactions: (branchId) => api.get(`/financial/transactions/${branchId}`),
  getProfitLoss: (branchId, period = 'monthly') => 
    api.get(`/financial/profit-loss/${branchId}?period=${period}`),
  getBalanceSheet: (branchId) => api.get(`/financial/balance-sheet/${branchId}`),
  getKPIs: (branchId) => api.get(`/financial/kpis/${branchId}`),
  getProjections: (branchId, days = 30) => 
    api.get(`/financial/projections/${branchId}?days=${days}`),
  getGrowthMetrics: () => api.get('/financial/growth-metrics'),
}

// ============ DEFAULT EXPORT ============
// This is the main export used by most pages
const waakyeApi = {
  // Health
  health: () => api.get('/health'),
  
  // Inventory (from inventoryApi)
  getInventory: inventoryApi.getInventory,
  getLocationSummary: inventoryApi.getLocationSummary,
  getMovementSummary: inventoryApi.getMovementSummary,
  uploadFile: inventoryApi.uploadFile,
  
  // Alerts (from alertApi)
  getAnomalies: alertApi.getAnomalies,
  getReconciliation: alertApi.getReconciliation,
  
  // Financial (from financialApi)
  createTransaction: financialApi.createTransaction,
  getTransactions: financialApi.getTransactions,
  getProfitLoss: financialApi.getProfitLoss,
  getBalanceSheet: financialApi.getBalanceSheet,
  getKPIs: financialApi.getKPIs,
  getProjections: financialApi.getProjections,
  getGrowthMetrics: financialApi.getGrowthMetrics,
  
  // Auth
  login: authApi.login,
  logout: authApi.logout,
  getMe: authApi.getMe,
  changePassword: authApi.changePassword,
}

export default waakyeApi