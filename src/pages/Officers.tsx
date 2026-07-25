import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { NEGERI_LIST } from '../data/seed'
import { formatDate, StatusBadge } from '../components/ui'
import type { Officer, OfficerStatus, OfficerType } from '../types'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  type: 'dalam' as OfficerType,
  status: 'aktif' as OfficerStatus,
  location: '',
  negeri: 'WP Putrajaya',
  joinedAt: new Date().toISOString().slice(0, 10),
}

export function Officers() {
  const { officers, addOfficer, updateOfficer, deleteOfficer } = useApp()
  const [q, setQ] = useState('')
  const [type, setType] = useState<'semua' | OfficerType>('semua')
  const [negeri, setNegeri] = useState('semua')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return officers.filter((o) => {
      const matchQ =
        !q ||
        `${o.name} ${o.email} ${o.department} ${o.location} ${o.negeri}`
          .toLowerCase()
          .includes(q.toLowerCase())
      const matchType = type === 'semua' || o.type === type
      const matchN = negeri === 'semua' || o.negeri === negeri
      return matchQ && matchType && matchN
    })
  }, [officers, q, type, negeri])

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(o: Officer) {
    setEditId(o.id)
    setForm({
      name: o.name,
      email: o.email,
      phone: o.phone,
      department: o.department,
      position: o.position,
      type: o.type,
      status: o.status,
      location: o.location,
      negeri: o.negeri,
      joinedAt: o.joinedAt,
    })
    setShowForm(true)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (editId) updateOfficer(editId, form)
    else addOfficer(form)
    setShowForm(false)
    setForm(emptyForm)
    setEditId(null)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Pegawai</h1>
          <p>Urus senarai pegawai dalam/luar mengikut negeri & daerah.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Tambah Pegawai
        </button>
      </div>

      <div className="panel">
        <div className="filters">
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }} />
            <input
              className="search-input"
              style={{ width: '100%', paddingLeft: 36 }}
              placeholder="Cari nama, e-mel, jabatan, negeri..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            <option value="semua">Semua jenis</option>
            <option value="dalam">Pegawai Dalam</option>
            <option value="luar">Pegawai Luar</option>
          </select>
          <select value={negeri} onChange={(e) => setNegeri(e.target.value)}>
            <option value="semua">Semua negeri</option>
            {NEGERI_LIST.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Jenis</th>
                <th>Negeri</th>
                <th>Jabatan</th>
                <th>Status</th>
                <th>Sertai</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{o.email}</div>
                  </td>
                  <td><StatusBadge value={o.type} /></td>
                  <td>{o.negeri}</td>
                  <td>
                    <div>{o.department}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{o.location}</div>
                  </td>
                  <td><StatusBadge value={o.status} /></td>
                  <td>{formatDate(o.joinedAt)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(o)}>Edit</button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        if (confirm(`Padam pegawai ${o.name}?`)) deleteOfficer(o.id)
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="empty">Tiada pegawai dijumpai.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="overlay show" style={{ display: 'grid', placeItems: 'center', zIndex: 40 }} onClick={() => setShowForm(false)}>
          <form
            className="panel"
            style={{ width: 'min(640px, 94vw)', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={onSubmit}
          >
            <div className="panel-title"><h2>{editId ? 'Edit Pegawai' : 'Tambah Pegawai'}</h2></div>
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
                <label>Jabatan</label>
                <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="field">
                <label>Jawatan</label>
                <input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </div>
              <div className="field">
                <label>Jenis</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as OfficerType })}>
                  <option value="dalam">Dalam</option>
                  <option value="luar">Luar</option>
                </select>
              </div>
              <div className="field">
                <label>Negeri</label>
                <select value={form.negeri} onChange={(e) => setForm({ ...form, negeri: e.target.value })}>
                  {NEGERI_LIST.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as OfficerStatus })}>
                  <option value="aktif">Aktif</option>
                  <option value="tidak aktif">Tidak aktif</option>
                </select>
              </div>
              <div className="field">
                <label>Lokasi</label>
                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="field">
                <label>Tarikh sertai</label>
                <input type="date" required value={form.joinedAt} onChange={(e) => setForm({ ...form, joinedAt: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">{editId ? 'Simpan' : 'Tambah'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
