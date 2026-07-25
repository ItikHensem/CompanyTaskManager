import type { FormEvent } from 'react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { TaskPriority } from '../types'

export function Settings() {
  const { settings, updateSettings, runDueReminders } = useApp()
  const [form, setForm] = useState(settings)
  const [msg, setMsg] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    updateSettings(form)
    const n = runDueReminders()
    setMsg(`Tetapan disimpan.${n ? ` ${n} peringatan baharu dijana.` : ''}`)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Tetapan</h1>
          <p>Konfigurasi aplikasi TaskEmployee termasuk dark mode & peringatan.</p>
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
            <label>Mod gelap</label>
            <select
              value={form.darkMode ? 'ya' : 'tidak'}
              onChange={(e) => setForm({ ...form, darkMode: e.target.value === 'ya' })}
            >
              <option value="tidak">Tidak</option>
              <option value="ya">Ya</option>
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
            <label>Peringatan (hari sebelum due)</label>
            <select
              value={(form.reminderDays || [1, 3]).join(',')}
              onChange={(e) =>
                setForm({
                  ...form,
                  reminderDays: e.target.value.split(',').map((x) => Number(x)),
                })
              }
            >
              <option value="1,3">1 & 3 hari</option>
              <option value="1">1 hari sahaja</option>
              <option value="1,3,7">1, 3 & 7 hari</option>
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
