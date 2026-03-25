import { CloudRain, CloudSun, MapPin, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchJson } from '../lib/api'
import type { WeatherDetailResponse } from './types'
import { ScreenHeader } from '../components/ScreenHeader'

function WeatherIcon({ condition }: { condition: string }) {
  const c = condition.toLowerCase()
  if (c.includes('rain')) return <CloudRain size={56} color="var(--campus-blue)" />
  if (c.includes('sun') || c.includes('clear')) return <Sun size={56} color="#f59e0b" />
  return <CloudSun size={56} color="var(--campus-blue)" />
}

function SmallWeatherIcon({ condition }: { condition: string }) {
  const c = condition.toLowerCase()
  if (c.includes('rain')) return <CloudRain size={22} />
  if (c.includes('sun') || c.includes('clear')) return <Sun size={22} />
  return <CloudSun size={22} />
}

export function WeatherPage() {
  const [data, setData] = useState<WeatherDetailResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJson<WeatherDetailResponse>('/api/weather/me')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load weather'))
  }, [])

  if (error) {
    return (
      <div>
        <ScreenHeader kicker="Weather Detail" title="Campus Weather" subtitle="Current and forecast information" />
        <div className="campus-content">
          <div className="campus-error">{error}</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div>
        <ScreenHeader kicker="Weather Detail" title="Campus Weather" subtitle="Current and forecast information" />
        <div className="campus-content">Loading…</div>
      </div>
    )
  }

  const { current, hourly, daily } = data
  const days = daily?.length ? daily : []

  return (
    <div>
      <ScreenHeader
        kicker="Weather Detail"
        title="Campus Weather"
        subtitle="Current and forecast information"
        rightSlot={
          <div className="campus-icon-btn" aria-hidden style={{ display: 'flex' }}>
            <MapPin size={20} />
          </div>
        }
      />

      <div className="campus-content" style={{ marginTop: -8 }}>
        <div className="campus-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', color: 'var(--campus-blue)' }}>{current.temperatureC}°</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{current.condition}</div>
          </div>
          <WeatherIcon condition={current.condition} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
          {[
            { label: 'Feels Like', val: `${current.feelsLikeC}°` },
            { label: 'Humidity', val: `${current.humidityPct}%` },
            { label: 'Wind', val: `${current.windKmh} km/h` },
          ].map((x) => (
            <div key={x.label} className="campus-card" style={{ textAlign: 'center', padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--campus-text-muted)', fontWeight: 600 }}>{x.label}</div>
              <div style={{ fontWeight: 800, marginTop: 6, color: 'var(--campus-blue)' }}>{x.val}</div>
            </div>
          ))}
        </div>

        <div className="campus-section-head" style={{ marginTop: 22 }}>
          <h3 className="campus-section-title">Today by Hour</h3>
          <span className="campus-link" style={{ fontSize: 14 }}>
            Updated now
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, WebkitOverflowScrolling: 'touch' }}>
          {hourly.slice(0, 8).map((h, idx) => (
            <div
              key={idx}
              className="campus-card"
              style={{ minWidth: 88, textAlign: 'center', padding: '14px 10px', flexShrink: 0 }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>{h.time}</div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                <SmallWeatherIcon condition={h.condition} />
              </div>
              <div style={{ fontWeight: 800, color: 'var(--campus-blue)' }}>{h.temperatureC}°</div>
            </div>
          ))}
        </div>

        {days.length > 0 ? (
          <>
            <div className="campus-section-head" style={{ marginTop: 18 }}>
              <h3 className="campus-section-title">4-Day Forecast</h3>
            </div>
            <div className="campus-card" style={{ padding: 0, overflow: 'hidden' }}>
              {days.map((d, idx) => (
                <div
                  key={d.dayLabel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    borderBottom: idx === days.length - 1 ? 'none' : '1px solid var(--campus-border)',
                  }}
                >
                  <SmallWeatherIcon condition={d.condition} />
                  <div style={{ flex: 1, fontWeight: 800 }}>{d.dayLabel}</div>
                  <div style={{ fontWeight: 800 }}>
                    <span style={{ color: 'var(--campus-blue)' }}>{d.highC}°</span>{' '}
                    <span style={{ color: 'var(--campus-text-muted)', fontWeight: 600 }}>{d.lowC}°</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
