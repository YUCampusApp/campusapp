import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { apiFetch, credFetchJson, persistAccessToken } from '../lib/api'

export type AuthUser = {
  id: number
  name: string
  email: string
  studentNo: string
  department: string
  classYear: number | null
}

type Captcha = {
  captchaId: string
  captchaCode: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  captcha: Captcha | null
  error: string | null
  refreshCaptcha: () => Promise<void>
  login: (args: { studentNo: string; password: string; captchaId: string; captchaCode: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [captcha, setCaptcha] = useState<Captcha | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshCaptcha = async () => {
    const data = await credFetchJson<Captcha>('/api/auth/captcha', { method: 'GET' })
    setCaptcha(data)
  }

  const logout = async () => {
    const res = await apiFetch('/api/auth/logout', { method: 'POST' })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `Logout failed: ${res.status}`)
    }
    if (Capacitor.isNativePlatform()) {
      persistAccessToken(null)
    }
    setUser(null)
  }

  const performLogin = async (args: { studentNo: string; password: string; captchaId: string; captchaCode: string }) => {
    setError(null)
    const data = await credFetchJson<AuthUser & { accessToken?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(args),
    })
    if (Capacitor.isNativePlatform() && data.accessToken) {
      persistAccessToken(data.accessToken)
    }
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      studentNo: data.studentNo,
      department: data.department,
      classYear: data.classYear,
    })
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await credFetchJson<AuthUser>('/api/auth/me', { method: 'GET' })
        setUser(me)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

  useEffect(() => {
    refreshCaptcha().catch(() => {
      // ignore; login page will show an error if needed
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      captcha,
      error,
      refreshCaptcha,
      login: async (args) => {
        try {
          await performLogin(args)
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Login failed')
          throw e
        }
      },
      logout,
    }),
    [user, loading, captcha, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

