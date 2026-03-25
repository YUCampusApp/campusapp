import { type FormEvent, type ReactNode, useEffect, useState } from 'react'
import { ChevronRight, GraduationCap, Link as LinkIcon, Settings, Star } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ScreenHeader } from '../components/ScreenHeader'
import { getJson, postJsonNoContent } from '../lib/api'
import { gpaCelebrationEmoji, gpaColor } from '../lib/gpaPresentation'

const PUSH_KEY = 'campus_pref_push'
const DARK_KEY = 'campus_pref_dark'

export function ProfilePage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [gpa, setGpa] = useState<number | null>(null)
  const [pushOn, setPushOn] = useState(() => localStorage.getItem(PUSH_KEY) !== '0')
  const [darkOn, setDarkOn] = useState(() => localStorage.getItem(DARK_KEY) === '1')
  const [accountOpen, setAccountOpen] = useState(false)
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwOk, setPwOk] = useState(false)
  const [pwSubmitting, setPwSubmitting] = useState(false)

  useEffect(() => {
    getJson<{ gpa: number }>('/api/academic/gpa/me')
      .then((r) => setGpa(r.gpa))
      .catch(() => setGpa(null))
  }, [])

  useEffect(() => {
    localStorage.setItem(PUSH_KEY, pushOn ? '1' : '0')
  }, [pushOn])

  useEffect(() => {
    localStorage.setItem(DARK_KEY, darkOn ? '1' : '0')
    document.documentElement.dataset.campusDark = darkOn ? '1' : '0'
  }, [darkOn])

  const openAccount = () => {
    setAccountOpen(true)
    setPwError(null)
    setPwOk(false)
    setPwCurrent('')
    setPwNew('')
    setPwConfirm('')
  }

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault()
    setPwError(null)
    setPwOk(false)
    if (pwNew.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (pwNew !== pwConfirm) {
      setPwError('New password and confirmation do not match.')
      return
    }
    setPwSubmitting(true)
    try {
      await postJsonNoContent('/api/auth/change-password', {
        currentPassword: pwCurrent,
        newPassword: pwNew,
      })
      setPwOk(true)
      setPwCurrent('')
      setPwNew('')
      setPwConfirm('')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Could not change password.')
    } finally {
      setPwSubmitting(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="campus-content">
        <div>Loading…</div>
      </div>
    )
  }

  const entryYear = user.studentNo.length >= 4 ? user.studentNo.slice(0, 4) : '—'
  const facultyGuess = user.department.toLowerCase().includes('computer') ? 'Engineering' : user.department.split(' ')[0] ?? 'Faculty'
  const credits = user.classYear != null ? Math.min(24 * (user.classYear || 1), 240) : 96
  const semesterN = user.classYear != null ? Math.min((user.classYear || 1) * 2 - 1, 8) : 6

  return (
    <div>
      <ScreenHeader
        showBack={false}
        kicker="Profile & Academic Info"
        title="My Account"
        rightSlot={
          <button type="button" className="campus-icon-btn" aria-label="Account settings" onClick={openAccount} style={{ display: 'flex' }}>
            <Settings size={20} />
          </button>
        }
      />

      <div className="campus-content" style={{ marginTop: -12 }}>
        <div
          className="campus-card"
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(59, 89, 218, 0.1) 0%, var(--campus-card) 55%)',
            border: '1px solid var(--campus-border)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(59, 89, 218, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GraduationCap size={32} color="var(--campus-blue)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--campus-text)' }}>{user.name}</div>
            <div style={{ color: 'var(--campus-text-muted)', fontSize: 14, marginTop: 4 }}>{user.department} Student</div>
            <div style={{ color: 'var(--campus-text-muted)', fontSize: 13, marginTop: 6 }}>Student ID: {user.studentNo}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="campus-pill campus-pill--blue">{entryYear} Entry</span>
              <span className="campus-pill campus-pill--gray">Active</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <div className="campus-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', fontWeight: 600 }}>Student ID</div>
            <div style={{ fontWeight: 800, marginTop: 6 }}>{user.studentNo}</div>
          </div>
          <div className="campus-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', fontWeight: 600 }}>Faculty</div>
            <div style={{ fontWeight: 800, marginTop: 6 }}>{facultyGuess}</div>
          </div>
        </div>

        <div className="campus-stat-grid" style={{ marginTop: 16 }}>
          <div className="campus-stat">
            <div className="campus-stat__label">GPA</div>
            <div className="campus-stat__value" style={{ display: 'flex', alignItems: 'center', gap: 8, color: gpa != null ? gpaColor(gpa) : undefined }}>
              {gpa != null ? (
                <>
                  <span>{gpa.toFixed(2)}</span>
                  {gpaCelebrationEmoji(gpa) ? <span aria-hidden>{gpaCelebrationEmoji(gpa)}</span> : null}
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div className="campus-stat">
            <div className="campus-stat__label">Credits</div>
            <div className="campus-stat__value">{credits}</div>
          </div>
          <div className="campus-stat">
            <div className="campus-stat__label">Semester</div>
            <div className="campus-stat__value" style={{ fontSize: 18 }}>
              {semesterN}th
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="campus-section-head">
            <h3 className="campus-section-title">Academic Summary</h3>
            <span className="campus-link" style={{ fontSize: 14 }}>
              <Link to="/dashboard/academic" className="campus-link" style={{ textDecoration: 'none' }}>
                Details
              </Link>
            </span>
          </div>
          <div className="campus-card" style={{ display: 'grid', gap: 14 }}>
            <Row label="Advisor" value="Prof. Dr. Mert Özkaya" />
            <Row label="Current Courses" value="5 Active" />
            <Row label="Completed Credits" value={`${credits} / 240`} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--campus-text-muted)', fontWeight: 600, fontSize: 14 }}>Attendance Status</span>
              <span style={{ color: 'var(--campus-success)', fontWeight: 800 }}>Good Standing</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="campus-section-head">
            <h3 className="campus-section-title">Preferences</h3>
            <span className="campus-link" style={{ fontSize: 14 }}>
              Preview
            </span>
          </div>
          <div className="campus-card" style={{ display: 'grid', gap: 18 }}>
            <button
              type="button"
              className="campus-link"
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                font: 'inherit',
                display: 'block',
              }}
              onClick={openAccount}
            >
              <div style={{ fontWeight: 800 }}>Change password</div>
              <div style={{ fontSize: 13, color: 'var(--campus-text-muted)', marginTop: 4 }}>Update your sign-in password</div>
            </button>
            <ToggleRow
              title="Push Notifications"
              sub="Course updates and reservation alerts"
              on={pushOn}
              onToggle={() => setPushOn((v) => !v)}
            />
            <ToggleRow title="Dark Mode" sub="Adjust appearance preference" on={darkOn} onToggle={() => setDarkOn((v) => !v)} />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="campus-section-head">
            <h3 className="campus-section-title">Shortcuts</h3>
          </div>
          <div className="campus-card" style={{ padding: 0, overflow: 'hidden' }}>
            <PrefRow icon={<span style={{ color: '#ea580c' }}>🔔</span>} title="Notifications" sub={pushOn ? 'Enabled' : 'Disabled'} to="/dashboard/notifications" />
            <PrefRow
              icon={<Star size={20} color="#ca8a04" />}
              title="Favorites"
              sub="Modules on home"
              to="/dashboard"
            />
            <PrefRow icon={<LinkIcon size={20} color="var(--campus-blue)" />} title="Email" sub={user.email} to="#" />
          </div>
        </div>
      </div>

      {accountOpen ? (
        <div
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setAccountOpen(false)}
        >
          <div
            role="dialog"
            aria-labelledby="account-dialog-title"
            className="campus-card"
            style={{ width: '100%', maxWidth: 420, maxHeight: '90vh', overflow: 'auto', marginBottom: 'max(16px, var(--safe-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="account-dialog-title" style={{ margin: '0 0 8px', fontSize: 18 }}>
              Account
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--campus-text-muted)' }}>
              Change your password here. Notification inbox:{' '}
              <button type="button" className="campus-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }} onClick={() => { setAccountOpen(false); navigate('/dashboard/notifications') }}>
                open notifications
              </button>
              .
            </p>
            <form onSubmit={submitPassword} style={{ display: 'grid', gap: 12 }}>
              <label className="campus-field-label">Current password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                required
                style={{ padding: 12, borderRadius: 10, border: '1px solid var(--campus-border)', width: '100%', boxSizing: 'border-box' }}
              />
              <label className="campus-field-label">New password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                required
                minLength={6}
                style={{ padding: 12, borderRadius: 10, border: '1px solid var(--campus-border)', width: '100%', boxSizing: 'border-box' }}
              />
              <label className="campus-field-label">Confirm new password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                required
                style={{ padding: 12, borderRadius: 10, border: '1px solid var(--campus-border)', width: '100%', boxSizing: 'border-box' }}
              />
              {pwError ? <div className="campus-error">{pwError}</div> : null}
              {pwOk ? <div style={{ color: 'var(--campus-success)', fontWeight: 700, fontSize: 14 }}>Password updated.</div> : null}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="campus-btn-secondary" style={{ flex: 1 }} onClick={() => setAccountOpen(false)}>
                  Close
                </button>
                <button type="submit" className="campus-btn-primary" style={{ flex: 1 }} disabled={pwSubmitting}>
                  {pwSubmitting ? 'Saving…' : 'Save password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
      <span style={{ color: 'var(--campus-text-muted)', fontWeight: 600, fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: 14, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function ToggleRow({
  title,
  sub,
  on,
  onToggle,
}: {
  title: string
  sub: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div>
        <div style={{ fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--campus-text-muted)', marginTop: 4 }}>{sub}</div>
      </div>
      <button
        type="button"
        className={`campus-toggle${on ? ' campus-toggle--on' : ' campus-toggle--off'}`}
        onClick={onToggle}
        aria-pressed={on}
      >
        <span className="campus-toggle__knob" />
      </button>
    </div>
  )
}

function PrefRow({
  icon,
  title,
  sub,
  to,
}: {
  icon: ReactNode
  title: string
  sub: string
  to: string
}) {
  const inner = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 14px', borderBottom: '1px solid var(--campus-border)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--campus-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--campus-text-muted)', marginTop: 2 }}>{sub}</div>
      </div>
      <ChevronRight size={20} color="var(--campus-text-muted)" />
    </div>
  )
  if (to === '#') return <div style={{ cursor: 'default' }}>{inner}</div>
  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
      {inner}
    </Link>
  )
}
