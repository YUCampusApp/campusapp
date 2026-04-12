import { Calendar, Clock, LibraryBig, Monitor, Sparkles, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LibraryPolicyStatusResponse, LibraryReservationResponse, LibrarySectionStatusResponse } from './types'
import { apiFetch, getJson, postJson } from '../lib/api'
import { ScreenHeader } from '../components/ScreenHeader'
import './LibraryReservationPage.css'

type SectionChoice = 'COMP' | 'GENERAL' | null

function formatLocalDisplay(isoLocal: string) {
  if (!isoLocal) return ''
  return isoLocal.replace('T', ' ').slice(0, 16)
}

function statusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active'
    case 'CANCELLED':
      return 'Cancelled'
    case 'COMPLETED':
      return 'Completed'
    default:
      return status
  }
}

const HALF_HOUR_SLOTS: string[] = (() => {
  const out: string[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return out
})()

function formatIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatTimeHHmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function snapToHalfHour(d: Date): Date {
  const x = new Date(d)
  x.setSeconds(0, 0)
  const m = x.getMinutes()
  if (m === 0 || m === 30) return x
  if (m < 30) x.setMinutes(30)
  else {
    x.setHours(x.getHours() + 1)
    x.setMinutes(0)
  }
  return x
}

function addMinutesToDateTime(dateStr: string, timeStr: string, deltaMinutes: number): Date {
  const t = new Date(`${dateStr}T${timeStr}:00`)
  t.setMinutes(t.getMinutes() + deltaMinutes)
  return snapToHalfHour(t)
}

function defaultReservationRange(): {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
} {
  const now = new Date()
  now.setSeconds(0, 0)
  let s = new Date(now)
  const mm = s.getMinutes()
  if (mm < 30) s.setMinutes(30, 0, 0)
  else {
    s.setHours(s.getHours() + 1)
    s.setMinutes(0, 0, 0)
  }
  s = snapToHalfHour(s)
  const e = addMinutesToDateTime(formatIsoDate(s), formatTimeHHmm(s), 120)
  return {
    startDate: formatIsoDate(s),
    startTime: formatTimeHHmm(s),
    endDate: formatIsoDate(e),
    endTime: formatTimeHHmm(e),
  }
}

function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(2000, 0, 1, h, m, 0, 0)
  return d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function todayMinDateStr(): string {
  const d = new Date()
  return formatIsoDate(d)
}

export function LibraryReservationPage() {
  const [sections, setSections] = useState<LibrarySectionStatusResponse[]>([])
  const [reservations, setReservations] = useState<LibraryReservationResponse[]>([])
  const [policy, setPolicy] = useState<LibraryPolicyStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalSection, setModalSection] = useState<SectionChoice>(null)
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')

  const loadPolicy = useCallback(async () => {
    try {
      const p = await getJson<LibraryPolicyStatusResponse>('/api/library/policy-status')
      setPolicy(p)
    } catch {
      setPolicy(null)
    }
  }, [])

  const loadSections = useCallback(async () => {
    const list = await getJson<LibrarySectionStatusResponse[]>('/api/library/sections')
    setSections(list)
  }, [])

  const loadMyReservations = useCallback(async () => {
    const list = await getJson<LibraryReservationResponse[]>('/api/library/reservations/me')
    setReservations(list)
  }, [])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([loadPolicy(), loadSections(), loadMyReservations()])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load data.')
    } finally {
      setLoading(false)
    }
  }, [loadPolicy, loadSections, loadMyReservations])

  useEffect(() => {
    refreshAll().catch(() => {})
  }, [refreshAll])

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [modalOpen])

  const minDateStr = useMemo(() => todayMinDateStr(), [])

  const endTimeSlotOptions = useMemo(() => {
    if (endDate !== startDate) return HALF_HOUR_SLOTS
    return HALF_HOUR_SLOTS.filter((t) => t > startTime)
  }, [endDate, startDate, startTime])

  /** Same calendar day but no half-hour slot left after start (e.g. 23:30) → roll end to next day. */
  useEffect(() => {
    if (!modalOpen || !startDate || !startTime) return
    if (startDate !== endDate) return
    const opts = HALF_HOUR_SLOTS.filter((t) => t > startTime)
    if (opts.length > 0) return
    const d = new Date(`${startDate}T${startTime}:00`)
    d.setDate(d.getDate() + 1)
    setEndDate(formatIsoDate(d))
    setEndTime('00:00')
  }, [modalOpen, startDate, startTime, endDate])

  useEffect(() => {
    if (!modalOpen || !startDate || !startTime || !endDate || !endTime) return
    const startMs = new Date(`${startDate}T${startTime}:00`).getTime()
    const endMs = new Date(`${endDate}T${endTime}:00`).getTime()
    if (endMs > startMs) return
    const fixed = addMinutesToDateTime(startDate, startTime, 30)
    setEndDate(formatIsoDate(fixed))
    setEndTime(formatTimeHHmm(fixed))
  }, [modalOpen, startDate, startTime, endDate, endTime])

  useEffect(() => {
    if (!modalOpen || !endTime) return
    if (endTimeSlotOptions.length === 0) return
    if (!endTimeSlotOptions.includes(endTime)) {
      setEndTime(endTimeSlotOptions[0])
    }
  }, [modalOpen, endTime, endTimeSlotOptions])

  const applyDurationFromStart = useCallback((deltaMinutes: number) => {
    if (!startDate || !startTime) return
    const end = addMinutesToDateTime(startDate, startTime, deltaMinutes)
    setEndDate(formatIsoDate(end))
    setEndTime(formatTimeHHmm(end))
  }, [startDate, startTime])

  const hasActiveReservation = useMemo(() => {
    const now = Date.now()
    return reservations.some((r) => r.status === 'ACTIVE' && new Date(r.endAt).getTime() > now)
  }, [reservations])

  const openModal = (t: 'COMP' | 'GENERAL') => {
    setModalSection(t)
    const w = defaultReservationRange()
    setStartDate(w.startDate)
    setStartTime(w.startTime)
    setEndDate(w.endDate)
    setEndTime(w.endTime)
    setModalOpen(true)
    setError(null)
  }

  const submitReservation = async () => {
    if (!modalSection || !startDate || !startTime || !endDate || !endTime) {
      setError('Please choose a start and end date & time.')
      return
    }
    setError(null)
    try {
      const startNorm = `${startDate}T${startTime}:00`
      const endNorm = `${endDate}T${endTime}:00`
      await postJson<LibraryReservationResponse>('/api/library/reservations', {
        sectionType: modalSection,
        startLocal: startNorm,
        endLocal: endNorm,
      })
      setModalOpen(false)
      await refreshAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reservation failed.')
    }
  }

  const cancel = async (reservationId: number) => {
    setError(null)
    try {
      const del = await apiFetch(`/api/library/reservations/${reservationId}`, { method: 'DELETE' })
      if (!del.ok) {
        const text = await del.text().catch(() => '')
        throw new Error(text || `Request failed (${del.status})`)
      }
      await refreshAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel.')
    }
  }

  const comp = sections.find((s) => s.sectionType === 'COMP')
  const gen = sections.find((s) => s.sectionType === 'GENERAL')

  const nextBooking = useMemo(() => {
    const now = Date.now()
    const active = reservations.filter((r) => r.status === 'ACTIVE' && new Date(r.endAt).getTime() > now)
    active.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    return active[0]
  }, [reservations])

  const compDisabled = !!policy?.reservationBlocked || hasActiveReservation || comp?.full
  const genDisabled = !!policy?.reservationBlocked || hasActiveReservation || gen?.full

  return (
    <div>
      <ScreenHeader
        kicker="Campus service"
        title="Library"
        rightSlot={
          <div className="campus-icon-btn" style={{ display: 'flex' }}>
            <LibraryBig size={20} />
          </div>
        }
      />

      <div className="campus-content lib-page" style={{ marginTop: -12 }}>
        {policy?.reservationBlocked && policy.message ? (
          <div
            className="campus-card"
            style={{
              marginBottom: 14,
              background: 'var(--campus-danger-bg)',
              border: '1px solid rgba(220, 38, 38, 0.25)',
              color: 'var(--campus-danger)',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {policy.message}
          </div>
        ) : null}

        {error && !modalOpen ? <div className="campus-error" style={{ marginBottom: 12 }}>{error}</div> : null}

        <div className="lib-stat-grid">
          <div className="lib-stat-card">
            <div className="lib-stat-label">Active booking</div>
            <div className="lib-stat-value">{hasActiveReservation ? '1' : '0'}</div>
            <div className="lib-stat-sub">
              {nextBooking
                ? `${nextBooking.sectionType === 'COMP' ? 'Computer' : 'General'} · ${formatLocalDisplay(nextBooking.startLocal)}`
                : 'None'}
            </div>
          </div>
          <div className="lib-stat-card">
            <div className="lib-stat-label">Timezone</div>
            <div className="lib-stat-value" style={{ fontSize: 15 }}>
              Europe/Istanbul
            </div>
            <div className="lib-stat-sub">All times follow the Istanbul local wall clock.</div>
          </div>
        </div>

        {loading ? (
          <div className="lib-loading" aria-busy="true">
            <div className="lib-loading__pulse" />
            <span>Loading availability…</span>
          </div>
        ) : (
          <div className="lib-section-grid">
            <div
              className={`lib-section-card ${compDisabled ? 'lib-section-card--disabled' : ''}`}
              aria-disabled={compDisabled}
            >
              <div className="lib-section-head">
                <div className="lib-section-icon" aria-hidden>
                  <Monitor size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="lib-section-title">Computer area</div>
                  <div className="lib-section-meta">
                    {comp ? `${comp.availableSeats} of ${comp.totalSeats} seats free` : '—'}
                  </div>
                </div>
              </div>
              <div className="lib-section-actions">
                <button
                  type="button"
                  className="campus-btn-primary"
                  disabled={compDisabled}
                  onClick={() => openModal('COMP')}
                >
                  {comp?.full ? 'Full' : 'Pick a time slot'}
                </button>
              </div>
            </div>

            <div
              className={`lib-section-card lib-section-card--general ${genDisabled ? 'lib-section-card--disabled' : ''}`}
              aria-disabled={genDisabled}
            >
              <div className="lib-section-head">
                <div className="lib-section-icon" aria-hidden>
                  <Users size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="lib-section-title">General study area</div>
                  <div className="lib-section-meta">
                    {gen ? `${gen.availableSeats} of ${gen.totalSeats} seats free` : '—'}
                  </div>
                </div>
              </div>
              <div className="lib-section-actions">
                <button
                  type="button"
                  className="campus-btn-primary"
                  disabled={genDisabled}
                  onClick={() => openModal('GENERAL')}
                >
                  {gen?.full ? 'Full' : 'Pick a time slot'}
                </button>
              </div>
            </div>
          </div>
        )}

        {hasActiveReservation ? (
          <p className="lib-hint" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Sparkles size={16} style={{ flexShrink: 0, marginTop: 2, opacity: 0.9 }} aria-hidden />
            <span>
              You can have only one active reservation at a time. Cancel it or wait until it ends to book again.
            </span>
          </p>
        ) : null}

        {reservations.length > 0 ? (
          <div style={{ marginTop: 8 }}>
            <h3 className="lib-res-list-title">My reservations</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {reservations.map((r) => {
                const pillClass =
                  r.status === 'ACTIVE'
                    ? 'lib-status-pill lib-status-pill--active'
                    : r.status === 'COMPLETED'
                      ? 'lib-status-pill lib-status-pill--completed'
                      : r.status === 'CANCELLED'
                        ? 'lib-status-pill lib-status-pill--cancelled'
                        : 'lib-status-pill'
                return (
                  <div key={r.id} className="lib-res-card">
                    <div className="lib-res-row">
                      <div style={{ fontWeight: 800, fontSize: 15 }}>
                        {r.sectionType === 'COMP' ? 'Computer area' : 'General area'}
                      </div>
                      <span className={pillClass}>{statusLabel(r.status)}</span>
                    </div>
                    <div style={{ color: 'var(--campus-text-muted)', fontSize: 14, marginTop: 8 }}>
                      {formatLocalDisplay(r.startLocal)} → {formatLocalDisplay(r.endLocal)}
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {r.status === 'ACTIVE' ? (
                        <button type="button" className="campus-btn-secondary" onClick={() => cancel(r.id)}>
                          Cancel reservation
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        {modalOpen ? (
          <div
            className="lib-modal-backdrop"
            role="presentation"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="lib-modal-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="lib-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div id="lib-modal-title" className="lib-modal-title">
                {modalSection === 'COMP' ? 'Computer area' : 'General study area'}
              </div>
              <p className="lib-modal-desc">
                Choose start and end in <strong>Europe/Istanbul</strong> local time. Times are in 30-minute steps.
                Minimum 30 minutes, maximum 12 hours. Closed library hours are rejected by the server.
              </p>
              {error && modalOpen ? <div className="campus-error" style={{ marginBottom: 12 }}>{error}</div> : null}

              <div className="lib-field">
                <label htmlFor="lib-start-date">Start</label>
                <div className="lib-picker-row">
                  <div className="lib-date-wrap">
                    <span className="lib-input-leading-icon" aria-hidden>
                      <Calendar size={18} strokeWidth={2} />
                    </span>
                    <input
                      id="lib-start-date"
                      type="date"
                      className="lib-date-input"
                      min={minDateStr}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="lib-time-wrap">
                    <span className="lib-input-leading-icon" aria-hidden>
                      <Clock size={17} strokeWidth={2} />
                    </span>
                    <select
                      id="lib-start-time"
                      className="lib-time-select"
                      aria-label="Start time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    >
                      {HALF_HOUR_SLOTS.map((t) => (
                        <option key={t} value={t}>
                          {formatTimeLabel(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="lib-field">
                <label htmlFor="lib-end-date">End</label>
                <div className="lib-picker-row">
                  <div className="lib-date-wrap">
                    <span className="lib-input-leading-icon" aria-hidden>
                      <Calendar size={18} strokeWidth={2} />
                    </span>
                    <input
                      id="lib-end-date"
                      type="date"
                      className="lib-date-input"
                      min={startDate || minDateStr}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="lib-time-wrap">
                    <span className="lib-input-leading-icon" aria-hidden>
                      <Clock size={17} strokeWidth={2} />
                    </span>
                    <select
                      id="lib-end-time"
                      className="lib-time-select"
                      aria-label="End time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    >
                      {(endTimeSlotOptions.length > 0 ? endTimeSlotOptions : HALF_HOUR_SLOTS).map((t) => (
                        <option key={t} value={t}>
                          {formatTimeLabel(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="lib-picker-hint">End must be after start. Overnight sessions are supported.</p>
              </div>

              <div className="lib-quick-row">
                <span className="lib-quick-label">Duration</span>
                <button type="button" className="lib-quick-chip" onClick={() => applyDurationFromStart(30)}>
                  30 min
                </button>
                <button type="button" className="lib-quick-chip" onClick={() => applyDurationFromStart(60)}>
                  1 h
                </button>
                <button type="button" className="lib-quick-chip" onClick={() => applyDurationFromStart(120)}>
                  2 h
                </button>
                <button type="button" className="lib-quick-chip" onClick={() => applyDurationFromStart(240)}>
                  4 h
                </button>
              </div>
              <div className="lib-modal-actions">
                <button type="button" className="campus-btn-secondary" onClick={() => setModalOpen(false)}>
                  Close
                </button>
                <button type="button" className="campus-btn-primary" onClick={() => void submitReservation()}>
                  Reserve
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
