import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function CheckInPage() {
  const { taskId } = useParams()
  const { getTask, addCheckIn, profile } = useApp()
  const navigate = useNavigate()
  const task = taskId ? getTask(taskId) : undefined
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  if (!task) {
    return (
      <div className="page">
        <div className="panel empty">Tugasan tidak dijumpai untuk check-in.</div>
        <Link to="/" className="btn btn-ghost">Kembali</Link>
      </div>
    )
  }

  function getLocation() {
    setErr('')
    if (!navigator.geolocation) {
      setErr('Geolocation tidak disokong pada peranti ini.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setErr('Gagal dapatkan lokasi. Anda masih boleh check-in tanpa GPS.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    addCheckIn(task!.id, note || `Check-in oleh ${profile.name}`, coords || undefined)
    setMsg('Check-in berjaya direkod!')
    setTimeout(() => navigate(`/tasks/${task!.id}`), 900)
  }

  return (
    <div className="page" style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="panel">
        <div className="panel-title"><h2>QR Check-in Lawatan</h2></div>
        <p style={{ marginTop: 0, color: 'var(--muted)' }}>{task.title}</p>
        {msg && <div className="alert success">{msg}</div>}
        {err && <div className="alert error">{err}</div>}
        <form onSubmit={onSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="field">
            <label>Nota (pilihan)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Tiba di sekolah..." />
          </div>
          <div className="field">
            <label>Lokasi GPS</label>
            <button type="button" className="btn btn-ghost" onClick={getLocation}>Ambil Lokasi Semasa</button>
            {coords && (
              <div style={{ fontSize: '0.82rem', color: 'var(--unity)', marginTop: 6 }}>
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary">Sahkan Check-in</button>
        </form>
      </div>
    </div>
  )
}
