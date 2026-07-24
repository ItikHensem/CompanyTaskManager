import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ListTodo,
  PlusSquare,
  FileCheck2,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  UserRound,
  KeyRound,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { APP_NAME, ORG_NAME } from '../data/seed'

const mainNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/officers', label: 'Pegawai', icon: Users },
  { to: '/tasks', label: 'Tugasan', icon: ListTodo },
  { to: '/tasks/create', label: 'Cipta Tugasan', icon: PlusSquare },
  { to: '/submissions', label: 'Serahan', icon: FileCheck2 },
  { to: '/calendar', label: 'Kalendar', icon: CalendarDays },
  { to: '/reports', label: 'Laporan', icon: BarChart3 },
  { to: '/notifications', label: 'Notifikasi', icon: Bell },
]

const settingsNav = [
  { to: '/settings', label: 'Tetapan', icon: Settings },
  { to: '/profile', label: 'Profil', icon: UserRound },
  { to: '/change-password', label: 'Tukar Kata Laluan', icon: KeyRound },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { unreadCount } = useApp()

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <img src="/Logo-Kerajaan.png" alt="Logo Kerajaan" />
        <div>
          <div className="app-name">{APP_NAME}</div>
          <div className="org">{ORG_NAME}</div>
        </div>
        <button
          type="button"
          className="icon-btn mobile-toggle"
          style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="nav-list">
        {mainNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon size={18} />
            <span>{label}</span>
            {to === '/notifications' && unreadCount > 0 && (
              <span className="badge">{unreadCount}</span>
            )}
          </NavLink>
        ))}

        <div className="nav-section-label">Akaun</div>
        {settingsNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
