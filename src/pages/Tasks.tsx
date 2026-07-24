import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatDate, StatusBadge } from '../components/ui'
import type { TaskPriority, TaskStatus } from '../types'

export function Tasks() {
  const { tasks, getOfficer } = useApp()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'semua' | TaskStatus>('semua')
  const [priority, setPriority] = useState<'semua' | TaskPriority>('semua')

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchQ = !q || t.title.toLowerCase().includes(q.toLowerCase()) || t.category.toLowerCase().includes(q.toLowerCase())
      const matchS = status === 'semua' || t.status === status
      const matchP = priority === 'semua' || t.priority === priority
      return matchQ && matchS && matchP
    })
  }, [tasks, q, status, priority])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Tugasan</h1>
          <p>Senarai semua tugasan yang diagihkan kepada pegawai dalam dan luar.</p>
        </div>
        <Link to="/tasks/create" className="btn btn-primary">
          <Plus size={16} /> Cipta Tugasan
        </Link>
      </div>

      <div className="panel">
        <div className="filters">
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }} />
            <input
              className="search-input"
              style={{ width: '100%', paddingLeft: 36 }}
              placeholder="Cari tajuk atau kategori..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="semua">Semua status</option>
            <option value="baru">Baru</option>
            <option value="sedang berjalan">Sedang berjalan</option>
            <option value="menunggu semakan">Menunggu semakan</option>
            <option value="selesai">Selesai</option>
            <option value="tertunda">Tertunda</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
            <option value="semua">Semua keutamaan</option>
            <option value="tinggi">Tinggi</option>
            <option value="sederhana">Sederhana</option>
            <option value="rendah">Rendah</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Tajuk</th>
                <th>Kategori</th>
                <th>Ditugaskan kepada</th>
                <th>Keutamaan</th>
                <th>Status</th>
                <th>Tarikh akhir</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/tasks/${t.id}`} style={{ color: 'var(--unity)', fontWeight: 600 }}>
                      {t.title}
                    </Link>
                    {t.location && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{t.location}</div>
                    )}
                  </td>
                  <td>{t.category}</td>
                  <td>
                    {t.assignedTo.map((id) => getOfficer(id)?.name).filter(Boolean).join(', ') || '—'}
                  </td>
                  <td><StatusBadge value={t.priority} /></td>
                  <td><StatusBadge value={t.status} /></td>
                  <td>{formatDate(t.dueDate)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">Tiada tugasan dijumpai.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
