import type { FileAttachment } from '../types'

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function readFilesAsAttachments(files: FileList | File[], maxBytes = 1_500_000): Promise<FileAttachment[]> {
  const list = Array.from(files)
  return Promise.all(
    list.map(
      (file) =>
        new Promise<FileAttachment>((resolve, reject) => {
          if (file.size > maxBytes) {
            reject(new Error(`Fail "${file.name}" terlalu besar (max ~1.5MB untuk demo).`))
            return
          }
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              id: uid('f'),
              name: file.name,
              type: file.type || 'application/octet-stream',
              size: file.size,
              dataUrl: String(reader.result),
              uploadedAt: new Date().toISOString(),
            })
          }
          reader.onerror = () => reject(new Error(`Gagal baca fail ${file.name}`))
          reader.readAsDataURL(file)
        }),
    ),
  )
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function daysUntil(dateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
