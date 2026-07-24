import { Link } from 'react-router-dom'
import {
  Users,
  ListTodo,
  FileCheck2,
  AlertTriangle,
  Plus,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApp } from '../context/AppContext'
import { formatDate, StatusBadge } from '../components/ui'

export function Dashboard() {
  const { officers, tasks, submissions, notifications, getOfficer } = useApp()

  const activeOfficers = officers.filter((o) => o.status === 'aktif').length
  const openTasks = tasks.filter((t) => t.status !== 'selesai').length
  const pendingSubs = submissions.filter((s) => s.status === 'dihantar' || s.status === 'semakan semula').length
  const overdue = tasks.filter(
    (t) => t.status !== 'selesai' && t.dueDate < new Date().toISOString().slice(0, 10),
  ).length

  const byStatus = [
    { name: 'Baru', value: tasks.filter((t) => t.status === 'baru').length },
    { name: 'Berjalan', value: tasks.filter((t) => t.status === 'sedang berjalan').length },
    { name: 'Semakan', value: tasks.filter((t) => t.status === 'menunggu semakan').length },
    { name: 'Selesai', value: tasks.filter((t) => t.status === 'selesai').length },
    { name: 'Tertunda', value: tasks.filter((t) => t.status === 'tertunda').length },
  ]

  const recentTasks = [...tasks]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  const unread = notifications.filter((n) => !n.read).slice(0, 4)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Ringkasan agihan tugasan pegawai dalam dan luar JPNIN.</p>
        </div>
        <Link to="/tasks/create" className="btn btn-primary">
          <Plus size={16} /> Cipta Tugasan
        </Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="stat">
          <div className="label"><Users size={14} style={{ verticalAlign: -2 }} /> Pegawai Aktif</div>
          <div className="value">{activeOfficers}</div>
          <div className="hint">{officers.filter((o) => o.type === 'luar').length} luar · {officers.filter((o) => o.type === 'dalam').length} dalam</div>
        </div>
        <div className="stat">
          <div className="label"><ListTodo size={14} style={{ verticalAlign: -2 }} /> Tugasan Dibuka</div>
          <div className="value">{openTasks}</div>
          <div className="hint">daripada {tasks.length} jumlah tugasan</div>
        </div>
        <div className="stat">
          <div className="label"><FileCheck2 size={14} style={{ verticalAlign: -2 }} /> Serahan Menunggu</div>
          <div className="value">{pendingSubs}</div>
          <div className="hint">perlu semakan</div>
        </div>
        <div className="stat">
          <div className="label"><AlertTriangle size={14} style={{ verticalAlign: -2 }} /> Melebihi Tarikh</div>
          <div className="value">{overdue}</div>
          <div className="hint">tugasan tertunggak</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">
            <h2>Status Tugasan</h2>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d0d7e2" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0e6b5c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>Notifikasi Terkini</h2>
            <Link to="/notifications" className="btn btn-ghost btn-sm">Lihat semua</Link>
          </div>
          {unread.length === 0 ? (
            <div className="empty">Tiada notifikasi baharu.</div>
          ) : (
            unread.map((n) => (
              <div key={n.id} className="notif-item unread">
                <div style={{ flex: 1 }}>
                  <h3>{n.title}</h3>
                  <p>{n.message}</p>
                  <time>{formatDate(n.createdAt, true)}</time>
                </div>
                <StatusBadge value={n.type} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: '1rem' }}>
        <div className="panel-title">
          <h2>Tugasan Terkini</h2>
          <Link to="/tasks" className="btn btn-ghost btn-sm">Semua tugasan</Link>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Tajuk</th>
                <th>Pegawai</th>
                <th>Keutamaan</th>
                <th>Status</th>
                <th>Tarikh Akhir</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/tasks/${t.id}`} style={{ color: 'var(--unity)', fontWeight: 600 }}>
                      {t.title}
                    </Link>
                  </td>
                  <td>
                    {t.assignedTo
                      .map((id) => getOfficer(id)?.name.split(' ')[0])
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </td>
                  <td><StatusBadge value={t.priority} /></td>
                  <td><StatusBadge value={t.status} /></td>
                  <td>{formatDate(t.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
