import React, { useEffect, useState } from 'react'
import { GraduationCap, Info, Lock } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export function LoginPage() {
  const { login, error, user } = useAuth()
  const [userType, setUserType] = useState<'student'|'provider'>('student')
  const [studentNo, setStudentNo] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem('campus_remember_student')
    if (saved) {
      setStudentNo(saved)
      setRemember(true)
    }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaChecked) return
    setSubmitting(true)
    try {
      if (userType === 'student') {
        if (remember) localStorage.setItem('campus_remember_student', studentNo)
        else localStorage.removeItem('campus_remember_student')
      }
      
      const identifier = userType === 'provider' ? email : studentNo
      await login({ studentNo: identifier, password, captchaId: 'dummy', captchaCode: 'dummy' })
      // navigation is handled by useEffect on user change
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (user) {
      let path = '/dashboard'
      
      const emailLower = user.email ? user.email.toLowerCase() : ''
      const deptLower = user.department ? user.department.toLowerCase() : ''
      const identifier = emailLower + ' ' + deptLower
      
      if (identifier.includes('cafeteria')) path = '/dashboard/cafeteria-management'
      else if (identifier.includes('shuttle')) path = '/dashboard/shuttle-management'
      else if (identifier.includes('library')) path = '/dashboard/library-management'
      else if (identifier.includes('hairdresser')) path = '/dashboard/hairdresser-management'
      else if (identifier.includes('market')) path = '/dashboard/market-management'

      navigate(path, { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="campus-app campus-app--auth campus-auth-wrap">
      <div className="campus-auth-header">
        <div className="campus-auth-logo">Y</div>
        <h1 className="campus-auth-title" style={{ color: 'white' }}>Yeditepe Campus</h1>
        <p className="campus-auth-sub">Academic life, campus services and daily needs in one place.</p>
      </div>

      <div className="campus-auth-card">
        <h2>Login</h2>
        <p className="campus-auth-lead">Sign in with your credentials to continue.</p>

        {error ? <div className="campus-error">{error}</div> : null}

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button 
            type="button"
            className={userType === 'student' ? 'campus-btn-primary' : 'campus-btn-secondary'} 
            style={{ flex: 1, padding: '8px 4px', fontSize: 13 }}
            onClick={() => setUserType('student')}
          >
            Student & Instructor
          </button>
          <button 
            type="button"
            className={userType === 'provider' ? 'campus-btn-primary' : 'campus-btn-secondary'} 
            style={{ flex: 1, padding: '8px 4px', fontSize: 13 }}
            onClick={() => setUserType('provider')}
          >
            Service Provider
          </button>
        </div>

        <form onSubmit={onSubmit}>
          {userType === 'student' ? (
            <>
              <label className="campus-field-label">Student ID / Username</label>
              <div className="campus-input-row" style={{ marginBottom: 16 }}>
                <GraduationCap className="campus-input-icon" size={20} />
                <input
                  value={studentNo}
                  onChange={(e) => setStudentNo(e.target.value)}
                  placeholder="Enter your student number"
                  autoComplete="username"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <label className="campus-field-label">Email</label>
              <div className="campus-input-row" style={{ marginBottom: 16 }}>
                <Info className="campus-input-icon" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="username"
                  required
                />
              </div>
            </>
          )}

          <label className="campus-field-label">Password</label>
          <div className="campus-input-row" style={{ marginBottom: 16 }}>
            <Lock className="campus-input-icon" size={20} />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button type="button" className="campus-btn-show" onClick={() => setShowPw((s) => !s)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          <div
            style={{
              border: '1px solid var(--campus-border)',
              borderRadius: 'var(--campus-radius-md)',
              padding: 14,
              marginBottom: 16,
              background: '#fafbfc',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={captchaChecked} 
                onChange={(e) => setCaptchaChecked(e.target.checked)} 
                required
              />
              I am not a robot
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <span className="campus-link" style={{ cursor: 'pointer', fontSize: 14 }} onClick={() => alert('Password reset would be handled by IT / SSO.')}>
              Forgot password?
            </span>
          </div>

          <button className="campus-btn-primary" type="submit" disabled={submitting || !captchaChecked}>
            {submitting ? 'Signing in…' : 'Log In'}
          </button>
        </form>

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--campus-border)' }} />
            <span style={{ fontSize: 12, color: 'var(--campus-text-muted)', fontWeight: 600 }}>System info</span>
            <div style={{ flex: 1, height: 1, background: 'var(--campus-border)' }} />
          </div>
          <div className="campus-card" style={{ display: 'flex', gap: 12, textAlign: 'left', padding: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(59, 89, 218, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Info size={22} color="var(--campus-blue)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Access Roles</div>
              <div style={{ fontSize: 13, color: 'var(--campus-text-muted)', marginTop: 4 }}>
                Students use their ID. Service providers log in via their assigned email to access their specific tools.
              </div>
            </div>
          </div>
        </div>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 15 }}>
          New student?{' '}
          <Link className="campus-link" to="/register">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
