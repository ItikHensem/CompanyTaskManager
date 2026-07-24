import type { FormEvent } from 'react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'

export function ChangePassword() {
  const { changePassword } = useApp()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (next !== confirm) {
      setMsg({ type: 'error', text: 'Pengesahan kata laluan tidak sepadan.' })
      return
    }
    const result = changePassword(current, next)
    setMsg({ type: result.ok ? 'success' : 'error', text: result.message })
    if (result.ok) {
      setCurrent('')
      setNext('')
      setConfirm('')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Tukar Kata Laluan</h1>
          <p>Kemaskini kata laluan akaun anda dengan selamat.</p>
        </div>
      </div>

      <form className="panel" style={{ maxWidth: 480 }} onSubmit={onSubmit}>
        {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="field">
            <label>Kata laluan semasa</label>
            <input
              required
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="TaskEmployee@2026"
            />
          </div>
          <div className="field">
            <label>Kata laluan baharu</label>
            <input required type="password" value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div className="field">
            <label>Sahkan kata laluan baharu</label>
            <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">Kemas Kini</button>
        </div>
      </form>
    </div>
  )
}
