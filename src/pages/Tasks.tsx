import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { NEGERI_LIST } from '../data/seed'
import { formatDate, StatusBadge } from '../components/ui'
import type { TaskPriority, TaskStatus } from '../types'

export function Tasks() {
  const { visibleTasks, getOfficer, isAdmin } = useApp()
  const [params] = useSearchParams()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'semua' | TaskStatus>('semua')
  const [priority, setPriority] = useState<'semua' | TaskPriority>('semua')
  const [negeri, setNegeri] = useState(params.get('negeri') || 'semua')

  const filtered = useMemo(() => {
    return visibleTasks.filter((t) => {
      const matchQ = !q || t.title.toLowerCase().includes(q.toLowerCase()) || t.category.toLowerCase().includes(q.toLowerCase())
      const matchS = status === 'semua' || t.status === status
      const matchP = priority === 'semua' || t.priority === priority
      const matchN = negeri === 'semua' || t.negeri === negeri
      return matchQ && matchS && matchP && matchN
    })
  }, [visibleTasks, q, status, priority, negeri])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isAdmin ? 'Tugasan' : 'Tugasan Saya'}</h1>
          <p>{isAdmin ? 'Semua tugasan diagihkan.' : 'Tugasan yang diassign kepada anda.'}</p>
        </div>
        {isAdmin && (
          <Link to="/tasks/create" className="btn btn-primary">
            <Plus size={16} /> Cipta Tugasan
          </Link>
        )}
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
          <select value={negeri} onChange={(e) => setNegeri(e.target.value)}>
            <option value="semua">Semua negeri</option>
            {NEGERI_LIST.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Tajuk</th>
                <th>Negeri</th>
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
                    {t.recurrence === 'bulanan' && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--gold)' }}>Ulang bulanan</div>
                    )}
                  </td>
                  <td>{t.negeri || '—'}</td>
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
