import React, { useState } from 'react'
import { GraduationCap, Lock, Mail, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { apiUrl } from '../lib/api'

async function registerStudent(payload: {
  name: string
  email: string
  password: string
  studentNo: string
  department: string
  classYear: number
}) {
  const res = await fetch(apiUrl('/api/students/register'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Register failed: ${res.status}`)
  }
  return (await res.json()) as unknown
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [userType, setUserType] = useState<'student' | 'provider'>('student')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPw, setShowPw] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [studentNo, setStudentNo] = useState('')
  const [department, setDepartment] = useState('')
  const [classYear, setClassYear] = useState<number>(1)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const finalStudentNo = userType === 'provider' ? email : studentNo
      const finalClassYear = userType === 'provider' ? 0 : classYear
      await registerStudent({ name, email, password, studentNo: finalStudentNo, department, classYear: finalClassYear })
      navigate('/login')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Register failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="campus-app campus-app--auth campus-auth-wrap">
      <div className="campus-auth-header">
        <div className="campus-auth-logo">Y</div>
        <h1 className="campus-auth-title">Create Account</h1>
        <p className="campus-auth-sub">Join Yeditepe Campus to access all student services.</p>
      </div>

      <div className="campus-auth-card">
        <h2>Sign Up</h2>
        <p className="campus-auth-lead">Fill in your details to create your student account.</p>

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
            onClick={() => {
              setUserType('provider')
              setDepartment('ServiceProvider_Cafeteria')
            }}
          >
            Service Provider
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <label className="campus-field-label">Full Name</label>
          <div className="campus-input-row" style={{ marginBottom: 14 }}>
            <User className="campus-input-icon" size={20} />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required />
          </div>

          {userType === 'student' && (
            <>
              <label className="campus-field-label">Student ID</label>
              <div className="campus-input-row" style={{ marginBottom: 14 }}>
                <GraduationCap className="campus-input-icon" size={20} />
                <input value={studentNo} onChange={(e) => setStudentNo(e.target.value)} placeholder="Enter your student number" required />
              </div>
            </>
          )}

          <label className="campus-field-label">Email</label>
          <div className="campus-input-row" style={{ marginBottom: 14 }}>
            <Mail className="campus-input-icon" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={userType === 'student' ? "Enter your university email" : "Enter your work email"}
              required
            />
          </div>

          <label className="campus-field-label">Password</label>
          <div className="campus-input-row" style={{ marginBottom: 20 }}>
            <Lock className="campus-input-icon" size={20} />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
              required
            />
            <button type="button" className="campus-btn-show" onClick={() => setShowPw((s) => !s)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          <label className="campus-field-label">{userType === 'student' ? 'Department' : 'Service Role'}</label>
          <div className="campus-input-row" style={{ marginBottom: 14 }}>
            {userType === 'student' ? (
              <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Engineering" required />
            ) : (
              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)} 
                required
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 16, color: 'inherit' }}
              >
                <option value="ServiceProvider_Cafeteria">Cafeteria Staff</option>
                <option value="ServiceProvider_Hairdresser">Hairdresser</option>
                <option value="ServiceProvider_Stationery">Stationery</option>
                <option value="ServiceProvider_Market">Market Staff</option>
                <option value="ServiceProvider_Shuttle">Shuttle Operator</option>
                <option value="ServiceProvider_Library">Library Staff</option>
              </select>
            )}
          </div>

          {userType === 'student' && (
            <>
              <label className="campus-field-label">Class Year</label>
              <div className="campus-input-row" style={{ marginBottom: 20 }}>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={classYear}
                  onChange={(e) => setClassYear(Number(e.target.value))}
                  required
                />
              </div>
            </>
          )}

          <button className="campus-btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 15 }}>
          Already have an account?{' '}
          <Link className="campus-link" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
