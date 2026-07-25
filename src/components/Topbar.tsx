import { Bell, Menu, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ORG_FULL, ORG_NAME } from '../data/seed'

interface TopbarProps {
  onMenu: () => void
  onSearch: () => void
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function Topbar({ onMenu, onSearch }: TopbarProps) {
  const { profile, unreadCount } = useApp()

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="mobile-toggle" onClick={onMenu} aria-label="Menu">
          <Menu size={18} />
        </button>
        <img className="topbar-logo" src="/Logo-Kerajaan.png" alt="Logo Kerajaan" />
        <div className="topbar-org">
          <strong>{ORG_NAME}</strong>
          <span className="topbar-org-full">{ORG_FULL}</span>
        </div>
      </div>

      <div className="topbar-right">
        <button type="button" className="icon-btn" onClick={onSearch} aria-label="Carian global">
          <Search size={18} />
        </button>
        <Link to="/notifications" className="icon-btn" aria-label="Notifikasi">
          <Bell size={18} />
          {unreadCount > 0 && <span className="dot" />}
        </Link>

        <Link to="/profile" className="profile-chip" title={profile.name} aria-label={profile.name}>
          <div className="avatar">{initials(profile.name)}</div>
          <div className="profile-meta">
            <strong>{profile.name}</strong>
            <span>{profile.role} · {profile.email}</span>
          </div>
        </Link>
      </div>
    </header>
  )
}
