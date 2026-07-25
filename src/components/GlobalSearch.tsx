import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

interface Props {
  open: boolean
  onClose: () => void
}

export function GlobalSearch({ open, onClose }: Props) {
  const { officers, visibleTasks, isAdmin } = useApp()
  const [q, setQ] = useState('')

  useEffect(() => {
    if (open) setQ('')
  }, [open])

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return { tasks: [], officers: [] }
    const tasks = visibleTasks
      .filter((t) =>
        `${t.title} ${t.category} ${t.negeri || ''} ${t.location || ''}`
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 8)
    const officerHits = isAdmin
      ? officers
          .filter((o) =>
            `${o.name} ${o.email} ${o.negeri} ${o.location} ${o.department}`
              .toLowerCase()
              .includes(query),
          )
          .slice(0, 8)
      : []
    return { tasks, officers: officerHits }
  }, [q, visibleTasks, officers, isAdmin])

  if (!open) return null

  return (
    <div className="overlay show search-overlay" onClick={onClose}>
      <div className="panel search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-title">
          <h2>Carian Global</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
        <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }} />
          <input
            autoFocus
            className="search-input"
            style={{ width: '100%', paddingLeft: 36 }}
            placeholder="Cari tugasan, pegawai, negeri..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {!q.trim() && <div className="empty">Taip untuk mula mencari.</div>}

        {q.trim() && (
          <>
            <h3 className="search-section">Tugasan ({results.tasks.length})</h3>
            {results.tasks.length === 0 ? (
              <div className="empty" style={{ padding: '0.5rem' }}>Tiada tugasan.</div>
            ) : (
              results.tasks.map((t) => (
                <Link key={t.id} to={`/tasks/${t.id}`} className="search-hit" onClick={onClose}>
                  <strong>{t.title}</strong>
                  <span>{t.category} · {t.negeri || '—'} · {t.status}</span>
                </Link>
              ))
            )}

            {isAdmin && (
              <>
                <h3 className="search-section">Pegawai ({results.officers.length})</h3>
                {results.officers.length === 0 ? (
                  <div className="empty" style={{ padding: '0.5rem' }}>Tiada pegawai.</div>
                ) : (
                  results.officers.map((o) => (
                    <Link key={o.id} to="/officers" className="search-hit" onClick={onClose}>
                      <strong>{o.name}</strong>
                      <span>{o.negeri} · {o.type} · {o.email}</span>
                    </Link>
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
