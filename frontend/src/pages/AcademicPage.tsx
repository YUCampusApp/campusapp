import { GraduationCap } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AcademicClassResponse, CourseResponse } from './types'
import { getJson } from '../lib/api'
import { ScreenHeader } from '../components/ScreenHeader'
import { adjustAbsences, readAttendance, type AttendanceStore } from '../lib/attendance'
import { gpaCelebrationEmoji, gpaColor } from '../lib/gpaPresentation'

export function AcademicPage() {
  const [classes, setClasses] = useState<AcademicClassResponse[] | null>(null)
  const [gpa, setGpa] = useState<number | null>(null)
  const [allCourses, setAllCourses] = useState<CourseResponse[]>([])
  const [attendance, setAttendance] = useState<AttendanceStore>(() => readAttendance())
  const [error, setError] = useState<string | null>(null)

  const refreshAttendance = useCallback(() => {
    setAttendance(readAttendance())
  }, [])

  useEffect(() => {
    Promise.all([
      getJson<AcademicClassResponse[]>('/api/academic/today'),
      getJson<{ gpa: number }>('/api/academic/gpa/me'),
      getJson<CourseResponse[]>('/api/academic/courses'),
    ])
      .then(([c, g, courses]) => {
        setClasses(c)
        setGpa(g.gpa)
        setAllCourses(courses)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load academic info'))
  }, [])

  const lastSavedLabel = useMemo(() => {
    const times = Object.values(attendance).map((r) => r.updatedAt)
    if (times.length === 0) return null
    const latest = times.reduce((a, b) => (new Date(b) > new Date(a) ? b : a))
    return new Date(latest).toLocaleString()
  }, [attendance])

  const bump = (courseId: number, delta: number) => {
    adjustAbsences(courseId, delta)
    refreshAttendance()
  }

  if (error) {
    return (
      <div>
        <ScreenHeader kicker="Academic Module" title="Today" />
        <div className="campus-content">
          <div className="campus-error">{error}</div>
        </div>
      </div>
    )
  }

  if (!classes || gpa === null) {
    return (
      <div>
        <ScreenHeader kicker="Academic Module" title="Today" />
        <div className="campus-content">Loading…</div>
      </div>
    )
  }

  return (
    <div>
      <ScreenHeader
        kicker="Academic Module"
        title="Academic Overview"
        subtitle="Classes and GPA"
        rightSlot={
          <div className="campus-icon-btn" style={{ display: 'flex' }}>
            <GraduationCap size={20} />
          </div>
        }
      />

      <div className="campus-content" style={{ marginTop: -8 }}>
        <div className="campus-card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', fontWeight: 600 }}>Expected GPA</div>
          <div style={{ fontWeight: 800, fontSize: 32, color: gpaColor(gpa), marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{gpa.toFixed(2)}</span>
            {gpaCelebrationEmoji(gpa) ? <span aria-hidden>{gpaCelebrationEmoji(gpa)}</span> : null}
          </div>
        </div>

        <div className="campus-section-head">
          <h3 className="campus-section-title">Today&apos;s Classes</h3>
        </div>
        {classes.length === 0 ? (
          <div className="campus-card" style={{ color: 'var(--campus-text-muted)' }}>
            No classes today.
          </div>
        ) : (
          <div className="campus-card" style={{ padding: 0, overflow: 'hidden' }}>
            {classes.map((c, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px 16px',
                  borderBottom: idx === classes.length - 1 ? 'none' : '1px solid var(--campus-border)',
                }}
              >
                <div style={{ fontWeight: 800 }}>{c.courseName}</div>
                <div style={{ color: 'var(--campus-text-muted)', fontSize: 13, marginTop: 4 }}>
                  {c.day} · {c.startTime}-{c.endTime} · {c.classroom}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="campus-section-head" style={{ marginTop: 22 }}>
          <h3 className="campus-section-title">Attendance</h3>
          {lastSavedLabel ? (
            <span style={{ fontSize: 12, color: 'var(--campus-text-muted)', fontWeight: 600 }}>Last saved: {lastSavedLabel}</span>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--campus-text-muted)' }}>Local only</span>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--campus-text-muted)', margin: '0 0 12px' }}>
          Missed classes you did not attend: add absences per course. Counts are stored on this device.
        </p>
        {allCourses.length === 0 ? (
          <div className="campus-card" style={{ color: 'var(--campus-text-muted)' }}>Loading courses…</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {allCourses.map((course) => {
              const rec = attendance[String(course.id)]
              const count = rec?.absences ?? 0
              return (
                <div key={course.id} className="campus-card">
                  <div style={{ fontWeight: 800 }}>{course.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <span style={{ fontSize: 13, color: 'var(--campus-text-muted)' }}>Absences recorded: </span>
                      <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--campus-blue)' }}>{count}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" className="campus-btn-secondary" onClick={() => bump(course.id, -1)}>
                        −1
                      </button>
                      <button type="button" className="campus-btn-secondary" onClick={() => bump(course.id, 1)}>
                        +1
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Link to="/dashboard/schedule" className="campus-btn-primary campus-btn-cta-block">
          Open Course Combinator
        </Link>
      </div>
    </div>
  )
}
