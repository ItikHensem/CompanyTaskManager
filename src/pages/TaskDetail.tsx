import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useApp } from '../context/AppContext'
import { formatDate, StatusBadge } from '../components/ui'
import type { TaskStatus } from '../types'
import { formatBytes, readFilesAsAttachments } from '../utils/files'

export function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getTask,
    getOfficer,
    updateTaskStatus,
    submissions,
    addSubmission,
    profile,
    isAdmin,
    addComment,
    generateRecurringTask,
  } = useApp()
  const task = id ? getTask(id) : undefined
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [comment, setComment] = useState('')
  const [showQr, setShowQr] = useState(false)

  const taskSubs = useMemo(
    () => (task ? submissions.filter((s) => s.taskId === task.id) : []),
    [submissions, task],
  )

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

  const checkInUrl = `${window.location.origin}/checkin/${task.id}`

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErr('')
    try {
      const attachments = files ? await readFilesAsAttachments(files) : []
      const officerId =
        profile.officerId ||
        task!.assignedTo[0] ||
        profile.id
      addSubmission({
        taskId: task!.id,
        officerId,
        content,
        files: attachments.map((a) => a.name),
        attachments,
      })
      setContent('')
      setFiles(null)
      setMsg('Serahan berjaya dihantar (termasuk fail).')
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Gagal hantar serahan')
    }
  }

  function onComment(e: FormEvent) {
    e.preventDefault()
    if (!comment.trim() || !task) return
    addComment(task.id, comment.trim())
    setComment('')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{task.title}</h1>
          <p>{task.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setShowQr((v) => !v)}>
            QR Check-in
          </button>
          {isAdmin && task.recurrence === 'bulanan' && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                const t = generateRecurringTask(task.id)
                if (t) navigate(`/tasks/${t.id}`)
              }}
            >
              Jana Bulan Depan
            </button>
          )}
          <Link to="/tasks" className="btn btn-ghost">Kembali</Link>
        </div>
      </div>

      {showQr && (
        <div className="panel" style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <div className="panel-title"><h2>QR Check-in Lawatan</h2></div>
          <QRCodeSVG value={checkInUrl} size={180} />
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
            Imbas atau buka: <Link to={`/checkin/${task.id}`}>{checkInUrl}</Link>
          </p>
        </div>
      )}

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
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Negeri</div>
              <strong>{task.negeri || '—'}</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Ulang</div>
              <strong>{task.recurrence}</strong>
            </div>
            <div className="full">
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 6 }}>Ditugaskan kepada</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {task.assignedTo.map((oid) => (
                  <span key={oid} className="badge info">{getOfficer(oid)?.name || oid}</span>
                ))}
              </div>
            </div>
            {(isAdmin || task.assignedTo.includes(profile.officerId || '')) && (
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
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title"><h2>Hantar Serahan + Fail</h2></div>
          {msg && <div className="alert success">{msg}</div>}
          {err && <div className="alert error">{err}</div>}
          <form onSubmit={onSubmit} className="form-grid">
            <div className="field full">
              <label>Catatan serahan</label>
              <textarea required value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className="field full">
              <label>Muat naik fail (PDF/imej, max ~1.5MB setiap fail)</label>
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.zip"
                onChange={(e) => setFiles(e.target.files)}
              />
            </div>
            <div className="full" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">Hantar Serahan</button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '1rem' }}>
        <div className="panel">
          <div className="panel-title"><h2>Komen / Perbincangan</h2></div>
          <div className="comment-list">
            {task.comments.length === 0 && <div className="empty">Belum ada komen.</div>}
            {task.comments.map((c) => (
              <div key={c.id} className="comment-item">
                <strong>{c.authorName}</strong>
                <time>{formatDate(c.createdAt, true)}</time>
                <p>{c.message}</p>
              </div>
            ))}
          </div>
          <form onSubmit={onComment} style={{ marginTop: '0.75rem', display: 'flex', gap: 8 }}>
            <input
              className="search-input"
              style={{ flex: 1 }}
              placeholder="Tulis komen..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">Hantar</button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-title"><h2>Timeline Status</h2></div>
          <ol className="timeline">
            {[...task.timeline].reverse().map((ev) => (
              <li key={ev.id}>
                <strong>{ev.label}</strong>
                {ev.detail && <div className="muted">{ev.detail}</div>}
                <div className="muted">{ev.by} · {formatDate(ev.at, true)}</div>
              </li>
            ))}
          </ol>
          {task.checkIns.length > 0 && (
            <>
              <h3 style={{ marginTop: '1rem', fontSize: '0.95rem' }}>Check-in</h3>
              {task.checkIns.map((ci) => (
                <div key={ci.id} className="comment-item">
                  <strong>{ci.officerName}</strong>
                  <time>{formatDate(ci.at, true)}</time>
                  <p>{ci.note || 'Check-in'}{ci.lat ? ` (${ci.lat.toFixed(4)}, ${ci.lng?.toFixed(4)})` : ''}</p>
                </div>
              ))}
            </>
          )}
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
                    <td>
                      {(s.attachments?.length ? s.attachments : s.files.map((name) => ({ name, dataUrl: '', size: 0, id: name, type: '', uploadedAt: '' }))).map((f) =>
                        f.dataUrl ? (
                          <div key={f.id || f.name}>
                            <a href={f.dataUrl} download={f.name}>{f.name}</a>
                            {f.size ? <span className="muted"> ({formatBytes(f.size)})</span> : null}
                          </div>
                        ) : (
                          <div key={f.name}>{f.name}</div>
                        ),
                      )}
                    </td>
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
