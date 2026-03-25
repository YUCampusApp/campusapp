import {
  Bell,
  BookOpen,
  Bus,
  CloudSun,
  GraduationCap,
  Home,
  LibraryBig,
  LogOut,
  MapPinned,
  Puzzle,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function SideLink({
  to,
  end,
  label,
  Icon,
}: {
  to: string
  end?: boolean
  label: string
  Icon: React.ComponentType<{ size?: number }>
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `campus-sidebar__link${isActive ? ' campus-sidebar__link--active' : ''}`}
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

export function CampusSidebar({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth()

  return (
    <aside className="campus-sidebar">
      <div className="campus-sidebar__brand">Yeditepe Campus</div>
      <SideLink to="/dashboard" end label="Home" Icon={Home} />
      <SideLink to="/dashboard/weather" label="Weather" Icon={CloudSun} />
      <SideLink to="/dashboard/academic" label="Academic" Icon={GraduationCap} />
      <SideLink to="/dashboard/schedule" label="Course Combinator" Icon={Puzzle} />
      <SideLink to="/dashboard/library" label="Library" Icon={LibraryBig} />
      <SideLink to="/dashboard/lecture-notes" label="Notes" Icon={BookOpen} />
      <SideLink to="/dashboard/shuttle" label="Shuttle" Icon={Bus} />
      <SideLink to="/dashboard/campus-map" label="Campus Map" Icon={MapPinned} />
      <SideLink to="/dashboard/notifications" label="Notifications" Icon={Bell} />
      <div style={{ flex: 1 }} />
      <div style={{ padding: '8px 10px', fontSize: 13, color: 'var(--campus-text-muted)', fontWeight: 600 }}>
        {user?.name}
      </div>
      <button
        type="button"
        className="campus-sidebar__link"
        onClick={onLogout}
        style={{ border: 'none', width: '100%', cursor: 'pointer', background: 'none', textAlign: 'left' }}
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  )
}
