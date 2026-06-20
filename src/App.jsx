import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import DataEntryPage from './pages/DataEntryPage'
import AlertsPage from './pages/AlertsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import FinancialPage from './pages/FinancialPage'
import ManagementPage from './pages/ManagementPage'
import ProjectionsPage from './pages/ProjectionsPage'
import GrowthPage from './pages/GrowthPage'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/data-entry" element={<DataEntryPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/financial" element={<FinancialPage />} />
              <Route path="/management" element={<ManagementPage />} />
              <Route path="/projections" element={<ProjectionsPage />} />
              <Route path="/growth" element={<GrowthPage />} />
            </Routes>
          </div>
        </div>
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </Router>
  )
}

export default App