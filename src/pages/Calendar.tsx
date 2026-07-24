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
            const visible = dayTasks.slice(0, 2)
            const extra = dayTasks.length - visible.length
            return (
              <div
                key={key}
                className={`cal-day ${!isSameMonth(day, cursor) ? 'muted' : ''} ${isSameDay(day, today) ? 'today' : ''}`}
              >
                <div className="num">{format(day, 'd')}</div>
                <div className="cal-events">
                  {visible.map((t) => (
                    <Link
                      key={t.id}
                      to={`/tasks/${t.id}`}
                      className={`cal-event ${t.priority}`}
                      title={t.title}
                    >
                      {t.title}
                    </Link>
                  ))}
                  {extra > 0 && <div className="cal-more">+{extra} lagi</div>}
                </div>
                {dayTasks.length > 0 && (
                  <div className="cal-dots" title={dayTasks.map((t) => t.title).join(', ')}>
                    {dayTasks.slice(0, 4).map((t) => (
                      <span key={t.id} className={`cal-dot ${t.priority}`} />
                    ))}
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
