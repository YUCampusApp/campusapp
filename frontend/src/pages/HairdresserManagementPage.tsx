import { useCallback, useEffect, useState } from 'react'
import { apiFetch, getJson } from '../lib/api'
import { ScreenHeader } from '../components/ScreenHeader'
import type { HairdresserAppointmentResponse } from './types'

function formatLocalDisplay(isoLocal: string) {
  if (!isoLocal) return ''
  return isoLocal.replace('T', ' ').slice(0, 16)
}

function softChipStyle(active: boolean): React.CSSProperties {
  return {
    border: '1px solid var(--campus-border)',
    background: active ? 'rgba(168, 85, 247, 0.12)' : 'rgba(148, 163, 184, 0.08)',
    color: active ? '#7e22ce' : 'var(--campus-text-muted)',
    borderRadius: 999,
    padding: '7px 12px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all .2s ease',
    fontFamily: 'inherit',
  }
}

export function HairdresserManagementPage() {
  const [appointments, setAppointments] = useState<HairdresserAppointmentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'ONGOING' | 'UPCOMING'>('ALL')

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await getJson<HairdresserAppointmentResponse[]>('/api/hairdresser/appointments/active')
      setAppointments(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load active appointments.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAppointments().catch(() => {})
  }, [loadAppointments])

  const cancelAppointment = async (appointmentId: number) => {
    setBusyId(appointmentId)
    setError(null)
    try {
      const res = await apiFetch(`/api/hairdresser/appointments/${appointmentId}/admin`, { method: 'DELETE' })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Request failed (${res.status})`)
      }
      await loadAppointments()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel appointment.')
    } finally {
      setBusyId(null)
    }
  }

  const nowMs = Date.now()
  const ongoingCount = appointments.filter((a) => new Date(a.startAt).getTime() <= nowMs && new Date(a.endAt).getTime() > nowMs).length
  const upcomingCount = appointments.filter((a) => new Date(a.startAt).getTime() > nowMs).length
  const filteredAppointments = appointments.filter((a) => {
    if (timeFilter === 'ONGOING') {
      return new Date(a.startAt).getTime() <= nowMs && new Date(a.endAt).getTime() > nowMs
    }
    if (timeFilter === 'UPCOMING') {
      return new Date(a.startAt).getTime() > nowMs
    }
    return true
  })

  return (
    <div className="campus-page fade-in">
      <ScreenHeader title="Hairdresser Admin" />
      <div className="campus-content">
        <div className="campus-card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Active appointments</div>
          <div style={{ color: 'var(--campus-text-muted)', fontSize: 14 }}>
            Review upcoming bookings and cancel any appointment when needed.
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="campus-pill">{appointments.length} total</span>
            <span className="campus-pill">{ongoingCount} now active</span>
            <span className="campus-pill">{upcomingCount} upcoming</span>
          </div>
        </div>

        {error ? <div className="campus-error">{error}</div> : null}

        {!loading ? (
          <div className="campus-card" style={{ marginBottom: 12 }}>
            <div style={{ color: 'var(--campus-text-muted)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Time</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" style={softChipStyle(timeFilter === 'ALL')} onClick={() => setTimeFilter('ALL')}>
                All active
              </button>
              <button type="button" style={softChipStyle(timeFilter === 'ONGOING')} onClick={() => setTimeFilter('ONGOING')}>
                Now active
              </button>
              <button type="button" style={softChipStyle(timeFilter === 'UPCOMING')} onClick={() => setTimeFilter('UPCOMING')}>
                Upcoming
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="campus-card">Loading active appointments...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="campus-card">No appointments match your current filters.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filteredAppointments.map((a) => (
              <div key={a.id} className="campus-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 800 }}>{a.studentName}</div>
                  <div style={{ fontSize: 12, color: 'var(--campus-text-muted)' }}>ID: {a.studentNo}</div>
                </div>
                <div style={{ marginTop: 8, color: 'var(--campus-text-muted)', fontSize: 14 }}>
                  {formatLocalDisplay(a.startLocal)} - {formatLocalDisplay(a.endLocal)}
                </div>
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="campus-btn-secondary"
                    onClick={() => cancelAppointment(a.id)}
                    disabled={busyId === a.id}
                  >
                    {busyId === a.id ? 'Cancelling...' : 'Cancel appointment'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
