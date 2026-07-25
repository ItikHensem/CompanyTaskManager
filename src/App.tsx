import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Officers } from './pages/Officers'
import { Tasks } from './pages/Tasks'
import { CreateTask } from './pages/CreateTask'
import { TaskDetail } from './pages/TaskDetail'
import { Submissions } from './pages/Submissions'
import { CalendarPage } from './pages/Calendar'
import { Reports } from './pages/Reports'
import { Notifications } from './pages/Notifications'
import { Settings } from './pages/Settings'
import { Profile } from './pages/Profile'
import { ChangePassword } from './pages/ChangePassword'
import { Login } from './pages/Login'
import { MapPage } from './pages/MapPage'
import { AuditLogPage } from './pages/AuditLogPage'
import { CheckInPage } from './pages/CheckInPage'

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useApp()
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function AuthedApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('taskemployee-auth') === '1')

  if (!authed) {
    return <Login onLogin={() => setAuthed(true)} />
  }

  return (
    <Routes>
      <Route path="checkin/:taskId" element={<CheckInPage />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="officers" element={<AdminOnly><Officers /></AdminOnly>} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/create" element={<AdminOnly><CreateTask /></AdminOnly>} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="map" element={<AdminOnly><MapPage /></AdminOnly>} />
        <Route path="reports" element={<AdminOnly><Reports /></AdminOnly>} />
        <Route path="audit" element={<AdminOnly><AuditLogPage /></AdminOnly>} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthedApp />
      </AppProvider>
    </BrowserRouter>
  )
}
