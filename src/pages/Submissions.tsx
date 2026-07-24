import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatDate, StatusBadge } from '../components/ui'
import type { SubmissionStatus } from '../types'

export function Submissions() {
  const { submissions, getTask, getOfficer, reviewSubmission } = useApp()
  const [status, setStatus] = useState<'semua' | SubmissionStatus>('semua')
  const [note, setNote] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    return [...submissions]
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      .filter((s) => status === 'semua' || s.status === status)
  }, [submissions, status])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Serahan</h1>
          <p>Semak dan luluskan serahan tugasan daripada pegawai.</p>
        </div>
      </div>

      <div className="panel">
        <div className="filters">
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="semua">Semua status</option>
            <option value="dihantar">Dihantar</option>
            <option value="semakan semula">Semakan semula</option>
            <option value="diterima">Diterima</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Tugasan</th>
                <th>Pegawai</th>
                <th>Catatan</th>
                <th>Fail</th>
                <th>Status</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const task = getTask(s.taskId)
                return (
                  <tr key={s.id}>
                    <td>
                      {task ? (
                        <Link to={`/tasks/${task.id}`} style={{ color: 'var(--unity)', fontWeight: 600 }}>
                          {task.title}
                        </Link>
                      ) : (
                        s.taskId
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {formatDate(s.submittedAt, true)}
                      </div>
                    </td>
                    <td>{getOfficer(s.officerId)?.name || s.officerId}</td>
                    <td>
                      <div>{s.content}</div>
                      {s.reviewNote && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--warning)', marginTop: 4 }}>
                          Nota: {s.reviewNote}
                        </div>
                      )}
                    </td>
                    <td>{s.files.join(', ') || '—'}</td>
                    <td><StatusBadge value={s.status} /></td>
                    <td style={{ minWidth: 220 }}>
                      {(s.status === 'dihantar' || s.status === 'semakan semula') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <input
                            className="search-input"
                            placeholder="Nota semakan (pilihan)"
                            value={note[s.id] || ''}
                            onChange={(e) => setNote({ ...note, [s.id]: e.target.value })}
                          />
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => reviewSubmission(s.id, 'diterima', note[s.id])}
                            >
                              Terima
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() =>
                                reviewSubmission(s.id, 'semakan semula', note[s.id] || 'Sila semak semula.')
                              }
                            >
                              Semak semula
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                reviewSubmission(s.id, 'ditolak', note[s.id] || 'Serahan ditolak.')
                              }
                            >
                              Tolak
                            </button>
                          </div>
                        </div>
                      )}
                      {s.status === 'diterima' && <span style={{ color: 'var(--success)' }}>Selesai</span>}
                      {s.status === 'ditolak' && <span style={{ color: 'var(--danger)' }}>Ditolak</span>}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">Tiada serahan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
