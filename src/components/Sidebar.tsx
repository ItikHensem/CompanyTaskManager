import { useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
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
  MapPinned,
  ScrollText,
  LogOut,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { APP_NAME, ORG_NAME } from '../data/seed'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { unreadCount, isAdmin, logout, profile } = useApp()
  const navigate = useNavigate()

  const mainNav = useMemo(() => {
    const items = [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, adminOnly: false },
      { to: '/officers', label: 'Pegawai', icon: Users, adminOnly: true },
      { to: '/tasks', label: 'Tugasan', icon: ListTodo, adminOnly: false },
      { to: '/tasks/create', label: 'Cipta Tugasan', icon: PlusSquare, adminOnly: true },
      { to: '/submissions', label: 'Serahan', icon: FileCheck2, adminOnly: false },
      { to: '/calendar', label: 'Kalendar', icon: CalendarDays, adminOnly: false },
      { to: '/map', label: 'Peta Negeri', icon: MapPinned, adminOnly: true },
      { to: '/reports', label: 'Laporan', icon: BarChart3, adminOnly: true },
      { to: '/notifications', label: 'Notifikasi', icon: Bell, adminOnly: false },
      { to: '/audit', label: 'Audit Log', icon: ScrollText, adminOnly: true },
    ]
    return items.filter((i) => (i.adminOnly ? isAdmin : true))
  }, [isAdmin])

  const settingsNav = [
    { to: '/settings', label: 'Tetapan', icon: Settings },
    { to: '/profile', label: 'Profil', icon: UserRound },
    { to: '/change-password', label: 'Tukar Kata Laluan', icon: KeyRound },
  ]

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <img src="/Logo-Kerajaan.png" alt="Logo Kerajaan" />
        <div>
          <div className="app-name">{APP_NAME}</div>
          <div className="org">{ORG_NAME} · {profile.role}</div>
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
        <button
          type="button"
          className="nav-link"
          style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
          onClick={() => {
            logout()
            onClose()
            navigate('/login', { replace: true })
            window.location.reload()
          }}
        >
          <LogOut size={18} />
          <span>Log Keluar</span>
        </button>
      </nav>
    </aside>
  )
}
