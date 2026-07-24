export type OfficerType = 'dalam' | 'luar'
export type OfficerStatus = 'aktif' | 'tidak aktif'
export type TaskPriority = 'tinggi' | 'sederhana' | 'rendah'
export type TaskStatus = 'baru' | 'sedang berjalan' | 'menunggu semakan' | 'selesai' | 'tertunda'
export type SubmissionStatus = 'dihantar' | 'diterima' | 'ditolak' | 'semakan semula'

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
  joinedAt: string
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
  attachments?: string[]
}

export interface Submission {
  id: string
  taskId: string
  officerId: string
  content: string
  files: string[]
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
  role: 'admin' | 'pengurus' | 'pegawai'
}

export interface AppSettings {
  language: 'ms' | 'en'
  emailNotify: boolean
  pushNotify: boolean
  darkMode: boolean
  defaultPriority: TaskPriority
  itemsPerPage: number
}
