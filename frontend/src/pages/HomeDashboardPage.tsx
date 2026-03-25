import {
  Bell,
  BookOpen,
  Bus,
  CloudSun,
  GraduationCap,
  LibraryBig,
  MapPinned,
  Puzzle,
  Coffee,
  Scissors,
  ShoppingCart,
  PenTool
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchJson } from '../lib/api'
import { ScreenHeader } from '../components/ScreenHeader'
import { ServiceModal, CafeteriaContent, HairdresserContent, MarketContent, StationeryContent } from '../components/ServiceModals'
import type { DashboardResponse } from './types'

const modules: { to: string; label: string; Icon: React.ComponentType<{ size?: number; color?: string }>; tint: string }[] = [
  { to: '/dashboard/weather', label: 'Weather', Icon: CloudSun, tint: 'rgba(59, 89, 218, 0.12)' },
  { to: '/dashboard/schedule', label: 'Course Combinator', Icon: Puzzle, tint: 'rgba(234, 179, 8, 0.2)' },
  { to: '/dashboard/library', label: 'Library', Icon: LibraryBig, tint: 'rgba(22, 163, 74, 0.12)' },
  { to: '/dashboard/lecture-notes', label: 'Lecture Notes', Icon: BookOpen, tint: 'rgba(59, 89, 218, 0.12)' },
  { to: '/dashboard/shuttle', label: 'Shuttle', Icon: Bus, tint: 'rgba(236, 72, 153, 0.12)' },
  { to: '/dashboard/campus-map', label: 'Campus Map', Icon: MapPinned, tint: 'rgba(139, 92, 246, 0.15)' },
  { to: '/dashboard/notifications', label: 'Notifications', Icon: Bell, tint: 'rgba(249, 115, 22, 0.12)' },
  { to: '/dashboard/academic', label: 'Academic', Icon: GraduationCap, tint: 'rgba(14, 165, 233, 0.15)' },
]

export function HomeDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<'cafeteria' | 'hairdresser' | 'market' | 'stationery' | null>(null)

  useEffect(() => {
    fetchJson<DashboardResponse>('/api/dashboard/me')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load dashboard'))
  }, [])

  if (error) {
    return (
      <div>
        <ScreenHeader showBack={false} kicker="Yeditepe Campus" title="Home" />
        <div className="campus-content">
          <div className="campus-error">{error}</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div>
        <ScreenHeader showBack={false} kicker="Yeditepe Campus" title="Home" />
        <div className="campus-content">Loading…</div>
      </div>
    )
  }

  const hello = (() => {
    const w = data.welcomeMessage
    const m = w.match(/welcome,?\s*(.+)/i)
    return m?.[1]?.split(/[,.]/)[0]?.trim() ?? 'Student'
  })()

  return (
    <div>
      <ScreenHeader showBack={false} kicker="Yeditepe Campus" title={`Hello, ${hello}`} subtitle={`${data.currentDate} · ${data.currentTime}`} />

      <div className="campus-content" style={{ marginTop: -8 }}>
        <Link to="/dashboard/weather" className="campus-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--campus-text-muted)' }}>Campus Weather</div>
              <div style={{ fontWeight: 800, fontSize: 18, marginTop: 6 }}>
                {data.weather.condition} · {data.weather.temperatureC}°C
              </div>
            </div>
            <CloudSun size={36} color="var(--campus-blue)" />
          </div>
        </Link>

        <div style={{ marginTop: 22 }}>
          <h3 className="campus-section-title" style={{ marginBottom: 12 }}>
            Modules
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {modules.map(({ to, label, Icon, tint }) => (
              <Link
                key={to}
                to={to}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  background: 'var(--campus-card)',
                  borderRadius: 'var(--campus-radius-md)',
                  padding: 16,
                  boxShadow: 'var(--campus-shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: tint,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} color="var(--campus-blue)" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <h3 className="campus-section-title" style={{ marginBottom: 12 }}>
            Campus Services
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {[
              { id: 'cafeteria', label: 'Cafeteria', Icon: Coffee, tint: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' },
              { id: 'hairdresser', label: 'Hairdresser', Icon: Scissors, tint: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' },
              { id: 'market', label: 'Market', Icon: ShoppingCart, tint: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
              { id: 'stationery', label: 'Stationery', Icon: PenTool, tint: 'rgba(234, 179, 8, 0.1)', color: '#eab308' },
            ].map((srv) => (
              <button
                key={srv.id}
                onClick={() => setActiveModal(srv.id as any)}
                style={{
                  textDecoration: 'none', background: 'var(--campus-card)', borderRadius: 'var(--campus-radius-md)', padding: 16,
                  boxShadow: 'var(--campus-shadow)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', border: 'none', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 14, background: srv.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <srv.Icon size={22} color={srv.color} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--campus-text)' }}>{srv.label}</span>
              </button>
            ))}
          </div>
        </div>

        {data.favorites.length > 0 ? (
          <div style={{ marginTop: 22 }}>
            <h3 className="campus-section-title" style={{ marginBottom: 12 }}>
              Favorites
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {data.favorites.map((f) => {
                const to =
                  f.moduleKey === 'WEATHER'
                    ? '/dashboard/weather'
                    : f.moduleKey === 'LIBRARY'
                      ? '/dashboard/library'
                      : f.moduleKey === 'NOTES'
                        ? '/dashboard/lecture-notes'
                        : f.moduleKey === 'SHUTTLE'
                          ? '/dashboard/shuttle'
                          : f.moduleKey === 'CAMPUS_MAP'
                            ? '/dashboard/campus-map'
                            : '/dashboard'
                return (
                  <Link key={f.moduleKey} to={to} className="campus-pill campus-pill--blue" style={{ textDecoration: 'none' }}>
                    {f.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 22 }}>
          <h3 className="campus-section-title" style={{ marginBottom: 12 }}>
            Today’s Classes
          </h3>
          {data.todaysClasses.length === 0 ? (
            <div className="campus-card" style={{ color: 'var(--campus-text-muted)', fontWeight: 600 }}>
              No classes today.
            </div>
          ) : (
            <div className="campus-card" style={{ padding: 0, overflow: 'hidden' }}>
              {data.todaysClasses.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px 16px',
                    borderBottom: idx === data.todaysClasses.length - 1 ? 'none' : '1px solid var(--campus-border)',
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{c.courseName}</div>
                  <div style={{ color: 'var(--campus-text-muted)', fontSize: 13, marginTop: 4 }}>
                    {c.day} · {c.startTime}-{c.endTime} · {c.classroom}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 22 }}>
          <h3 className="campus-section-title" style={{ marginBottom: 12 }}>
            Announcements
          </h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {data.announcements.map((a, idx) => (
              <div key={idx} className="campus-card">
                <div style={{ fontWeight: 800 }}>{a.title}</div>
                <div style={{ color: 'var(--campus-text-muted)', fontSize: 13, marginTop: 4 }}>{a.time}</div>
                <div style={{ marginTop: 10, fontSize: 14 }}>{a.content}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 22, marginBottom: 24 }}>
          <h3 className="campus-section-title" style={{ marginBottom: 12 }}>
            Reminders
          </h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {data.reminders.map((r, idx) => (
              <div key={idx} className="campus-card">
                <div style={{ fontWeight: 800 }}>{r.type}</div>
                <div style={{ marginTop: 8 }}>{r.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ServiceModal isOpen={activeModal === 'cafeteria'} onClose={() => setActiveModal(null)} title="Cafeteria Menu">
        <CafeteriaContent />
      </ServiceModal>
      <ServiceModal isOpen={activeModal === 'hairdresser'} onClose={() => setActiveModal(null)} title="Hairdresser">
        <HairdresserContent />
      </ServiceModal>
      <ServiceModal isOpen={activeModal === 'market'} onClose={() => setActiveModal(null)} title="Market Stock">
        <MarketContent />
      </ServiceModal>
      <ServiceModal isOpen={activeModal === 'stationery'} onClose={() => setActiveModal(null)} title="Stationery">
        <StationeryContent />
      </ServiceModal>
    </div>
  )
}
