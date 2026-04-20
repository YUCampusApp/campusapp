import { useCallback, useEffect, useState } from 'react'
import { apiFetch, getJson } from '../lib/api'
import { ScreenHeader } from '../components/ScreenHeader'
import type { LibraryReservationResponse } from './types'

function formatLocalDisplay(isoLocal: string) {
  if (!isoLocal) return ''
  return isoLocal.replace('T', ' ').slice(0, 16)
}

function sectionLabel(type: 'COMP' | 'GENERAL'): string {
  return type === 'COMP' ? 'Computer area' : 'General area'
}

function softChipStyle(active: boolean): React.CSSProperties {
  return {
    border: '1px solid var(--campus-border)',
    background: active ? 'rgba(59, 89, 218, 0.12)' : 'rgba(148, 163, 184, 0.08)',
    color: active ? 'var(--campus-blue)' : 'var(--campus-text-muted)',
    borderRadius: 999,
    padding: '7px 12px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all .2s ease',
    fontFamily: 'inherit',
  }
}

export function LibraryManagementPage() {
  const [reservations, setReservations] = useState<LibraryReservationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [sectionFilter, setSectionFilter] = useState<'ALL' | 'COMP' | 'GENERAL'>('ALL')
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'ONGOING' | 'UPCOMING'>('ALL')

  const loadReservations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await getJson<LibraryReservationResponse[]>('/api/library/reservations/active')
      setReservations(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load active reservations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReservations().catch(() => {})
  }, [loadReservations])

  const cancelReservation = async (reservationId: number) => {
    setBusyId(reservationId)
    setError(null)
    try {
      const res = await apiFetch(`/api/library/reservations/${reservationId}/admin`, { method: 'DELETE' })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Request failed (${res.status})`)
      }
      await loadReservations()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel reservation.')
    } finally {
      setBusyId(null)
    }
  }

  const nowMs = Date.now()
  const ongoingCount = reservations.filter((r) => new Date(r.startAt).getTime() <= nowMs && new Date(r.endAt).getTime() > nowMs).length
  const upcomingCount = reservations.filter((r) => new Date(r.startAt).getTime() > nowMs).length

  const filteredReservations = reservations.filter((r) => {
    if (sectionFilter !== 'ALL' && r.sectionType !== sectionFilter) return false
    if (timeFilter === 'ONGOING') {
      return new Date(r.startAt).getTime() <= nowMs && new Date(r.endAt).getTime() > nowMs
    }
    if (timeFilter === 'UPCOMING') {
      return new Date(r.startAt).getTime() > nowMs
    }
    return true
  })

  return (
    <div className="campus-page fade-in">
      <ScreenHeader title="Library Admin" />
      <div className="campus-content">
        <div className="campus-card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Active reservations</div>
          <div style={{ color: 'var(--campus-text-muted)', fontSize: 14 }}>
            Review current reservations and cancel any entry when needed.
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="campus-pill">{reservations.length} total</span>
            <span className="campus-pill">{ongoingCount} now active</span>
            <span className="campus-pill">{upcomingCount} upcoming</span>
          </div>
        </div>

        {error ? <div className="campus-error">{error}</div> : null}

        {!loading ? (
          <div className="campus-card" style={{ marginBottom: 12 }}>
            <div style={{ color: 'var(--campus-text-muted)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Section</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <button type="button" style={softChipStyle(sectionFilter === 'ALL')} onClick={() => setSectionFilter('ALL')}>
                All sections
              </button>
              <button type="button" style={softChipStyle(sectionFilter === 'COMP')} onClick={() => setSectionFilter('COMP')}>
                Computer area
              </button>
              <button type="button" style={softChipStyle(sectionFilter === 'GENERAL')} onClick={() => setSectionFilter('GENERAL')}>
                General area
              </button>
            </div>

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
          <div className="campus-card">Loading active reservations...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="campus-card">No reservations match your current filters.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filteredReservations.map((r) => (
              <div key={r.id} className="campus-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 800 }}>{r.studentName ?? 'Unknown student'}</div>
                  <div style={{ fontSize: 12, color: 'var(--campus-text-muted)' }}>ID: {r.studentNo ?? '—'}</div>
                </div>
                <div style={{ marginTop: 8, color: 'var(--campus-text-muted)', fontSize: 14 }}>
                  {sectionLabel(r.sectionType)} · {formatLocalDisplay(r.startLocal)} - {formatLocalDisplay(r.endLocal)}
                </div>
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="campus-btn-secondary"
                    onClick={() => cancelReservation(r.id)}
                    disabled={busyId === r.id}
                  >
                    {busyId === r.id ? 'Cancelling...' : 'Cancel reservation'}
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
