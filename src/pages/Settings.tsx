import type { FormEvent } from 'react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { TaskPriority } from '../types'

export function Settings() {
  const { settings, updateSettings } = useApp()
  const [form, setForm] = useState(settings)
  const [msg, setMsg] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    updateSettings(form)
    setMsg('Tetapan berjaya disimpan.')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Tetapan</h1>
          <p>Konfigurasi aplikasi TaskEmployee.</p>
        </div>
      </div>

      <form className="panel" style={{ maxWidth: 640 }} onSubmit={onSubmit}>
        {msg && <div className="alert success">{msg}</div>}
        <div className="form-grid">
          <div className="field">
            <label>Bahasa</label>
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value as 'ms' | 'en' })}
            >
              <option value="ms">Bahasa Melayu</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="field">
            <label>Keutamaan lalai</label>
            <select
              value={form.defaultPriority}
              onChange={(e) => setForm({ ...form, defaultPriority: e.target.value as TaskPriority })}
            >
              <option value="tinggi">Tinggi</option>
              <option value="sederhana">Sederhana</option>
              <option value="rendah">Rendah</option>
            </select>
          </div>
          <div className="field">
            <label>Item setiap halaman</label>
            <select
              value={form.itemsPerPage}
              onChange={(e) => setForm({ ...form, itemsPerPage: Number(e.target.value) })}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="field">
            <label>Notifikasi e-mel</label>
            <select
              value={form.emailNotify ? 'ya' : 'tidak'}
              onChange={(e) => setForm({ ...form, emailNotify: e.target.value === 'ya' })}
            >
              <option value="ya">Ya</option>
              <option value="tidak">Tidak</option>
            </select>
          </div>
          <div className="field">
            <label>Notifikasi push</label>
            <select
              value={form.pushNotify ? 'ya' : 'tidak'}
              onChange={(e) => setForm({ ...form, pushNotify: e.target.value === 'ya' })}
            >
              <option value="ya">Ya</option>
              <option value="tidak">Tidak</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">Simpan Tetapan</button>
        </div>
      </form>
    </div>
  )
}
