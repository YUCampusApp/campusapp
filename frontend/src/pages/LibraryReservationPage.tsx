import { Filter, LibraryBig, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { LibraryPolicyStatusResponse, LibraryReservationResponse, LibrarySlotResponse } from './types'
import { apiFetch, getJson, postJson } from '../lib/api'
import { ScreenHeader } from '../components/ScreenHeader'

function roomName(slotId: number, index: number) {
  const letter = ['A', 'B', 'C', 'D'][index % 4]
  return `Study Room ${letter}${(slotId % 8) + 1}`
}

export function LibraryReservationPage() {
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [slots, setSlots] = useState<LibrarySlotResponse[]>([])
  const [reservations, setReservations] = useState<LibraryReservationResponse[]>([])
  const [selectedDate, setSelectedDate] = useState(todayIso)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [policy, setPolicy] = useState<LibraryPolicyStatusResponse | null>(null)

  const loadPolicy = async () => {
    try {
      const p = await getJson<LibraryPolicyStatusResponse>('/api/library/policy-status')
      setPolicy(p)
    } catch {
      setPolicy(null)
    }
  }

  const loadMyReservations = async () => {
    try {
      const list = await getJson<LibraryReservationResponse[]>('/api/library/reservations/me')
      setReservations(list)
    } catch {
      /* keep local state if endpoint fails */
    }
  }

  const loadSlots = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getJson<LibrarySlotResponse[]>(`/api/library/slots?date=${encodeURIComponent(selectedDate)}`)
      setSlots(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load slots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPolicy().catch(() => {})
    loadMyReservations().catch(() => {})
  }, [])

  useEffect(() => {
    loadSlots().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const reserve = async (slotId: number) => {
    setError(null)
    try {
      const created = await postJson<LibraryReservationResponse>('/api/library/reservations', { slotId })
      setReservations((prev) => [...prev, created])
      await loadSlots()
      await loadPolicy()
      await loadMyReservations()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reserve failed')
    }
  }

  const cancel = async (reservationId: number) => {
    setError(null)
    try {
      const del = await apiFetch(`/api/library/reservations/${reservationId}`, { method: 'DELETE' })
      if (!del.ok) {
        const text = await del.text().catch(() => '')
        throw new Error(text || `Request failed: ${del.status}`)
      }
      setReservations((prev) => prev.filter((r) => r.id !== reservationId))
      await loadSlots()
      await loadMyReservations()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancel failed')
    }
  }

  const confirmHere = async (reservationId: number) => {
    setError(null)
    try {
      const updated = await postJson<LibraryReservationResponse>(`/api/library/reservations/${reservationId}/confirm`, {})
      setReservations((prev) => prev.map((r) => (r.id === reservationId ? updated : r)))
      await loadSlots()
      await loadMyReservations()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Confirm failed')
    }
  }

  const dateLabel = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00')
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
  }, [selectedDate])
  const weekday = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00')
    return d.toLocaleDateString('en-GB', { weekday: 'long' })
  }, [selectedDate])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return slots
    return slots.filter((s, i) => {
      const name = roomName(s.slotId, i).toLowerCase()
      const time = `${s.startTime}-${s.endTime}`.toLowerCase()
      return name.includes(q) || time.includes(q)
    })
  }, [slots, search])

  const activeRes = useMemo(
    () => reservations.filter((r) => r.status !== 'CANCELLED' && r.status !== 'NO_SHOW'),
    [reservations],
  )
  const activeCount = activeRes.length

  const nextBooking = useMemo(() => {
    const sorted = [...activeRes].sort((a, b) => {
      const da = a.reservationDate ?? ''
      const db = b.reservationDate ?? ''
      if (da !== db) return da.localeCompare(db)
      return a.startTime.localeCompare(b.startTime)
    })
    return sorted[0]
  }, [activeRes])

  return (
    <div>
      <ScreenHeader
        kicker="Campus Service"
        title="Library Reservation"
        rightSlot={
          <div className="campus-icon-btn" style={{ display: 'flex' }}>
            <LibraryBig size={20} />
          </div>
        }
      />

      <div className="campus-content" style={{ marginTop: -12 }}>
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
            {policy.blockedUntil ? (
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>Blok bitişi: {new Date(policy.blockedUntil).toLocaleString()}</div>
            ) : null}
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div className="campus-card">
            <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', fontWeight: 600 }}>Selected Date</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginTop: 6 }}>{dateLabel}</div>
            <div style={{ fontSize: 13, color: 'var(--campus-text-muted)', marginTop: 4 }}>{weekday}</div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ marginTop: 10, width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--campus-border)' }}
            />
          </div>
          <div className="campus-card">
            <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', fontWeight: 600 }}>Your Booking</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginTop: 6 }}>{activeCount} Active</div>
            <div style={{ fontSize: 13, color: 'var(--campus-text-muted)', marginTop: 4 }}>
              {nextBooking
                ? `${nextBooking.reservationDate ?? selectedDate} · ${nextBooking.startTime}`
                : 'No active booking'}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(90deg, rgba(59, 89, 218, 0.18) 0%, rgba(107, 138, 232, 0.22) 100%)',
            borderRadius: 'var(--campus-radius-md)',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            border: '1px solid rgba(59, 89, 218, 0.2)',
          }}
        >
          <span style={{ color: 'var(--campus-blue-dark)', fontWeight: 700 }}>Available study rooms</span>
          <span className="campus-pill campus-pill--blue">{filtered.length} Rooms</span>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div className="campus-search" style={{ flex: 1, boxShadow: 'var(--campus-shadow)' }}>
            <Search size={18} color="var(--campus-text-muted)" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search room or time slot" />
          </div>
          <button type="button" className="campus-btn-secondary" style={{ padding: '12px 14px' }}>
            <Filter size={18} />
          </button>
        </div>

        {error ? <div className="campus-error" style={{ marginBottom: 12 }}>{error}</div> : null}

        <div className="campus-section-head">
          <h3 className="campus-section-title">Available Slots</h3>
          <span className="campus-link" style={{ fontSize: 14 }}>
            Today
          </span>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map((s, i) => {
              const available = s.emptySeats > 0
              const name = roomName(s.slotId, i)
              return (
                <div key={s.slotId} className="campus-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{name}</div>
                      <div style={{ color: 'var(--campus-text-muted)', fontSize: 13, marginTop: 4 }}>
                        {s.startTime} - {s.endTime} · {Math.max(1, s.emptySeats)} seats
                      </div>
                      <span className={`campus-pill ${available ? 'campus-pill--green' : 'campus-pill--gray'}`} style={{ marginTop: 10 }}>
                        {available ? 'Available' : 'Booked'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="campus-btn-primary"
                      style={{ width: 'auto', padding: '10px 18px', marginTop: 0 }}
                      disabled={!available || !!policy?.reservationBlocked}
                      onClick={() => reserve(s.slotId)}
                    >
                      {available ? 'Reserve' : 'Full'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {reservations.length > 0 ? (
          <div style={{ marginTop: 24 }}>
            <h3 className="campus-section-title" style={{ marginBottom: 12 }}>
              Your reservations
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {reservations.map((r) => (
                <div key={r.id} className="campus-card">
                  <div style={{ fontWeight: 800 }}>
                    {r.reservationDate ? `${r.reservationDate} · ` : ''}
                    {r.startTime}-{r.endTime} · {r.status}
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {r.status === 'BOOKED' ? (
                      <button type="button" className="campus-btn-secondary" onClick={() => confirmHere(r.id)}>
                        I&apos;m here
                      </button>
                    ) : null}
                    {r.status !== 'CANCELLED' ? (
                      <button type="button" className="campus-btn-secondary" onClick={() => cancel(r.id)}>
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
