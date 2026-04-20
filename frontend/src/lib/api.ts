import { Capacitor } from '@capacitor/core'

const TOKEN_KEY = 'yeditepe_campus_token'

export function apiUrl(path: string): string {
  let raw = import.meta.env.VITE_API_URL?.trim() ?? ''
  if (!raw && Capacitor.isNativePlatform()) {
    if (Capacitor.getPlatform() === 'android') {
      raw = 'http://10.0.2.2:8081'
    } else if (Capacitor.getPlatform() === 'ios') {
      raw = 'http://localhost:8081'
    }
  }
  
  const base = raw.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${p}` : p
}

export function getPersistedAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function persistAccessToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

function mergeHeaders(base?: HeadersInit): Headers {
  const h = new Headers(base ?? undefined)
  const t = getPersistedAccessToken()
  if (t) h.set('Authorization', `Bearer ${t}`)
  return h
}

async function readError(res: Response): Promise<string> {
  const text = await res.text().catch(() => '')
  if (!text) return `Request failed: ${res.status}`
  try {
    const j = JSON.parse(text) as { message?: string; error?: string }
    if (typeof j.message === 'string' && j.message) return j.message
    if (typeof j.error === 'string' && j.error) return j.error
  } catch {
    /* plain text body */
  }
  return text
}

export async function credFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = mergeHeaders(init?.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(apiUrl(path), {
    ...init,
    credentials: 'include',
    headers,
  })
  if (!res.ok) {
    throw new Error(await readError(res))
  }
  return (await res.json()) as T
}

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), {
    credentials: 'include',
    headers: mergeHeaders(),
  })
  if (!res.ok) {
    throw new Error(await readError(res))
  }
  return (await res.json()) as T
}

export async function fetchJson<T>(path: string): Promise<T> {
  return getJson<T>(path)
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const headers = mergeHeaders({ 'Content-Type': 'application/json' })
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(await readError(res))
  }
  const raw = await res.text()
  if (!raw.trim()) return undefined as T
  return JSON.parse(raw) as T
}

export async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const headers = mergeHeaders({ 'Content-Type': 'application/json' })
  const res = await fetch(apiUrl(path), {
    method: 'PATCH',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(await readError(res))
  }
  const raw = await res.text()
  if (!raw.trim()) return undefined as T
  return JSON.parse(raw) as T
}

/** POST JSON body; server returns 200 with empty body. */
export async function postJsonNoContent(path: string, body: unknown): Promise<void> {
  const headers = mergeHeaders({ 'Content-Type': 'application/json' })
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(await readError(res))
  }
}

export async function postMultipart<T>(path: string, form: FormData): Promise<T> {
  const headers = mergeHeaders()
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers,
    body: form,
  })
  if (!res.ok) {
    throw new Error(await readError(res))
  }
  return (await res.json()) as T
}

/** Low-level request with auth headers; use for DELETE/POST without JSON body. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { headers: hdrs, ...rest } = init
  return fetch(apiUrl(path), {
    credentials: 'include',
    headers: mergeHeaders(hdrs),
    ...rest,
  })
}
