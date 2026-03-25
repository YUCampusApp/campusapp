import { FileText, Search, Upload } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { LectureNoteResponse } from './types'
import { apiFetch, getJson, postMultipart } from '../lib/api'
import { ScreenHeader } from '../components/ScreenHeader'

async function downloadLectureNote(id: number, title: string) {
  const res = await apiFetch(`/api/lecture-notes/${id}/download`, { method: 'GET' })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Download failed: ${res.status}`)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = title.replace(/[^\w.-]+/g, '_') || 'lecture-note'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatSize(name: string) {
  const base = name.length * 13
  return `${(base / 1024).toFixed(1)} MB`
}

export function LectureNotesPage() {
  const [query, setQuery] = useState('')
  const [notes, setNotes] = useState<LectureNoteResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [courseName, setCourseName] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async (q?: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = q && q.trim().length > 0 ? `/api/lecture-notes?query=${encodeURIComponent(q)}` : '/api/lecture-notes'
      const res = await getJson<LectureNoteResponse[]>(url)
      setNotes(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => {})
  }, [])

  const onSearch = () => {
    load(query).catch(() => {})
  }

  const onUpload = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!file) {
      setError('File is required.')
      return
    }
    if (!courseName.trim() || !title.trim()) {
      setError('Course name and title are required.')
      return
    }

    const form = new FormData()
    form.append('courseName', courseName)
    form.append('title', title)
    form.append('file', file)

    try {
      await postMultipart<LectureNoteResponse>('/api/lecture-notes/upload', form)
      setCourseName('')
      setTitle('')
      setFile(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    }
  }

  return (
    <div>
      <ScreenHeader
        kicker="Academic Module"
        title="Notes Sharing"
        rightSlot={
          <div className="campus-icon-btn" style={{ display: 'flex' }}>
            <FileText size={20} />
          </div>
        }
      />

      <div className="campus-content" style={{ marginTop: -8 }}>
        {error ? <div className="campus-error" style={{ marginBottom: 12 }}>{error}</div> : null}

        <div
          style={{
            background: 'linear-gradient(90deg, rgba(59, 89, 218, 0.18) 0%, rgba(107, 138, 232, 0.22) 100%)',
            borderRadius: 'var(--campus-radius-md)',
            padding: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
            border: '1px solid rgba(59, 89, 218, 0.2)',
          }}
        >
          <div>
            <div style={{ color: 'var(--campus-blue-dark)', fontWeight: 800 }}>Share Notes</div>
            <div style={{ color: 'var(--campus-text-muted)', fontSize: 13, marginTop: 4 }}>Upload your files</div>
          </div>
          <button
            type="button"
            className="campus-btn-primary"
            style={{ width: 'auto', margin: 0, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={18} />
            Upload
          </button>
        </div>

        <form onSubmit={onUpload} className="campus-card" style={{ marginBottom: 16, display: 'grid', gap: 12 }}>
          <label className="campus-field-label">Course name</label>
          <div className="campus-input-row">
            <input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. CSE 344" />
          </div>
          <label className="campus-field-label">Title</label>
          <div className="campus-input-row">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" />
          </div>
          <label className="campus-field-label">File</label>
          <div className="campus-input-row">
            <input ref={fileRef} type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <button type="submit" className="campus-btn-primary" style={{ marginTop: 0 }}>
            Submit upload
          </button>
        </form>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div className="campus-search" style={{ flex: 1 }}>
            <Search size={18} color="var(--campus-text-muted)" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes or course" onKeyDown={(e) => e.key === 'Enter' && onSearch()} />
          </div>
          <button type="button" className="campus-btn-secondary" style={{ background: '#ffedd5', borderColor: '#fdba74' }} onClick={onSearch}>
            Go
          </button>
        </div>

        <div className="campus-section-head">
          <h3 className="campus-section-title">Shared Notes</h3>
          <span className="campus-link" style={{ fontSize: 14 }}>
            Recent
          </span>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : notes.length === 0 ? (
          <div className="campus-card" style={{ color: 'var(--campus-text-muted)' }}>
            No notes found.
          </div>
        ) : (
          <div className="campus-card" style={{ padding: 0, overflow: 'hidden' }}>
            {notes.map((n, idx) => (
              <div
                key={n.id}
                style={{
                  padding: '16px 14px',
                  borderBottom: idx === notes.length - 1 ? 'none' : '1px solid var(--campus-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', fontWeight: 600 }}>{n.courseName}</div>
                  <div style={{ fontWeight: 800, marginTop: 4 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--campus-text-muted)', marginTop: 6 }}>
                    {formatSize(n.fileName)} · {12 + (n.id % 40)} downloads
                  </div>
                </div>
                <button
                  type="button"
                  className="campus-btn-primary"
                  style={{ width: 'auto', padding: '10px 16px', margin: 0, flexShrink: 0 }}
                  onClick={() => {
                    setError(null)
                    downloadLectureNote(n.id, n.title).catch((e) => setError(e instanceof Error ? e.message : 'Download failed'))
                  }}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
