import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatDate } from '../components/ui'

export function AuditLogPage() {
  const { auditLogs } = useApp()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return auditLogs.filter(
      (a) =>
        !query ||
        `${a.action} ${a.detail} ${a.actorName}`.toLowerCase().includes(query),
    )
  }, [auditLogs, q])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Audit Log</h1>
          <p>Rekod siapa buat apa dalam sistem (penting untuk jabatan kerajaan).</p>
        </div>
      </div>

      <div className="panel">
        <div className="filters">
          <input
            className="search-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Cari tindakan, pengguna..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Masa</th>
                <th>Tindakan</th>
                <th>Butiran</th>
                <th>Pengguna</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{formatDate(a.createdAt, true)}</td>
                  <td><span className="badge sistem">{a.action}</span></td>
                  <td>{a.detail}</td>
                  <td>{a.actorName}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="empty">Tiada rekod.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
