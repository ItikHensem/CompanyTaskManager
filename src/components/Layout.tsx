import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { GlobalSearch } from './GlobalSearch'

export function Layout() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="app-shell">
      <div
        className={`overlay ${open ? 'show' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="main-area">
        <Topbar onMenu={() => setOpen(true)} onSearch={() => setSearchOpen(true)} />
        <main className="page">
          <Outlet />
        </main>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
