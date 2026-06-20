import React from 'react'
import { Bell, User } from 'lucide-react'

const Header = () => {
  return (
    <header className="header">
      <h1 className="header-title">Waakye Financial Operations</h1>
      <div className="header-user">
        <Bell size={20} style={{ cursor: 'pointer' }} />
        <div className="header-avatar">
          <User size={20} />
        </div>
      </div>
    </header>
  )
}

export default Header