import { Bus, MapPin, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getJson } from '../lib/api'
import type { ShuttleEtaResponse, ShuttleStopResponse } from './types'
import { ScreenHeader } from '../components/ScreenHeader'

export function ShuttleTrackingPage() {
  const [stops, setStops] = useState<ShuttleStopResponse[]>([])
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null)
  const [etas, setEtas] = useState<ShuttleEtaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEtas = () => {
    if (selectedStopId == null) return
    setLoading(true)
    setError(null)
    getJson<ShuttleEtaResponse[]>(`/api/shuttles/track?stopId=${selectedStopId}`)
      .then(setEtas)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load ETAs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    getJson<ShuttleStopResponse[]>('/api/shuttles/stops')
      .then((s) => {
        setStops(s)
        setSelectedStopId(s[0]?.id ?? null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load stops'))
  }, [])

  useEffect(() => {
    loadEtas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStopId])

  const closest = etas.length ? Math.min(...etas.map((e) => e.etaMinutes)) : null
  const selectedStop = stops.find((s) => s.id === selectedStopId)

  return (
    <div>
      <ScreenHeader
        kicker="Campus Service"
        title="Shuttle Tracking"
        rightSlot={
          <div className="campus-icon-btn" style={{ display: 'flex' }}>
            <Bus size={20} />
          </div>
        }
      />

      <div className="campus-content" style={{ marginTop: -12 }}>
        {error ? <div className="campus-error" style={{ marginBottom: 12 }}>{error}</div> : null}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div className="campus-card">
            <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', fontWeight: 600 }}>Closest Shuttle</div>
            <div style={{ fontWeight: 800, fontSize: 22, marginTop: 6 }}>{closest != null ? `${closest} Minutes` : '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', marginTop: 4 }}>{selectedStop?.name ?? 'Main Gate Line'}</div>
          </div>
          <div className="campus-card">
            <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', fontWeight: 600 }}>Active Lines</div>
            <div style={{ fontWeight: 800, fontSize: 22, marginTop: 6 }}>{etas.length || 4} Running</div>
            <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', marginTop: 4 }}>Updated just now</div>
          </div>
        </div>

        <div className="campus-map-schematic" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Live Map</div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Campus shuttle overview</div>
            </div>
            <MapPin size={22} color="#f87171" />
          </div>
          <div className="campus-map-route" style={{ marginTop: 24 }}>
            <div className="campus-map-stop">Main Gate</div>
            <div className="campus-map-stop">Engineering</div>
            <div className="campus-map-stop">Dorms</div>
            <div className="campus-map-bus">{etas[0]?.busName ?? 'Shuttle A'}</div>
          </div>
        </div>

        <div className="campus-card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Your stop</div>
          <select
            value={selectedStopId ?? ''}
            onChange={(e) => setSelectedStopId(Number(e.target.value))}
            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--campus-border)' }}
          >
            {stops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="campus-section-head">
          <h3 className="campus-section-title">Live Shuttle Lines</h3>
          <button type="button" className="campus-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={loadEtas}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : etas.length === 0 ? (
          <div className="campus-card">No arrivals.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {etas.map((eta, idx) => (
              <div key={idx} className="campus-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{eta.busName} → Campus Loop</div>
                    <div style={{ color: 'var(--campus-text-muted)', fontSize: 13, marginTop: 4 }}>Near {selectedStop?.name ?? 'stop'}</div>
                    <span className="campus-pill campus-pill--green" style={{ marginTop: 10 }}>
                      On Route
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--campus-blue)', fontSize: 18 }}>{eta.etaMinutes} min</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
