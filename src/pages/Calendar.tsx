import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ms } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function CalendarPage() {
  const { tasks } = useApp()
  const [cursor, setCursor] = useState(new Date(2026, 6, 1))

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const today = new Date()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Kalendar</h1>
          <p>Jadual tarikh akhir tugasan mengikut bulan.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" className="icon-btn" onClick={() => setCursor(subMonths(cursor, 1))}>
            <ChevronLeft size={18} />
          </button>
          <strong style={{ minWidth: 160, textAlign: 'center', fontFamily: 'var(--font-display)' }}>
            {format(cursor, 'MMMM yyyy', { locale: ms })}
          </strong>
          <button type="button" className="icon-btn" onClick={() => setCursor(addMonths(cursor, 1))}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="calendar-grid">
          {['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'].map((d) => (
            <div key={d} className="cal-head">{d}</div>
          ))}
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayTasks = tasks.filter((t) => t.dueDate === key)
            return (
              <div
                key={key}
                className={`cal-day ${!isSameMonth(day, cursor) ? 'muted' : ''} ${isSameDay(day, today) ? 'today' : ''}`}
              >
                <div className="num">{format(day, 'd')}</div>
                {dayTasks.slice(0, 3).map((t) => (
                  <Link key={t.id} to={`/tasks/${t.id}`} className={`cal-event ${t.priority}`} title={t.title}>
                    {t.title}
                  </Link>
                ))}
                {dayTasks.length > 3 && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 2 }}>
                    +{dayTasks.length - 3} lagi
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
