import { Puzzle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  CourseResponse,
  GenerateScheduleRequest,
  ScheduleAlternativeResponse,
  SavedScheduleResponse,
  ScheduleSessionResponse,
} from './types'
import { getJson, postJson } from '../lib/api'
import { ScreenHeader } from '../components/ScreenHeader'

const chipClass = ['campus-chip campus-chip--a', 'campus-chip campus-chip--b', 'campus-chip campus-chip--c']

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const

const DAY_MAP: Record<string, (typeof DAYS)[number]> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
}

function sessionsByDay(sessions: ScheduleSessionResponse[]) {
  const map: Record<string, ScheduleSessionResponse[]> = {}
  for (const d of DAYS) map[d] = []
  for (const s of sessions) {
    const k = DAY_MAP[s.day] ?? 'Mon'
    map[k] = [...map[k], s]
  }
  return map
}

export function ScheduleBuilderPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([])
  const [alternatives, setAlternatives] = useState<ScheduleAlternativeResponse[] | null>(null)
  const [saved, setSaved] = useState<SavedScheduleResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [coursePickerOpen, setCoursePickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    Promise.all([getJson<CourseResponse[]>('/api/academic/courses'), getJson<SavedScheduleResponse[]>('/api/academic/schedules/me')])
      .then(([c, s]) => {
        setCourses(c)
        setSaved(s)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load courses'))
  }, [])

  useEffect(() => {
    if (!coursePickerOpen) return
    const t = window.setTimeout(() => pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    return () => window.clearTimeout(t)
  }, [coursePickerOpen])

  const canGenerate = useMemo(() => selectedCourseIds.length > 0, [selectedCourseIds])

  const toggleCourse = (courseId: number) => {
    setSelectedCourseIds((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]))
  }

  const onGenerate = async () => {
    setError(null)
    setGenerating(true)
    try {
      const body: GenerateScheduleRequest = { selectedCourseIds, maxAlternatives: 5 }
      const res = await postJson<ScheduleAlternativeResponse[]>('/api/academic/schedule/generate', body)
      setAlternatives(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Schedule generation failed')
      setAlternatives(null)
    } finally {
      setGenerating(false)
    }
  }

  const saveAlternative = async (alt: ScheduleAlternativeResponse) => {
    const name = alt.name
    try {
      const savedRes = await postJson<SavedScheduleResponse>('/api/academic/schedules/save', { scheduleId: alt.id, name })
      setSaved((prev) => [...prev, savedRes])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const previewSessions = alternatives?.[0]?.sessions ?? []

  const byDay = sessionsByDay(previewSessions)

  return (
    <div>
      <ScreenHeader
        kicker="Academic Module"
        title="Course Combinator"
        rightSlot={
          <div className="campus-icon-btn" style={{ display: 'flex' }}>
            <Puzzle size={20} />
          </div>
        }
      />

      <div className="campus-content" style={{ marginTop: -8 }}>
        {error ? <div className="campus-error" style={{ marginBottom: 12 }}>{error}</div> : null}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div className="campus-card">
            <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', fontWeight: 600 }}>Selected Courses</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginTop: 6 }}>{selectedCourseIds.length} Courses</div>
            <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', marginTop: 4 }}>Ready to combine</div>
          </div>
          <div className="campus-card">
            <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', fontWeight: 600 }}>Generated Plans</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginTop: 6 }}>{alternatives?.length ?? 0} Options</div>
            <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', marginTop: 4 }}>Conflict-free</div>
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(90deg, rgba(59, 89, 218, 0.18) 0%, rgba(107, 138, 232, 0.22) 100%)',
            borderRadius: 'var(--campus-radius-md)',
            padding: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
            border: '1px solid rgba(59, 89, 218, 0.2)',
          }}
        >
          <div>
            <div style={{ color: 'var(--campus-blue-dark)', fontWeight: 800 }}>Smart Builder</div>
            <div style={{ color: 'var(--campus-text-muted)', fontSize: 13, marginTop: 4 }}>Create best schedule</div>
          </div>
          <button
            type="button"
            className="campus-btn-primary"
            style={{ width: 'auto', margin: 0, padding: '12px 20px' }}
            disabled={!canGenerate || generating}
            onClick={onGenerate}
          >
            {generating ? '…' : 'Generate'}
          </button>
        </div>

        {coursePickerOpen ? (
          <div ref={pickerRef} className="campus-card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 12 }}>Select courses</div>
            <p style={{ fontSize: 13, color: 'var(--campus-text-muted)', margin: '0 0 12px' }}>
              Check the courses you want in your schedule, then tap Done.
            </p>
            <div style={{ display: 'grid', gap: 0 }}>
              {courses.map((c) => (
                <label
                  key={c.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--campus-border)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCourseIds.includes(c.id)}
                    onChange={() => toggleCourse(c.id)}
                    style={{ marginTop: 4, width: 18, height: 18 }}
                  />
                  <div>
                    <div style={{ fontWeight: 800 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', marginTop: 4 }}>{c.sections.length} sections</div>
                  </div>
                </label>
              ))}
            </div>
            <button type="button" className="campus-btn-primary" style={{ marginTop: 16 }} onClick={() => setCoursePickerOpen(false)}>
              Done
            </button>
          </div>
        ) : null}

        <div className="campus-section-head">
          <h3 className="campus-section-title">Selected Courses</h3>
          <button
            type="button"
            className="campus-link"
            style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
            onClick={() => setCoursePickerOpen(true)}
          >
            Edit
          </button>
        </div>
        <div className="campus-card" style={{ marginBottom: 16 }}>
          {selectedCourseIds.length === 0 ? (
            <div style={{ color: 'var(--campus-text-muted)', fontSize: 14 }}>
              No courses selected. Tap <strong style={{ color: 'var(--campus-blue)' }}>Edit</strong> to choose courses.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {courses
                .filter((c) => selectedCourseIds.includes(c.id))
                .map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCourse(c.id)}
                    className={chipClass[idx % 3]}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      font: 'inherit',
                    }}
                    title="Tap to remove from selection"
                  >
                    {c.name.split(' - ')[0]} · {String.fromCharCode(65 + (idx % 3))}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="campus-section-head">
          <h3 className="campus-section-title">Weekly Preview</h3>
          <span style={{ fontSize: 13, color: 'var(--campus-text-muted)', fontWeight: 600 }}>Mon - Fri</span>
        </div>
        <div className="campus-card" style={{ marginBottom: 18, overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 10, minWidth: 360 }}>
            {DAYS.map((d) => (
              <div key={d} style={{ flex: 1, minWidth: 72, textAlign: 'center' }}>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>{d}</div>
                <div style={{ minHeight: 120, background: 'var(--campus-bg)', borderRadius: 12, padding: 8 }}>
                  {(byDay[d] ?? []).map((s, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: 'var(--campus-card)',
                        border: '1px solid var(--campus-border)',
                        borderRadius: 8,
                        padding: 6,
                        marginBottom: 6,
                        color: 'var(--campus-text)',
                      }}
                    >
                      {s.courseName.split(' ')[0]}
                      <div style={{ fontWeight: 500, color: 'var(--campus-text-muted)' }}>
                        {s.startTime}-{s.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="campus-section-head">
          <h3 className="campus-section-title">Suggested Plans</h3>
          <span className="campus-link" style={{ fontSize: 14 }}>
            View all
          </span>
        </div>
        {alternatives === null ? (
          <div className="campus-card" style={{ color: 'var(--campus-text-muted)' }}>
            Select courses and tap Generate.
          </div>
        ) : alternatives.length === 0 ? (
          <div className="campus-card">No conflict-free schedules found.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {alternatives.map((alt) => (
              <div key={alt.id} className="campus-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{alt.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--campus-text-muted)', marginTop: 6 }}>No conflict · {3 + (alt.id % 3)} free afternoons</div>
                  </div>
                  <button type="button" className="campus-btn-primary" style={{ width: 'auto', margin: 0, padding: '10px 18px' }} onClick={() => saveAlternative(alt)}>
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <h3 className="campus-section-title" style={{ marginBottom: 12 }}>
            Saved Schedules
          </h3>
          {saved.length === 0 ? (
            <div className="campus-card" style={{ color: 'var(--campus-text-muted)' }}>
              No saved schedules yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {saved.map((s) => (
                <div key={s.id} className="campus-card">
                  <div style={{ fontWeight: 800 }}>{s.name}</div>
                  <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    {s.sessions.map((ss, idx) => (
                      <div key={idx} style={{ color: 'var(--campus-text-muted)', fontSize: 13 }}>
                        {ss.day} · {ss.startTime}-{ss.endTime} · {ss.courseName}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
