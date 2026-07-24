import type { FormEvent } from 'react'
import { useState } from 'react'
import { APP_NAME, ORG_FULL, ORG_NAME } from '../data/seed'

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('example@perpaduan.gov.my')
  const [password, setPassword] = useState('TaskEmployee@2026')
  const [error, setError] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.endsWith('@perpaduan.gov.my') && email !== 'example@perpaduan.gov.my') {
      setError('Gunakan e-mel rasmi @perpaduan.gov.my')
      return
    }
    if (password.length < 6) {
      setError('Kata laluan tidak sah.')
      return
    }
    sessionStorage.setItem('taskemployee-auth', '1')
    onLogin()
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <div className="logo-row">
          <img src="/Logo-Kerajaan.png" alt="Logo Kerajaan" />
          <div>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {ORG_NAME}
            </div>
            <h1>{APP_NAME}</h1>
          </div>
        </div>
        <p className="sub">{ORG_FULL} — Sistem Agihan Tugasan Pegawai Dalam & Luar</p>
        {error && <div className="alert error">{error}</div>}
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="field">
            <label>E-mel</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Kata laluan</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          Log Masuk
        </button>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.85rem', textAlign: 'center' }}>
          Demo: example@perpaduan.gov.my / TaskEmployee@2026
        </p>
      </form>
    </div>
  )
}
