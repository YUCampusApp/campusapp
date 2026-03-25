import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { BottomTabBar } from '../components/BottomTabBar'
import { CampusSidebar } from '../components/CampusSidebar'

export function DashboardShell() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="campus-app">
      <div className="campus-layout">
        <CampusSidebar onLogout={handleLogout} />
        <main className="campus-main">
          <Outlet />
        </main>
      </div>
      <BottomTabBar />
    </div>
  )
}
