import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatDate, StatusBadge } from '../components/ui'
import type { TaskStatus } from '../types'

export function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTask, getOfficer, updateTaskStatus, submissions, addSubmission, officers, profile } =
    useApp()
  const task = id ? getTask(id) : undefined
  const [content, setContent] = useState('')
  const [files, setFiles] = useState('')
  const [msg, setMsg] = useState('')

  if (!task) {
    return (
      <div className="panel">
        <div className="empty">Tugasan tidak dijumpai.</div>
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/tasks')}>
          Kembali
        </button>
      </div>
    )
  }

  const taskSubs = submissions.filter((s) => s.taskId === task.id)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const officerId =
      task!.assignedTo.find((oid) => officers.some((o) => o.id === oid)) || profile.id
    addSubmission({
      taskId: task!.id,
      officerId,
      content,
      files: files
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
    })
    setContent('')
    setFiles('')
    setMsg('Serahan berjaya dihantar.')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{task.title}</h1>
          <p>{task.description}</p>
        </div>
        <Link to="/tasks" className="btn btn-ghost">Kembali</Link>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title"><h2>Maklumat Tugasan</h2></div>
          <div className="form-grid">
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Status</div>
              <StatusBadge value={task.status} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Keutamaan</div>
              <StatusBadge value={task.priority} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Kategori</div>
              <strong>{task.category}</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Tarikh akhir</div>
              <strong>{formatDate(task.dueDate)}</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Dicipta</div>
              <strong>{formatDate(task.createdAt)}</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Lokasi</div>
              <strong>{task.location || '—'}</strong>
            </div>
            <div className="full">
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 6 }}>Ditugaskan kepada</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {task.assignedTo.map((oid) => (
                  <span key={oid} className="badge info">{getOfficer(oid)?.name || oid}</span>
                ))}
              </div>
            </div>
            <div className="full field">
              <label>Kemas kini status</label>
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
              >
                <option value="baru">Baru</option>
                <option value="sedang berjalan">Sedang berjalan</option>
                <option value="menunggu semakan">Menunggu semakan</option>
                <option value="selesai">Selesai</option>
                <option value="tertunda">Tertunda</option>
              </select>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title"><h2>Hantar Serahan</h2></div>
          {msg && <div className="alert success">{msg}</div>}
          <form onSubmit={onSubmit} className="form-grid">
            <div className="field full">
              <label>Catatan serahan</label>
              <textarea required value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className="field full">
              <label>Nama fail (pisahkan dengan koma)</label>
              <input
                value={files}
                onChange={(e) => setFiles(e.target.value)}
                placeholder="Laporan.pdf, Foto.zip"
              />
            </div>
            <div className="full" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">Hantar Serahan</button>
            </div>
          </form>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '1rem' }}>
        <div className="panel-title"><h2>Sejarah Serahan</h2></div>
        {taskSubs.length === 0 ? (
          <div className="empty">Belum ada serahan untuk tugasan ini.</div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Pegawai</th>
                  <th>Catatan</th>
                  <th>Fail</th>
                  <th>Status</th>
                  <th>Dihantar</th>
                </tr>
              </thead>
              <tbody>
                {taskSubs.map((s) => (
                  <tr key={s.id}>
                    <td>{getOfficer(s.officerId)?.name || s.officerId}</td>
                    <td>{s.content}</td>
                    <td>{s.files.join(', ') || '—'}</td>
                    <td><StatusBadge value={s.status} /></td>
                    <td>{formatDate(s.submittedAt, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
