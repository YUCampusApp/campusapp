import { MapPin, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { BuildingResponse } from './types'
import { getJson } from '../lib/api'
import { ScreenHeader } from '../components/ScreenHeader'

const COLORS: Record<string, string> = {
  B: '#8b5cf6',
  D: '#f97316',
  E: '#22c55e',
  F: '#14b8a6',
  A: '#3b82f6',
  C: '#5b7bce',
}

const TAGS = ['B Block', 'D-201', 'Library']

export function CampusMapFinderPage() {
  const [buildings, setBuildings] = useState<BuildingResponse[]>([])
  const [selectedCode, setSelectedCode] = useState<string>('')
  const [classroomCodes, setClassroomCodes] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fullMapOpen, setFullMapOpen] = useState(false)

  useEffect(() => {
    getJson<BuildingResponse[]>('/api/campus/buildings')
      .then((b) => {
        setBuildings(b)
        const first = b[0]?.buildingCode ?? ''
        setSelectedCode(first)
        setClassroomCodes(b[0]?.classroomCodes ?? [])
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load buildings'))
  }, [])

  useEffect(() => {
    if (!selectedCode) return
    getJson<string[]>(`/api/campus/classrooms?buildingCode=${encodeURIComponent(selectedCode)}`)
      .then(setClassroomCodes)
      .catch(() => {})
  }, [selectedCode])

  const selectedBuilding = buildings.find((b) => b.buildingCode === selectedCode)

  const filteredBuildings = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return buildings
    return buildings.filter((b) => b.name.toLowerCase().includes(q) || b.buildingCode.toLowerCase().includes(q))
  }, [buildings, search])

  return (
    <div>
      <ScreenHeader
        kicker="Campus Map Finder"
        title="Map & Building Codes"
        subtitle="Visual orientation and class lookup"
        rightSlot={
          <div className="campus-icon-btn" style={{ display: 'flex' }}>
            <MapPin size={20} color="#f87171" />
          </div>
        }
      />

      <div className="campus-content" style={{ marginTop: -8 }}>
        {error ? <div className="campus-error">{error}</div> : null}

        <div className="campus-search" style={{ marginBottom: 12 }}>
          <Search size={18} color="var(--campus-text-muted)" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search building code or classroom" />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {TAGS.map((t) => (
            <button
              key={t}
              type="button"
              className="campus-pill campus-pill--blue"
              style={{ border: 'none', cursor: 'pointer', font: 'inherit' }}
              onClick={() => setSearch(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="campus-section-head">
          <h3 className="campus-section-title">Campus Overview</h3>
          <button type="button" className="campus-link" style={{ fontSize: 14, background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }} onClick={() => setFullMapOpen(true)}>
            Full Map
          </button>
        </div>

        <div
          className="campus-card"
          style={{
            minHeight: 200,
            background: 'linear-gradient(180deg, #e5e7eb 0%, #f3f4f6 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', paddingTop: 48, gap: 8 }}>
            {buildings.slice(0, 4).map((b) => {
              const bg = COLORS[b.buildingCode] ?? '#6b8ae8'
              const active = b.buildingCode === selectedCode
              return (
                <button
                  key={b.buildingCode}
                  type="button"
                  onClick={() => setSelectedCode(b.buildingCode)}
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                    background: bg,
                    color: '#fff',
                    borderRadius: 16,
                    padding: '20px 14px',
                    fontWeight: 900,
                    fontSize: 18,
                    boxShadow: active ? '0 0 0 3px #fff, 0 0 0 6px var(--campus-blue)' : 'var(--campus-shadow)',
                    position: 'relative',
                  }}
                >
                  {active ? (
                    <MapPin
                      size={18}
                      color="#f87171"
                      style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)' }}
                    />
                  ) : null}
                  {b.buildingCode}
                </button>
              )
            })}
          </div>
          <div
            style={{
              marginTop: 16,
              padding: '10px 14px',
              background: 'rgba(59, 89, 218, 0.12)',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--campus-blue)',
            }}
          >
            Selected: {selectedBuilding?.name ?? '—'} · Near Main Path
          </div>
        </div>

        <div className="campus-section-head" style={{ marginTop: 20 }}>
          <h3 className="campus-section-title">Building Codes</h3>
          <span className="campus-link" style={{ fontSize: 14 }}>
            Quick lookup
          </span>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {filteredBuildings.map((b) => {
            const bg = COLORS[b.buildingCode] ?? '#6b8ae8'
            return (
              <div key={b.buildingCode} className="campus-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="campus-building-dot" style={{ background: `${bg}33`, color: bg }}>
                  {b.buildingCode}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800 }}>{b.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--campus-text-muted)', marginTop: 4 }}>Building code: {b.buildingCode}</div>
                </div>
                <button
                  type="button"
                  className="campus-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => setSelectedCode(b.buildingCode)}
                >
                  View
                </button>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 20 }}>
          <h3 className="campus-section-title" style={{ marginBottom: 12 }}>
            Classrooms ({selectedCode})
          </h3>
          {classroomCodes.length === 0 ? (
            <div className="campus-card" style={{ color: 'var(--campus-text-muted)' }}>
              No classroom codes.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {classroomCodes.map((c) => (
                <span key={c} className="campus-pill campus-pill--gray">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {fullMapOpen ? (
        <div
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            padding: 12,
            paddingBottom: 'max(12px, var(--safe-bottom))',
          }}
          onClick={() => setFullMapOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Campus map"
            className="campus-card"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, margin: 'auto', width: '100%', maxWidth: 900, padding: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 800 }}>Campus area map</span>
              <button type="button" className="campus-btn-secondary" onClick={() => setFullMapOpen(false)}>
                Close
              </button>
            </div>
            <iframe
              title="OpenStreetMap — campus area"
              style={{ flex: 1, border: 'none', borderRadius: 12, minHeight: 280 }}
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=29.00%2C40.96%2C29.08%2C41.02&amp;layer=mapnik"
            />
            <a
              href="https://www.openstreetmap.org/#map=15/40.99/29.04"
              target="_blank"
              rel="noreferrer"
              className="campus-link"
              style={{ marginTop: 10, fontSize: 13 }}
            >
              Open full map in browser
            </a>
          </div>
        </div>
      ) : null}
    </div>
  )
}
