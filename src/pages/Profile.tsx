import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function Profile() {
  const { profile, updateProfile } = useApp()
  const [form, setForm] = useState(profile)
  const [msg, setMsg] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    updateProfile(form)
    setMsg('Profil berjaya dikemas kini.')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Profil</h1>
          <p>Maklumat akaun pengguna TaskEmployee.</p>
        </div>
        <Link to="/change-password" className="btn btn-ghost">Tukar Kata Laluan</Link>
      </div>

      <div className="grid grid-2">
        <div className="panel" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="avatar lg">{initials(form.name)}</div>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
              {form.name}
            </h2>
            <div style={{ color: 'var(--muted)' }}>{form.position}</div>
            <div style={{ color: 'var(--unity)', fontWeight: 600, marginTop: 4 }}>{form.email}</div>
          </div>
        </div>

        <form className="panel" onSubmit={onSubmit}>
          {msg && <div className="alert success">{msg}</div>}
          <div className="form-grid">
            <div className="field full">
              <label>Nama penuh</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>E-mel</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field">
              <label>Telefon</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="field">
              <label>Jawatan</label>
              <input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            </div>
            <div className="field">
              <label>Jabatan</label>
              <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">Simpan Profil</button>
          </div>
        </form>
      </div>
    </div>
  )
}
