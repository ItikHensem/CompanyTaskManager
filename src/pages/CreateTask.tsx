import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { TaskPriority } from '../types'

export function CreateTask() {
  const { officers, addTask, profile, settings } = useApp()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Program')
  const [priority, setPriority] = useState<TaskPriority>(settings.defaultPriority)
  const [dueDate, setDueDate] = useState('')
  const [location, setLocation] = useState('')
  const [assignedTo, setAssignedTo] = useState<string[]>([])
  const [filterType, setFilterType] = useState<'semua' | 'dalam' | 'luar'>('semua')
  const [done, setDone] = useState(false)

  const visibleOfficers = officers.filter(
    (o) => o.status === 'aktif' && (filterType === 'semua' || o.type === filterType),
  )

  function toggleOfficer(id: string) {
    setAssignedTo((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (assignedTo.length === 0) {
      alert('Sila pilih sekurang-kurangnya seorang pegawai.')
      return
    }
    const task = addTask({
      title,
      description,
      category,
      priority,
      dueDate,
      location: location || undefined,
      assignedTo,
      assignedBy: profile.id,
    })
    setDone(true)
    setTimeout(() => navigate(`/tasks/${task.id}`), 700)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Cipta Tugasan</h1>
          <p>Agihkan tugasan baharu kepada pegawai dalam atau luar.</p>
        </div>
      </div>

      <form className="panel" onSubmit={onSubmit} style={{ maxWidth: 860 }}>
        {done && <div className="alert success">Tugasan berjaya dicipta. Mengalihkan...</div>}

        <div className="form-grid">
          <div className="field full">
            <label>Tajuk tugasan</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Program Dialog Perpaduan" />
          </div>
          <div className="field full">
            <label>Penerangan</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Terangkan skop, jangkaan hasil dan arahan khas..." />
          </div>
          <div className="field">
            <label>Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Program</option>
              <option>Laporan</option>
              <option>Lawatan</option>
              <option>Pentadbiran</option>
              <option>Komunikasi</option>
              <option>Audit</option>
              <option>Lain-lain</option>
            </select>
          </div>
          <div className="field">
            <label>Keutamaan</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              <option value="tinggi">Tinggi</option>
              <option value="sederhana">Sederhana</option>
              <option value="rendah">Rendah</option>
            </select>
          </div>
          <div className="field">
            <label>Tarikh akhir</label>
            <input required type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Lokasi (pilihan)</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Putrajaya" />
          </div>
          <div className="field full">
            <label>Tugaskan kepada</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {(['semua', 'dalam', 'luar'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn btn-sm ${filterType === t ? 'btn-secondary' : 'btn-ghost'}`}
                  onClick={() => setFilterType(t)}
                >
                  {t === 'semua' ? 'Semua' : t === 'dalam' ? 'Pegawai Dalam' : 'Pegawai Luar'}
                </button>
              ))}
            </div>
            <div className="checkbox-list">
              {visibleOfficers.map((o) => (
                <label key={o.id}>
                  <input
                    type="checkbox"
                    checked={assignedTo.includes(o.id)}
                    onChange={() => toggleOfficer(o.id)}
                  />
                  <span>
                    {o.name}
                    <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}> ({o.type})</span>
                  </span>
                </label>
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
              {assignedTo.length} pegawai dipilih
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/tasks')}>Batal</button>
          <button type="submit" className="btn btn-primary">Cipta & Agihkan</button>
        </div>
      </form>
    </div>
  )
}
