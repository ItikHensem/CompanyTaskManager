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
  seedAuditLogs,
  seedNotifications,
  seedOfficers,
  seedSubmissions,
  seedTasks,
} from '../data/seed'
import type {
  AppNotification,
  AppSettings,
  AuditLog,
  CheckIn,
  FileAttachment,
  Officer,
  Submission,
  SubmissionStatus,
  Task,
  TaskComment,
  TaskStatus,
  UserProfile,
} from '../types'
import { daysUntil, uid } from '../utils/files'

const STORAGE_KEY = 'taskemployee-data-v2'

interface StoredState {
  officers: Officer[]
  tasks: Task[]
  submissions: Submission[]
  notifications: AppNotification[]
  profile: UserProfile
  settings: AppSettings
  password: string
  auditLogs: AuditLog[]
}

interface AppContextValue {
  officers: Officer[]
  tasks: Task[]
  myTasks: Task[]
  submissions: Submission[]
  notifications: AppNotification[]
  profile: UserProfile
  settings: AppSettings
  auditLogs: AuditLog[]
  unreadCount: number
  isAdmin: boolean
  addOfficer: (officer: Omit<Officer, 'id'>) => void
  updateOfficer: (id: string, data: Partial<Officer>) => void
  deleteOfficer: (id: string) => void
  addTask: (
    task: Omit<Task, 'id' | 'createdAt' | 'status' | 'comments' | 'timeline' | 'checkIns'>,
  ) => Task
  updateTaskStatus: (id: string, status: TaskStatus) => void
  updateTask: (id: string, data: Partial<Task>) => void
  addSubmission: (
    data: Omit<Submission, 'id' | 'submittedAt' | 'status'> & {
      attachments?: FileAttachment[]
    },
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
  loginAs: (email: string) => { ok: boolean; message: string; profile?: UserProfile }
  logout: () => void
  addComment: (taskId: string, message: string) => void
  addCheckIn: (taskId: string, note?: string, coords?: { lat: number; lng: number }) => void
  generateRecurringTask: (taskId: string) => Task | null
  addAudit: (action: string, detail: string) => void
  runDueReminders: () => number
  visibleTasks: Task[]
  visibleSubmissions: Submission[]
}

const AppContext = createContext<AppContextValue | null>(null)

function defaultState(): StoredState {
  return {
    officers: seedOfficers,
    tasks: seedTasks,
    submissions: seedSubmissions,
    notifications: seedNotifications,
    profile: seedUser,
    settings: defaultSettings,
    password: 'TaskEmployee@2026',
    auditLogs: seedAuditLogs,
  }
}

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState
      return {
        ...defaultState(),
        ...parsed,
        settings: { ...defaultSettings, ...parsed.settings },
        profile: { ...seedUser, ...parsed.profile },
      }
    }
  } catch {
    /* ignore */
  }
  return defaultState()
}

function actor(profile: UserProfile) {
  return { id: profile.id, name: profile.name }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(() => loadState())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.darkMode ? 'dark' : 'light'
  }, [state.settings.darkMode])

  const isAdmin = state.profile.role === 'admin'

  const myTasks = useMemo(() => {
    if (isAdmin) return state.tasks
    const oid = state.profile.officerId
    if (!oid) return []
    return state.tasks.filter((t) => t.assignedTo.includes(oid))
  }, [isAdmin, state.profile.officerId, state.tasks])

  const visibleTasks = myTasks

  const visibleSubmissions = useMemo(() => {
    if (isAdmin) return state.submissions
    const oid = state.profile.officerId
    if (!oid) return []
    return state.submissions.filter((s) => s.officerId === oid)
  }, [isAdmin, state.profile.officerId, state.submissions])

  const unreadCount = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications],
  )

  const addAudit = useCallback((action: string, detail: string) => {
    setState((s) => {
      const a = actor(s.profile)
      return {
        ...s,
        auditLogs: [
          {
            id: uid('a'),
            action,
            detail,
            actorId: a.id,
            actorName: a.name,
            createdAt: new Date().toISOString(),
          },
          ...s.auditLogs,
        ].slice(0, 300),
      }
    })
  }, [])

  const loginAs = useCallback((email: string) => {
    const normalized = email.trim().toLowerCase()
    if (normalized === seedUser.email.toLowerCase() || normalized === 'admin@perpaduan.gov.my') {
      setState((s) => ({
        ...s,
        profile: { ...seedUser },
        auditLogs: [
          {
            id: uid('a'),
            action: 'LOGIN',
            detail: 'Admin log masuk',
            actorId: seedUser.id,
            actorName: seedUser.name,
            createdAt: new Date().toISOString(),
          },
          ...s.auditLogs,
        ],
      }))
      sessionStorage.setItem('taskemployee-auth', '1')
      return { ok: true, message: 'Log masuk sebagai Admin', profile: seedUser }
    }

    const fromState = state.officers.find((o) => o.email.toLowerCase() === normalized)
    const matched = fromState || seedOfficers.find((o) => o.email.toLowerCase() === normalized)
    if (!matched) {
      return { ok: false, message: 'E-mel tidak dijumpai. Cuba e-mel admin atau pegawai demo.' }
    }

    const profile: UserProfile = {
      id: `u-${matched.id}`,
      name: matched.name,
      email: matched.email,
      phone: matched.phone,
      position: matched.position,
      department: matched.department,
      role: 'pegawai',
      officerId: matched.id,
    }
    setState((s) => ({
      ...s,
      profile,
      auditLogs: [
        {
          id: uid('a'),
          action: 'LOGIN',
          detail: `Pegawai log masuk (${matched.email})`,
          actorId: profile.id,
          actorName: profile.name,
          createdAt: new Date().toISOString(),
        },
        ...s.auditLogs,
      ],
    }))
    sessionStorage.setItem('taskemployee-auth', '1')
    return { ok: true, message: 'Log masuk sebagai Pegawai', profile }
  }, [state.officers])

  const logout = useCallback(() => {
    sessionStorage.removeItem('taskemployee-auth')
    addAudit('LOGOUT', 'Pengguna log keluar')
  }, [addAudit])

  const addOfficer = useCallback((officer: Omit<Officer, 'id'>) => {
    const id = uid('o')
    setState((s) => ({
      ...s,
      officers: [...s.officers, { ...officer, id }],
      auditLogs: [
        {
          id: uid('a'),
          action: 'TAMBAH_PEGAWAI',
          detail: `Tambah pegawai: ${officer.name}`,
          actorId: s.profile.id,
          actorName: s.profile.name,
          createdAt: new Date().toISOString(),
        },
        ...s.auditLogs,
      ],
    }))
  }, [])

  const updateOfficer = useCallback((id: string, data: Partial<Officer>) => {
    setState((s) => ({
      ...s,
      officers: s.officers.map((o) => (o.id === id ? { ...o, ...data } : o)),
      auditLogs: [
        {
          id: uid('a'),
          action: 'KEMASKINI_PEGAWAI',
          detail: `Kemaskini pegawai ${id}`,
          actorId: s.profile.id,
          actorName: s.profile.name,
          createdAt: new Date().toISOString(),
        },
        ...s.auditLogs,
      ],
    }))
  }, [])

  const deleteOfficer = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      officers: s.officers.filter((o) => o.id !== id),
      auditLogs: [
        {
          id: uid('a'),
          action: 'PADAM_PEGAWAI',
          detail: `Padam pegawai ${id}`,
          actorId: s.profile.id,
          actorName: s.profile.name,
          createdAt: new Date().toISOString(),
        },
        ...s.auditLogs,
      ],
    }))
  }, [])

  const addTask = useCallback(
    (
      task: Omit<Task, 'id' | 'createdAt' | 'status' | 'comments' | 'timeline' | 'checkIns'>,
    ) => {
      const id = uid('t')
      const createdAt = new Date().toISOString()
      const newTask: Task = {
        ...task,
        id,
        createdAt: createdAt.slice(0, 10),
        status: 'baru',
        comments: [],
        checkIns: [],
        timeline: [
          {
            id: uid('tl'),
            taskId: id,
            label: 'Tugasan dicipta',
            at: createdAt,
            by: '',
          },
        ],
      }
      setState((s) => {
        newTask.timeline[0].by = s.profile.name
        return {
          ...s,
          tasks: [newTask, ...s.tasks],
          notifications: [
            {
              id: uid('n'),
              title: 'Tugasan baharu dicipta',
              message: `${newTask.title} telah dicipta dan diassign.`,
              type: 'tugasan',
              read: false,
              createdAt,
              link: `/tasks/${newTask.id}`,
            },
            ...s.notifications,
          ],
          auditLogs: [
            {
              id: uid('a'),
              action: 'CIPTA_TUGASAN',
              detail: `Mencipta tugasan: ${newTask.title}`,
              actorId: s.profile.id,
              actorName: s.profile.name,
              createdAt,
            },
            ...s.auditLogs,
          ],
        }
      })
      return newTask
    },
    [],
  )

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              timeline: [
                ...t.timeline,
                {
                  id: uid('tl'),
                  taskId: id,
                  label: `Status: ${status}`,
                  at: new Date().toISOString(),
                  by: s.profile.name,
                },
              ],
            }
          : t,
      ),
      auditLogs: [
        {
          id: uid('a'),
          action: 'STATUS_TUGASAN',
          detail: `Tugasan ${id} → ${status}`,
          actorId: s.profile.id,
          actorName: s.profile.name,
          createdAt: new Date().toISOString(),
        },
        ...s.auditLogs,
      ],
    }))
  }, [])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }))
  }, [])

  const addSubmission = useCallback(
    (
      data: Omit<Submission, 'id' | 'submittedAt' | 'status'> & {
        attachments?: FileAttachment[]
      },
    ) => {
      setState((s) => ({
        ...s,
        submissions: [
          {
            ...data,
            files: data.files || data.attachments?.map((a) => a.name) || [],
            attachments: data.attachments || [],
            id: uid('s'),
            submittedAt: new Date().toISOString(),
            status: 'dihantar',
          },
          ...s.submissions,
        ],
        tasks: s.tasks.map((t) =>
          t.id === data.taskId
            ? {
                ...t,
                status: 'menunggu semakan' as TaskStatus,
                timeline: [
                  ...t.timeline,
                  {
                    id: uid('tl'),
                    taskId: t.id,
                    label: 'Serahan dihantar',
                    at: new Date().toISOString(),
                    by: s.profile.name,
                  },
                ],
              }
            : t,
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
        auditLogs: [
          {
            id: uid('a'),
            action: 'SERAHAN',
            detail: `Serahan untuk tugasan ${data.taskId}`,
            actorId: s.profile.id,
            actorName: s.profile.name,
            createdAt: new Date().toISOString(),
          },
          ...s.auditLogs,
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
                  t.id === sub.taskId
                    ? {
                        ...t,
                        status: 'selesai' as TaskStatus,
                        timeline: [
                          ...t.timeline,
                          {
                            id: uid('tl'),
                            taskId: t.id,
                            label: 'Serahan diterima / selesai',
                            at: new Date().toISOString(),
                            by: s.profile.name,
                          },
                        ],
                      }
                    : t,
                )
              : s.tasks,
          auditLogs: [
            {
              id: uid('a'),
              action: 'SEMAK_SERAHAN',
              detail: `Serahan ${id} → ${status}`,
              actorId: s.profile.id,
              actorName: s.profile.name,
              createdAt: new Date().toISOString(),
            },
            ...s.auditLogs,
          ],
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
    setState((s) => ({
      ...s,
      settings: { ...s.settings, ...data },
      auditLogs: [
        {
          id: uid('a'),
          action: 'TETAPAN',
          detail: `Kemaskini tetapan: ${Object.keys(data).join(', ')}`,
          actorId: s.profile.id,
          actorName: s.profile.name,
          createdAt: new Date().toISOString(),
        },
        ...s.auditLogs,
      ],
    }))
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

  const addComment = useCallback((taskId: string, message: string) => {
    setState((s) => {
      const comment: TaskComment = {
        id: uid('c'),
        taskId,
        authorId: s.profile.id,
        authorName: s.profile.name,
        message,
        createdAt: new Date().toISOString(),
      }
      return {
        ...s,
        tasks: s.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                comments: [...t.comments, comment],
                timeline: [
                  ...t.timeline,
                  {
                    id: uid('tl'),
                    taskId,
                    label: 'Komen baharu',
                    detail: message.slice(0, 80),
                    at: comment.createdAt,
                    by: s.profile.name,
                  },
                ],
              }
            : t,
        ),
      }
    })
  }, [])

  const addCheckIn = useCallback(
    (taskId: string, note?: string, coords?: { lat: number; lng: number }) => {
      setState((s) => {
        const checkIn: CheckIn = {
          id: uid('ci'),
          taskId,
          officerId: s.profile.officerId || s.profile.id,
          officerName: s.profile.name,
          note,
          at: new Date().toISOString(),
          lat: coords?.lat,
          lng: coords?.lng,
        }
        return {
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checkIns: [...t.checkIns, checkIn],
                  timeline: [
                    ...t.timeline,
                    {
                      id: uid('tl'),
                      taskId,
                      label: 'QR Check-in',
                      detail: note || 'Check-in di lokasi',
                      at: checkIn.at,
                      by: s.profile.name,
                    },
                  ],
                }
              : t,
          ),
          auditLogs: [
            {
              id: uid('a'),
              action: 'CHECKIN',
              detail: `Check-in tugasan ${taskId}`,
              actorId: s.profile.id,
              actorName: s.profile.name,
              createdAt: checkIn.at,
            },
            ...s.auditLogs,
          ],
        }
      })
    },
    [],
  )

  const generateRecurringTask = useCallback((taskId: string) => {
    let created: Task | null = null
    setState((s) => {
      const source = s.tasks.find((t) => t.id === taskId)
      if (!source || source.recurrence !== 'bulanan') return s
      const due = new Date(source.dueDate)
      due.setMonth(due.getMonth() + 1)
      const id = uid('t')
      const now = new Date().toISOString()
      created = {
        ...source,
        id,
        title: source.title,
        dueDate: due.toISOString().slice(0, 10),
        createdAt: now.slice(0, 10),
        status: 'baru',
        comments: [],
        checkIns: [],
        timeline: [
          {
            id: uid('tl'),
            taskId: id,
            label: 'Dijana semula (bulanan)',
            detail: `Dari ${source.id}`,
            at: now,
            by: s.profile.name,
          },
        ],
      }
      return {
        ...s,
        tasks: [created!, ...s.tasks],
        notifications: [
          {
            id: uid('n'),
            title: 'Tugasan bulanan dijana',
            message: `${created!.title} untuk ${created!.dueDate}`,
            type: 'tugasan',
            read: false,
            createdAt: now,
            link: `/tasks/${created!.id}`,
          },
          ...s.notifications,
        ],
        auditLogs: [
          {
            id: uid('a'),
            action: 'ULANG_TUGASAN',
            detail: `Jana semula ${source.id} → ${created!.id}`,
            actorId: s.profile.id,
            actorName: s.profile.name,
            createdAt: now,
          },
          ...s.auditLogs,
        ],
      }
    })
    return created
  }, [])

  const runDueReminders = useCallback(() => {
    let added = 0
    setState((s) => {
      const days = s.settings.reminderDays?.length ? s.settings.reminderDays : [1, 3]
      const existing = new Set(
        s.notifications
          .filter((n) => n.type === 'peringatan')
          .map((n) => `${n.link}|${n.message}`),
      )
      const fresh: AppNotification[] = []
      for (const t of s.tasks) {
        if (t.status === 'selesai') continue
        const d = daysUntil(t.dueDate)
        if (days.includes(d)) {
          const message = `"${t.title}" akan tamat dalam ${d} hari (${t.dueDate}).`
          const key = `/tasks/${t.id}|${message}`
          if (!existing.has(key)) {
            fresh.push({
              id: uid('n'),
              title: d === 1 ? 'Peringatan: 1 hari lagi' : `Peringatan: ${d} hari lagi`,
              message,
              type: 'peringatan',
              read: false,
              createdAt: new Date().toISOString(),
              link: `/tasks/${t.id}`,
            })
            added += 1
          }
        }
      }
      if (!fresh.length) return s
      return { ...s, notifications: [...fresh, ...s.notifications] }
    })
    return added
  }, [])

  // Auto reminders on mount / profile change
  useEffect(() => {
    runDueReminders()
  }, [runDueReminders, state.profile.id])

  const value = useMemo<AppContextValue>(
    () => ({
      officers: state.officers,
      tasks: state.tasks,
      myTasks,
      submissions: state.submissions,
      notifications: state.notifications,
      profile: state.profile,
      settings: state.settings,
      auditLogs: state.auditLogs,
      unreadCount,
      isAdmin,
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
      loginAs,
      logout,
      addComment,
      addCheckIn,
      generateRecurringTask,
      addAudit,
      runDueReminders,
      visibleTasks,
      visibleSubmissions,
    }),
    [
      state,
      myTasks,
      unreadCount,
      isAdmin,
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
      loginAs,
      logout,
      addComment,
      addCheckIn,
      generateRecurringTask,
      addAudit,
      runDueReminders,
      visibleTasks,
      visibleSubmissions,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp mesti digunakan dalam AppProvider')
  return ctx
}
