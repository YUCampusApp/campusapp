import { Bell, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NotificationResponse } from './types'
import { apiFetch, getJson } from '../lib/api'
import { ScreenHeader } from '../components/ScreenHeader'

function notificationTargetPath(type: string): string {
  const t = type.toUpperCase()
  if (t === 'RESERVATION') return '/dashboard/library'
  if (t === 'APPOINTMENT') return '/dashboard'
  return '/dashboard'
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<NotificationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getJson<NotificationResponse[]>('/api/notifications/me')
      setItems(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => {})
  }, [])

  const markRead = async (id: number) => {
    await apiFetch(`/api/notifications/${id}/read`, { method: 'POST' })
    await load()
  }

  return (
    <div>
      <ScreenHeader
        kicker="Campus"
        title="Notifications"
        subtitle="Alerts and messages"
        rightSlot={
          <div className="campus-icon-btn" style={{ display: 'flex' }}>
            <Bell size={20} />
          </div>
        }
      />
      <div className="campus-content" style={{ marginTop: -8 }}>
        {error ? <div className="campus-error">{error}</div> : null}

        {loading ? (
          <div>Loading…</div>
        ) : items.length === 0 ? (
          <div className="campus-card" style={{ color: 'var(--campus-text-muted)' }}>
            No notifications.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((n) => (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                className="campus-card"
                style={{ opacity: n.read ? 0.75 : 1, cursor: 'pointer' }}
                onClick={() => navigate(notificationTargetPath(n.type))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(notificationTargetPath(n.type))
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontWeight: 800 }}>{n.type}</div>
                  <div style={{ minWidth: 108, display: 'flex', justifyContent: 'flex-end' }}>
                    {!n.read ? (
                      <button
                        type="button"
                        className="campus-btn-secondary"
                        style={{ padding: '8px 12px' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          markRead(n.id).catch(() => {})
                        }}
                      >
                        Mark read
                      </button>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          color: 'var(--campus-success)',
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 size={20} strokeWidth={2.5} aria-hidden />
                        Read
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>{n.message}</div>
                <div style={{ color: 'var(--campus-text-muted)', fontSize: 13, marginTop: 8 }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
