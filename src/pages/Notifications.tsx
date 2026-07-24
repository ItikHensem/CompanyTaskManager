import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatDate, StatusBadge } from '../components/ui'

export function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useApp()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifikasi</h1>
          <p>Pemberitahuan tugasan, serahan dan sistem.</p>
        </div>
        {unreadCount > 0 && (
          <button type="button" className="btn btn-ghost" onClick={markAllNotificationsRead}>
            Tanda semua dibaca
          </button>
        )}
      </div>

      <div className="panel">
        {notifications.length === 0 ? (
          <div className="empty">Tiada notifikasi.</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <h3>{n.title}</h3>
                  <StatusBadge value={n.type} />
                </div>
                <p>{n.message}</p>
                <time>{formatDate(n.createdAt, true)}</time>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {!n.read && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => markNotificationRead(n.id)}
                  >
                    Tanda dibaca
                  </button>
                )}
                {n.link && (
                  <Link
                    to={n.link}
                    className="btn btn-primary btn-sm"
                    onClick={() => markNotificationRead(n.id)}
                  >
                    Buka
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
