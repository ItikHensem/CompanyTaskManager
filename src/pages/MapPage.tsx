import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { NEGERI_LIST } from '../data/seed'

export function MapPage() {
  const { officers, tasks } = useApp()

  const stats = useMemo(() => {
    return NEGERI_LIST.map((negeri) => {
      const officerCount = officers.filter((o) => o.negeri === negeri).length
      const luar = officers.filter((o) => o.negeri === negeri && o.type === 'luar').length
      const taskCount = tasks.filter((t) => t.negeri === negeri).length
      const open = tasks.filter((t) => t.negeri === negeri && t.status !== 'selesai').length
      return { negeri, officerCount, luar, taskCount, open }
    }).filter((s) => s.officerCount > 0 || s.taskCount > 0)
  }, [officers, tasks])

  const maxTasks = Math.max(1, ...stats.map((s) => s.taskCount))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Peta Negeri</h1>
          <p>Agihan pegawai luar & tugasan mengikut negeri.</p>
        </div>
      </div>

      <div className="map-grid">
        {stats.map((s) => (
          <div key={s.negeri} className="map-card">
            <div className="map-card-head">
              <strong>{s.negeri}</strong>
              <span>{s.open} dibuka</span>
            </div>
            <div
              className="map-bar"
              style={{ width: `${Math.max(12, (s.taskCount / maxTasks) * 100)}%` }}
              title={`${s.taskCount} tugasan`}
            />
            <div className="map-meta">
              <span>{s.officerCount} pegawai ({s.luar} luar)</span>
              <span>{s.taskCount} tugasan</span>
            </div>
            <Link className="btn btn-ghost btn-sm" to={`/tasks?negeri=${encodeURIComponent(s.negeri)}`}>
              Lihat tugasan
            </Link>
          </div>
        ))}
      </div>

      {stats.length === 0 && <div className="panel empty">Tiada data negeri.</div>}
    </div>
  )
}
