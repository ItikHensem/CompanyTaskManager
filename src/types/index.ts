export type OfficerType = 'dalam' | 'luar'
export type OfficerStatus = 'aktif' | 'tidak aktif'
export type TaskPriority = 'tinggi' | 'sederhana' | 'rendah'
export type TaskStatus = 'baru' | 'sedang berjalan' | 'menunggu semakan' | 'selesai' | 'tertunda'
export type SubmissionStatus = 'dihantar' | 'diterima' | 'ditolak' | 'semakan semula'
export type UserRole = 'admin' | 'pegawai'
export type Recurrence = 'tiada' | 'bulanan'

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  uploadedAt: string
}

export interface Officer {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  type: OfficerType
  status: OfficerStatus
  avatar?: string
  location: string
  negeri: string
  joinedAt: string
}

export interface TaskComment {
  id: string
  taskId: string
  authorId: string
  authorName: string
  message: string
  createdAt: string
}

export interface TimelineEvent {
  id: string
  taskId: string
  label: string
  detail?: string
  at: string
  by: string
}

export interface CheckIn {
  id: string
  taskId: string
  officerId: string
  officerName: string
  note?: string
  at: string
  lat?: number
  lng?: number
}

export interface AuditLog {
  id: string
  action: string
  detail: string
  actorId: string
  actorName: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string[]
  assignedBy: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  createdAt: string
  category: string
  location?: string
  negeri?: string
  recurrence: Recurrence
  attachments?: FileAttachment[]
  comments: TaskComment[]
  timeline: TimelineEvent[]
  checkIns: CheckIn[]
}

export interface Submission {
  id: string
  taskId: string
  officerId: string
  content: string
  files: string[]
  attachments: FileAttachment[]
  status: SubmissionStatus
  submittedAt: string
  reviewedAt?: string
  reviewNote?: string
}

export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'tugasan' | 'serahan' | 'sistem' | 'peringatan'
  read: boolean
  createdAt: string
  link?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  avatar?: string
  role: UserRole
  officerId?: string
}

export interface AppSettings {
  language: 'ms' | 'en'
  emailNotify: boolean
  pushNotify: boolean
  darkMode: boolean
  defaultPriority: TaskPriority
  itemsPerPage: number
  reminderDays: number[]
}
