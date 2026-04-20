import { useCallback, useEffect, useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { apiFetch, getJson, patchJson, postJson } from '../lib/api'
import { ScreenHeader } from '../components/ScreenHeader'
import type { MarketItemResponse } from './types'

const btnBase: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  border: 'none',
  cursor: 'pointer',
  fontSize: 22,
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'inherit',
}

export function MarketManagementPage() {
  const [items, setItems] = useState<MarketItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newStock, setNewStock] = useState('0')
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; item: string } | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await getJson<MarketItemResponse[]>('/api/market/items')
      setItems(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load market items.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems().catch(() => {})
  }, [loadItems])

  const adjust = async (id: number, delta: 1 | -1) => {
    setBusyId(id)
    setError(null)
    try {
      await patchJson<MarketItemResponse>(`/api/market/items/${id}/stock/admin`, { delta })
      await loadItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update stock.')
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteSubmitting(true)
    setError(null)
    try {
      const res = await apiFetch(`/api/market/items/${deleteTarget.id}/admin`, { method: 'DELETE' })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Request failed (${res.status})`)
      }
      setDeleteTarget(null)
      await loadItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete item.')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const submitAdd = async () => {
    const name = newName.trim()
    const stockNum = Number.parseInt(newStock, 10)
    if (!name) {
      setError('Please enter an item name.')
      return
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
      setError('Stock must be a non-negative number.')
      return
    }
    setAddSubmitting(true)
    setError(null)
    try {
      await postJson<MarketItemResponse>('/api/market/items/admin', { item: name, stock: stockNum })
      setNewName('')
      setNewStock('0')
      setAddOpen(false)
      await loadItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add item.')
    } finally {
      setAddSubmitting(false)
    }
  }

  return (
    <div className="campus-page fade-in">
      <ScreenHeader title="Market Admin" />
      <div className="campus-content">
        <div className="campus-card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Inventory</div>
          <div style={{ color: 'var(--campus-text-muted)', fontSize: 14 }}>
            Adjust stock with − and +, remove a product with the trash icon, or add a new product. When stock is zero, − is hidden and the item shows as out of stock.
          </div>
          <button
            type="button"
            className="campus-pill campus-pill--blue"
            style={{ marginTop: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800 }}
            onClick={() => {
              setAddOpen(true)
              setError(null)
            }}
          >
            Add item
          </button>
        </div>

        {error ? <div className="campus-error">{error}</div> : null}

        {loading ? (
          <div className="campus-card">Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((row) => (
              <div
                key={row.id}
                className="campus-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    aria-label="Delete product"
                    onClick={() => {
                      setError(null)
                      setDeleteTarget({ id: row.id, item: row.item })
                    }}
                    style={{
                      ...btnBase,
                      background: 'rgba(148, 163, 184, 0.12)',
                      color: 'var(--campus-text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={20} strokeWidth={2.25} />
                  </button>
                  {row.stock > 0 ? (
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      aria-label="Decrease stock"
                      onClick={() => adjust(row.id, -1)}
                      style={{
                        ...btnBase,
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        flexShrink: 0,
                      }}
                    >
                      <Minus size={22} strokeWidth={2.5} />
                    </button>
                  ) : (
                    <div style={{ width: 44, flexShrink: 0 }} aria-hidden />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{row.item}</div>
                    {row.stock === 0 ? (
                      <div style={{ color: '#ef4444', fontSize: 13, fontWeight: 700, marginTop: 4 }}>Out of stock</div>
                    ) : (
                      <div style={{ color: 'var(--campus-text-muted)', fontSize: 13, marginTop: 4 }}>{row.stock} in stock</div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busyId === row.id}
                  aria-label="Increase stock"
                  onClick={() => adjust(row.id, 1)}
                  style={{
                    ...btnBase,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    flexShrink: 0,
                  }}
                >
                  <Plus size={22} strokeWidth={2.5} />
                </button>
              </div>
            ))}
            {items.length === 0 ? (
              <div className="campus-card" style={{ color: 'var(--campus-text-muted)', fontWeight: 600 }}>
                No products yet. Use Add item to create one.
              </div>
            ) : null}
          </div>
        )}

        {deleteTarget ? (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => !deleteSubmitting && setDeleteTarget(null)}
            onKeyDown={(e) => e.key === 'Escape' && !deleteSubmitting && setDeleteTarget(null)}
            role="presentation"
          >
            <div
              className="campus-card"
              style={{ maxWidth: 400, width: '100%', padding: 20 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="market-delete-title"
            >
              <h3 id="market-delete-title" style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 800 }}>
                Delete product?
              </h3>
              <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--campus-text-muted)', lineHeight: 1.5 }}>
                Are you sure you want to delete &quot;{deleteTarget.item}&quot;? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="campus-pill"
                  style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
                  disabled={deleteSubmitting}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="campus-pill"
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 800,
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                  }}
                  disabled={deleteSubmitting}
                  onClick={() => confirmDelete().catch(() => {})}
                >
                  {deleteSubmitting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {addOpen ? (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => !addSubmitting && setAddOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && !addSubmitting && setAddOpen(false)}
            role="presentation"
          >
            <div
              className="campus-card"
              style={{ maxWidth: 400, width: '100%', padding: 20 }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="market-add-title"
            >
              <h3 id="market-add-title" style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>
                Add item
              </h3>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--campus-text-muted)' }}>
                Product name
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: 14,
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid var(--campus-border)',
                  background: 'var(--campus-card)',
                  color: 'var(--campus-text)',
                  fontFamily: 'inherit',
                  fontSize: 15,
                }}
                placeholder="e.g. Bottled Water 0.5L"
              />
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--campus-text-muted)' }}>
                Initial stock
              </label>
              <input
                type="number"
                min={0}
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: 18,
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid var(--campus-border)',
                  background: 'var(--campus-card)',
                  color: 'var(--campus-text)',
                  fontFamily: 'inherit',
                  fontSize: 15,
                }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="campus-pill"
                  style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
                  disabled={addSubmitting}
                  onClick={() => setAddOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="campus-pill campus-pill--blue"
                  style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800 }}
                  disabled={addSubmitting}
                  onClick={() => submitAdd().catch(() => {})}
                >
                  {addSubmitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
