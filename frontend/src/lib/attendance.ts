const KEY = 'campus_attendance_v1'

export type AttendanceRecord = {
  absences: number
  updatedAt: string
}

export type AttendanceStore = Record<string, AttendanceRecord>

export function readAttendance(): AttendanceStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const p = JSON.parse(raw) as unknown
    return p && typeof p === 'object' ? (p as AttendanceStore) : {}
  } catch {
    return {}
  }
}

export function writeAttendance(store: AttendanceStore) {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export function addAbsences(courseId: number, delta: number) {
  if (delta <= 0) return
  const id = String(courseId)
  const store = readAttendance()
  const prev = store[id]?.absences ?? 0
  store[id] = {
    absences: prev + delta,
    updatedAt: new Date().toISOString(),
  }
  writeAttendance(store)
  return store[id]
}

/** Increase or decrease absences; count is clamped at 0. */
export function adjustAbsences(courseId: number, delta: number) {
  if (delta === 0) return
  const id = String(courseId)
  const store = readAttendance()
  const prev = store[id]?.absences ?? 0
  const next = Math.max(0, prev + delta)
  store[id] = {
    absences: next,
    updatedAt: new Date().toISOString(),
  }
  writeAttendance(store)
  return store[id]
}

export function getCourseAttendance(courseId: number): AttendanceRecord | undefined {
  return readAttendance()[String(courseId)]
}
