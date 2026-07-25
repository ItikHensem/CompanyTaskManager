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
import { formatDate, StatusBadge } from '../components/ui'

export function CalendarPage() {
  const { visibleTasks: tasks, getOfficer } = useApp()
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState(() => new Date())

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const today = new Date()

  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof tasks>()
    for (const t of tasks) {
      const list = map.get(t.dueDate) || []
      list.push(t)
      map.set(t.dueDate, list)
    }
    return map
  }, [tasks])

  const selectedKey = format(selected, 'yyyy-MM-dd')
  const selectedTasks = tasksByDate.get(selectedKey) || []

  const monthTasks = useMemo(() => {
    const prefix = format(cursor, 'yyyy-MM')
    return [...tasks]
      .filter((t) => t.dueDate.startsWith(prefix))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [tasks, cursor])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Kalendar</h1>
          <p>Jadual tarikh akhir tugasan mengikut bulan.</p>
        </div>
        <div className="cal-nav">
          <button type="button" className="icon-btn" onClick={() => setCursor(subMonths(cursor, 1))} aria-label="Bulan sebelumnya">
            <ChevronLeft size={18} />
          </button>
          <strong className="cal-month-label">
            {format(cursor, 'MMMM yyyy', { locale: ms })}
          </strong>
          <button type="button" className="icon-btn" onClick={() => setCursor(addMonths(cursor, 1))} aria-label="Bulan seterusnya">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="panel cal-panel">
        <div className="calendar-grid">
          {['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'].map((d) => (
            <div key={d} className="cal-head">{d}</div>
          ))}
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayTasks = tasksByDate.get(key) || []
            const inMonth = isSameMonth(day, cursor)
            const isSelected = isSameDay(day, selected)
            const isToday = isSameDay(day, today)

            return (
              <button
                key={key}
                type="button"
                className={[
                  'cal-day',
                  !inMonth ? 'muted' : '',
                  isToday ? 'today' : '',
                  isSelected ? 'selected' : '',
                  dayTasks.length ? 'has-tasks' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setSelected(day)}
                aria-label={`${format(day, 'd MMMM yyyy', { locale: ms })}${dayTasks.length ? `, ${dayTasks.length} tugasan` : ''}`}
              >
                <span className="num">{format(day, 'd')}</span>
                {dayTasks.length > 0 && (
                  <span className="cal-dots" aria-hidden>
                    {dayTasks.slice(0, 3).map((t) => (
                      <span key={t.id} className={`cal-dot ${t.priority}`} />
                    ))}
                    {dayTasks.length > 3 && <span className="cal-dot-more">+</span>}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="panel" style={{ marginTop: '1rem' }}>
        <div className="panel-title">
          <h2>
            {format(selected, 'd MMMM yyyy', { locale: ms })}
            <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: '0.9rem', marginLeft: 8 }}>
              ({selectedTasks.length} tugasan)
            </span>
          </h2>
        </div>

        {selectedTasks.length === 0 ? (
          <div className="empty">Tiada tugasan pada tarikh ini.</div>
        ) : (
          <div className="cal-task-list">
            {selectedTasks.map((t) => (
              <Link key={t.id} to={`/tasks/${t.id}`} className="cal-task-item">
                <div className="cal-task-main">
                  <strong>{t.title}</strong>
                  <span>
                    {t.assignedTo
                      .map((id) => getOfficer(id)?.name)
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </span>
                </div>
                <div className="cal-task-meta">
                  <StatusBadge value={t.priority} />
                  <StatusBadge value={t.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: '1rem' }}>
        <div className="panel-title">
          <h2>Semua tarikh akhir bulan ini</h2>
        </div>
        {monthTasks.length === 0 ? (
          <div className="empty">Tiada tugasan untuk bulan ini.</div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Tarikh</th>
                  <th>Tajuk</th>
                  <th>Keutamaan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {monthTasks.map((t) => (
                  <tr key={t.id}>
                    <td>{formatDate(t.dueDate)}</td>
                    <td>
                      <Link to={`/tasks/${t.id}`} style={{ color: 'var(--unity)', fontWeight: 600 }}>
                        {t.title}
                      </Link>
                    </td>
                    <td><StatusBadge value={t.priority} /></td>
                    <td><StatusBadge value={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
