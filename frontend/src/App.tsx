import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardShell } from './pages/DashboardShell'
import { HomeDashboardPage } from './pages/HomeDashboardPage'
import { WeatherPage } from './pages/WeatherPage'
import { AcademicPage } from './pages/AcademicPage'
import { ScheduleBuilderPage } from './pages/ScheduleBuilderPage'
import { ProfilePage } from './pages/ProfilePage'
import { LibraryReservationPage } from './pages/LibraryReservationPage'
import { LectureNotesPage } from './pages/LectureNotesPage'
import { ShuttleTrackingPage } from './pages/ShuttleTrackingPage'
import { CampusMapFinderPage } from './pages/CampusMapFinderPage'
import { NotificationsPage } from './pages/NotificationsPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardShell />
              </RequireAuth>
            }
          >
            <Route index element={<HomeDashboardPage />} />
            <Route path="weather" element={<WeatherPage />} />
            <Route path="academic" element={<AcademicPage />} />
            <Route path="schedule" element={<ScheduleBuilderPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="library" element={<LibraryReservationPage />} />
            <Route path="lecture-notes" element={<LectureNotesPage />} />
            <Route path="shuttle" element={<ShuttleTrackingPage />} />
            <Route path="campus-map" element={<CampusMapFinderPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
