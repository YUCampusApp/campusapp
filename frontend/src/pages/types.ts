export type WeatherSummaryResponse = {
  temperatureC: number
  condition: string
}

export type AcademicClassResponse = {
  day: string
  startTime: string
  endTime: string
  courseName: string
  classroom: string
  instructor: string
}

export type AnnouncementResponse = {
  title: string
  content: string
  time: string
}

export type ReminderResponse = {
  type: string
  message: string
}

export type FavoriteModuleResponse = {
  moduleKey: string
  label: string
}

export type WeatherCurrentDetail = {
  temperatureC: number
  condition: string
  feelsLikeC: number
  humidityPct: number
  windKmh: number
}

export type WeatherDaily = {
  dayLabel: string
  condition: string
  highC: number
  lowC: number
}

export type WeatherDetailResponse = {
  current: WeatherCurrentDetail
  hourly: { time: string; temperatureC: number; condition: string }[]
  daily?: WeatherDaily[]
}

export type DashboardResponse = {
  welcomeMessage: string
  currentTime: string
  currentDate: string
  weather: WeatherSummaryResponse
  todaysClasses: AcademicClassResponse[]
  nextCourse: AcademicClassResponse | null
  announcements: AnnouncementResponse[]
  reminders: ReminderResponse[]
  favorites: FavoriteModuleResponse[]
}

export type CourseSectionResponse = {
  id: number
  day: string
  startTime: string
  endTime: string
  classroom: string
  instructor: string
}

export type CourseResponse = {
  id: number
  name: string
  sections: CourseSectionResponse[]
}

export type GenerateScheduleRequest = {
  selectedCourseIds: number[]
  maxAlternatives?: number
}

export type ScheduleSessionResponse = {
  day: string
  startTime: string
  endTime: string
  courseName: string
  classroom: string
  instructor: string
}

export type ScheduleAlternativeResponse = {
  id: number
  name: string
  sessions: ScheduleSessionResponse[]
}

export type SavedScheduleResponse = {
  id: number
  name: string
  sessions: ScheduleSessionResponse[]
}

export type LectureNoteResponse = {
  id: number
  courseName: string
  title: string
  uploadedByStudentNo: string
  uploadedAt: string
  fileName: string
}

export type LibrarySlotResponse = {
  slotId: number
  startTime: string
  endTime: string
  emptySeats: number
  occupancyRate: number
}

export type LibraryReservationResponse = {
  id: number
  slotId: number
  startTime: string
  endTime: string
  reservationDate?: string
  status: string
  createdAt: string
}

export type LibraryPolicyStatusResponse = {
  reservationBlocked: boolean
  blockedUntil: string | null
  message: string | null
}

export type ShuttleStopResponse = {
  id: number
  name: string
}

export type ShuttleEtaResponse = {
  stopId: number
  busName: string
  etaMinutes: number
}

export type BuildingResponse = {
  buildingCode: string
  name: string
  classroomCodes: string[]
}

export type NotificationResponse = {
  id: number
  type: string
  message: string
  createdAt: string
  read: boolean
}

