import {
  BookOpen,
  Bus,
  GraduationCap,
  Home,
  LibraryBig,
  MapPinned,
  Scissors,
  User,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getServiceAdminRole, isServiceAdminUser } from '../auth/roleUtils'

type TabItemProps = {
  to: string
  end?: boolean
  label: string
  Icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>
  active?: boolean
}

function TabItem({ to, end, label, Icon, active }: TabItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={() => `campus-tab${active ? ' campus-tab--active' : ''}`}
    >
      <Icon className="campus-tab__icon" size={22} strokeWidth={active ? 2.5 : 2} />
      {label}
    </NavLink>
  )
}

export function BottomTabBar() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const isServiceAdmin = isServiceAdminUser(user)
  const serviceAdminRole = getServiceAdminRole(user)

  const homeActive =
    pathname === '/dashboard' ||
    pathname === '/dashboard/' ||
    pathname.includes('/weather') ||
    pathname.includes('/notifications')
  const academicActive = pathname.startsWith('/dashboard/academic') || pathname.startsWith('/dashboard/schedule')
  const profileActive = pathname.startsWith('/dashboard/profile')
  const libraryActive = pathname.includes('/library')
  const notesActive = pathname.includes('/lecture-notes')
  const shuttleActive = pathname.includes('/shuttle')
  const mapActive = pathname.includes('/campus-map')

  if (pathname.includes('/library-management')) {
    return (
      <nav className="campus-tabbar">
        <TabItem to="/dashboard" end label="Home" Icon={Home} active={homeActive} />
        <TabItem to="/dashboard/library-management" end label="Library Admin" Icon={LibraryBig} active />
        <TabItem to="/dashboard/profile" label="Profile" Icon={User} active={profileActive} />
      </nav>
    )
  }

  if (pathname.includes('/hairdresser-management')) {
    return (
      <nav className="campus-tabbar">
        <TabItem to="/dashboard" end label="Home" Icon={Home} active={homeActive} />
        <TabItem to="/dashboard/hairdresser-management" end label="Hairdresser Admin" Icon={Scissors} active />
        <TabItem to="/dashboard/profile" label="Profile" Icon={User} active={profileActive} />
      </nav>
    )
  }

  if (pathname.includes('/library')) {
    return (
      <nav className="campus-tabbar">
        <TabItem to="/dashboard" end label="Home" Icon={Home} active={homeActive && !libraryActive} />
        <TabItem to="/dashboard/library" end label="Library" Icon={LibraryBig} active={libraryActive} />
        <TabItem to="/dashboard/profile" label="Profile" Icon={User} active={profileActive} />
      </nav>
    )
  }

  if (pathname.includes('/lecture-notes')) {
    return (
      <nav className="campus-tabbar">
        <TabItem to="/dashboard" end label="Home" Icon={Home} active={homeActive && !notesActive} />
        <TabItem to="/dashboard/lecture-notes" end label="Notes" Icon={BookOpen} active={notesActive} />
        <TabItem to="/dashboard/profile" label="Profile" Icon={User} active={profileActive} />
      </nav>
    )
  }

  if (pathname.includes('/shuttle')) {
    return (
      <nav className="campus-tabbar">
        <TabItem to="/dashboard" end label="Home" Icon={Home} active={homeActive && !shuttleActive} />
        <TabItem to="/dashboard/shuttle" end label="Shuttle" Icon={Bus} active={shuttleActive} />
        <TabItem to="/dashboard/profile" label="Profile" Icon={User} active={profileActive} />
      </nav>
    )
  }

  if (pathname.includes('/campus-map')) {
    return (
      <nav className="campus-tabbar">
        <TabItem to="/dashboard/campus-map" end label="Map" Icon={MapPinned} active={mapActive} />
        <TabItem to="/dashboard" end label="Home" Icon={Home} active={homeActive && !mapActive} />
        <TabItem to="/dashboard/profile" label="Profile" Icon={User} active={profileActive} />
      </nav>
    )
  }

  if (pathname.startsWith('/dashboard/schedule')) {
    return (
      <nav className="campus-tabbar">
        <TabItem to="/dashboard" end label="Home" Icon={Home} active={homeActive} />
        <TabItem to="/dashboard/schedule" end label="Combinator" Icon={GraduationCap} active={academicActive} />
        <TabItem to="/dashboard/profile" label="Profile" Icon={User} active={profileActive} />
      </nav>
    )
  }

  return isServiceAdmin ? (
    <nav className="campus-tabbar">
      <TabItem to="/dashboard" end label="Home" Icon={Home} active={homeActive} />
      {serviceAdminRole === 'hairdresser' ? (
        <TabItem to="/dashboard/hairdresser-management" label="Hairdresser Admin" Icon={Scissors} active={pathname.includes('/hairdresser-management')} />
      ) : (
        <TabItem to="/dashboard/library-management" label="Library Admin" Icon={LibraryBig} active={pathname.includes('/library-management')} />
      )}
      <TabItem to="/dashboard/profile" label="Profile" Icon={User} active={profileActive} />
    </nav>
  ) : (
    <nav className="campus-tabbar">
      <TabItem to="/dashboard" end label="Home" Icon={Home} active={homeActive} />
      <TabItem to="/dashboard/academic" label="Academic" Icon={GraduationCap} active={academicActive} />
      <TabItem to="/dashboard/profile" label="Profile" Icon={User} active={profileActive} />
    </nav>
  )
}
