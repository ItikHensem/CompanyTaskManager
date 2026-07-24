import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  currentUser as seedUser,
  defaultSettings,
  seedNotifications,
  seedOfficers,
  seedSubmissions,
  seedTasks,
} from '../data/seed'
import type {
  AppNotification,
  AppSettings,
  Officer,
  Submission,
  SubmissionStatus,
  Task,
  TaskStatus,
  UserProfile,
} from '../types'

const STORAGE_KEY = 'taskemployee-data-v1'

interface StoredState {
  officers: Officer[]
  tasks: Task[]
  submissions: Submission[]
  notifications: AppNotification[]
  profile: UserProfile
  settings: AppSettings
  password: string
}

interface AppContextValue {
  officers: Officer[]
  tasks: Task[]
  submissions: Submission[]
  notifications: AppNotification[]
  profile: UserProfile
  settings: AppSettings
  unreadCount: number
  addOfficer: (officer: Omit<Officer, 'id'>) => void
  updateOfficer: (id: string, data: Partial<Officer>) => void
  deleteOfficer: (id: string) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => Task
  updateTaskStatus: (id: string, status: TaskStatus) => void
  updateTask: (id: string, data: Partial<Task>) => void
  addSubmission: (
    data: Omit<Submission, 'id' | 'submittedAt' | 'status'>,
  ) => void
  reviewSubmission: (
    id: string,
    status: SubmissionStatus,
    reviewNote?: string,
  ) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  updateProfile: (data: Partial<UserProfile>) => void
  updateSettings: (data: Partial<AppSettings>) => void
  changePassword: (current: string, next: string) => { ok: boolean; message: string }
  getOfficer: (id: string) => Officer | undefined
  getTask: (id: string) => Task | undefined
}

const AppContext = createContext<AppContextValue | null>(null)

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as StoredState
  } catch {
    /* ignore */
  }
  return {
    officers: seedOfficers,
    tasks: seedTasks,
    submissions: seedSubmissions,
    notifications: seedNotifications,
    profile: seedUser,
    settings: defaultSettings,
    password: 'TaskEmployee@2026',
  }
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(() => loadState())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const unreadCount = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications],
  )

  const addOfficer = useCallback((officer: Omit<Officer, 'id'>) => {
    setState((s) => ({
      ...s,
      officers: [...s.officers, { ...officer, id: uid('o') }],
    }))
  }, [])

  const updateOfficer = useCallback((id: string, data: Partial<Officer>) => {
    setState((s) => ({
      ...s,
      officers: s.officers.map((o) => (o.id === id ? { ...o, ...data } : o)),
    }))
  }, [])

  const deleteOfficer = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      officers: s.officers.filter((o) => o.id !== id),
    }))
  }, [])

  const addTask = useCallback(
    (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
      const newTask: Task = {
        ...task,
        id: uid('t'),
        createdAt: new Date().toISOString().slice(0, 10),
        status: 'baru',
      }
      setState((s) => ({
        ...s,
        tasks: [newTask, ...s.tasks],
        notifications: [
          {
            id: uid('n'),
            title: 'Tugasan baharu dicipta',
            message: `${newTask.title} telah dicipta dan diassign.`,
            type: 'tugasan',
            read: false,
            createdAt: new Date().toISOString(),
            link: `/tasks/${newTask.id}`,
          },
          ...s.notifications,
        ],
      }))
      return newTask
    },
    [],
  )

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }))
  }, [])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }))
  }, [])

  const addSubmission = useCallback(
    (data: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => {
      setState((s) => ({
        ...s,
        submissions: [
          {
            ...data,
            id: uid('s'),
            submittedAt: new Date().toISOString(),
            status: 'dihantar',
          },
          ...s.submissions,
        ],
        tasks: s.tasks.map((t) =>
          t.id === data.taskId ? { ...t, status: 'menunggu semakan' as TaskStatus } : t,
        ),
        notifications: [
          {
            id: uid('n'),
            title: 'Serahan baharu',
            message: 'Satu serahan tugasan baharu menunggu semakan.',
            type: 'serahan',
            read: false,
            createdAt: new Date().toISOString(),
            link: '/submissions',
          },
          ...s.notifications,
        ],
      }))
    },
    [],
  )

  const reviewSubmission = useCallback(
    (id: string, status: SubmissionStatus, reviewNote?: string) => {
      setState((s) => {
        const sub = s.submissions.find((x) => x.id === id)
        return {
          ...s,
          submissions: s.submissions.map((x) =>
            x.id === id
              ? {
                  ...x,
                  status,
                  reviewNote,
                  reviewedAt: new Date().toISOString(),
                }
              : x,
          ),
          tasks:
            sub && status === 'diterima'
              ? s.tasks.map((t) =>
                  t.id === sub.taskId ? { ...t, status: 'selesai' as TaskStatus } : t,
                )
              : s.tasks,
        }
      })
    },
    [],
  )

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }))
  }, [])

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...data } }))
  }, [])

  const updateSettings = useCallback((data: Partial<AppSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...data } }))
  }, [])

  const changePassword = useCallback(
    (current: string, next: string) => {
      if (current !== state.password) {
        return { ok: false, message: 'Kata laluan semasa tidak tepat.' }
      }
      if (next.length < 8) {
        return { ok: false, message: 'Kata laluan baharu mestilah sekurang-kurangnya 8 aksara.' }
      }
      setState((s) => ({ ...s, password: next }))
      return { ok: true, message: 'Kata laluan berjaya dikemas kini.' }
    },
    [state.password],
  )

  const getOfficer = useCallback(
    (id: string) => state.officers.find((o) => o.id === id),
    [state.officers],
  )

  const getTask = useCallback(
    (id: string) => state.tasks.find((t) => t.id === id),
    [state.tasks],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      officers: state.officers,
      tasks: state.tasks,
      submissions: state.submissions,
      notifications: state.notifications,
      profile: state.profile,
      settings: state.settings,
      unreadCount,
      addOfficer,
      updateOfficer,
      deleteOfficer,
      addTask,
      updateTaskStatus,
      updateTask,
      addSubmission,
      reviewSubmission,
      markNotificationRead,
      markAllNotificationsRead,
      updateProfile,
      updateSettings,
      changePassword,
      getOfficer,
      getTask,
    }),
    [
      state,
      unreadCount,
      addOfficer,
      updateOfficer,
      deleteOfficer,
      addTask,
      updateTaskStatus,
      updateTask,
      addSubmission,
      reviewSubmission,
      markNotificationRead,
      markAllNotificationsRead,
      updateProfile,
      updateSettings,
      changePassword,
      getOfficer,
      getTask,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp mesti digunakan dalam AppProvider')
  return ctx
}
