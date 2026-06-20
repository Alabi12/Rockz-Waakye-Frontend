import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Upload, 
  AlertTriangle, 
  BarChart3,
  Warehouse,
  DollarSign,
  TrendingUp,
  LineChart,
  Settings,
  BookOpen,
  Target
} from 'lucide-react'

const Sidebar = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Upload Data' },
    { to: '/data-entry', icon: BookOpen, label: 'Data Entry' },
    { to: '/alerts', icon: AlertTriangle, label: 'AI Alerts' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/financial', icon: DollarSign, label: 'Financial Reports' },
    { to: '/management', icon: Target, label: 'Management Reports' },
    { to: '/projections', icon: LineChart, label: 'AI Projections' },
    { to: '/growth', icon: TrendingUp, label: 'Growth Metrics' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Warehouse size={28} />
        <span>Waakye AI</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-version">v2.0 - Financial Suite</div>
      </div>
    </aside>
  )
}

export default Sidebar