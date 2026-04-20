import type { AuthUser } from './AuthContext'

export function isLibraryAdminUser(user: AuthUser | null): boolean {
  return getServiceAdminRole(user) === 'library'
}

export function isHairdresserAdminUser(user: AuthUser | null): boolean {
  return getServiceAdminRole(user) === 'hairdresser'
}

export function isServiceAdminUser(user: AuthUser | null): boolean {
  return getServiceAdminRole(user) !== null
}

export function getServiceAdminRole(user: AuthUser | null): 'library' | 'hairdresser' | null {
  if (!user) return null
  const dept = (user.department ?? '').trim().toLowerCase()
  const identifier = (user.studentNo ?? '').trim().toLowerCase()
  if (!identifier.includes('@')) return null
  if (dept === 'library') return 'library'
  if (dept === 'hairdresser') return 'hairdresser'
  return null
}
