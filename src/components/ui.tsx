import { format, parseISO } from 'date-fns'
import { ms } from 'date-fns/locale'

export function formatDate(value?: string, withTime = false) {
  if (!value) return '—'
  try {
    const d = parseISO(value)
    return format(d, withTime ? 'd MMM yyyy, HH:mm' : 'd MMM yyyy', { locale: ms })
  } catch {
    return value
  }
}

export function StatusBadge({ value }: { value: string }) {
  const cls = value.replace(/\s+/g, '-')
  return <span className={`badge ${cls}`}>{value}</span>
}
