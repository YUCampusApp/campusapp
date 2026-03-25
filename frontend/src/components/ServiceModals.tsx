import { X, Calendar as CalendarIcon, Package, Coffee, ShoppingBag, PenLine } from 'lucide-react'
import { useState } from 'react'

export function ServiceModal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--campus-bg)',
          width: '100%',
          height: '85vh',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '24px 24px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--campus-border)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--campus-text)' }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--campus-card)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--campus-shadow)',
            }}
          >
            <X size={20} color="var(--campus-text)" />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export function CafeteriaContent() {
  const [tab, setTab] = useState<'student' | 'staff'>('student')

  const studentMenu = [
    { title: 'Soups', items: ['Tomato Soup', 'Lentil Soup'] },
    { title: 'Mains', items: ['Chicken Sauté with Vegetables', 'Pasta with Tomato Sauce', 'Vegan Meatballs'] },
    { title: 'Sides', items: ['Rice Pilaf', 'French Fries'] },
    { title: 'Salads & Desserts', items: ['Seasonal Salad', 'Chocolate Pudding', 'Ayran'] },
  ]

  const staffMenu = [
    { title: 'Soups', items: ['Cream of Mushroom Soup', 'Ezo Gelin Soup'] },
    { title: 'Mains', items: ['Grilled Steak Bites', 'Oven-baked Salmon', 'Roasted Eggplant'] },
    { title: 'Sides', items: ['Quinoa Salad', 'Mashed Potatoes'] },
    { title: 'Salads & Desserts', items: ['Caesar Salad', 'Cheesecake', 'Fresh Orange Juice'] },
  ]

  const activeMenu = tab === 'student' ? studentMenu : staffMenu

  return (
    <div>
      <div style={{ display: 'flex', background: 'var(--campus-card)', padding: 6, borderRadius: 16, marginBottom: 24 }}>
        <button
          onClick={() => setTab('student')}
          style={{
            flex: 1,
            padding: '12px',
            background: tab === 'student' ? 'var(--campus-blue)' : 'transparent',
            color: tab === 'student' ? '#fff' : 'var(--campus-text-muted)',
            fontWeight: 800,
            border: 'none',
            borderRadius: 12,
            transition: 'all 0.2s',
          }}
        >
          Student Menu
        </button>
        <button
          onClick={() => setTab('staff')}
          style={{
            flex: 1,
            padding: '12px',
            background: tab === 'staff' ? 'var(--campus-blue)' : 'transparent',
            color: tab === 'staff' ? '#fff' : 'var(--campus-text-muted)',
            fontWeight: 800,
            border: 'none',
            borderRadius: 12,
            transition: 'all 0.2s',
          }}
        >
          Staff Menu
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {activeMenu.map((section, i) => (
          <div key={i} className="campus-card">
            <h4 style={{ margin: '0 0 12px 0', fontSize: 16, color: 'var(--campus-blue)', fontWeight: 800 }}>{section.title}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {section.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--campus-blue)' }} />
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StockGrid({ items, tint }: { items: { name: string; stock: number; icon: React.ReactNode }[]; tint: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
      {items.map((item, i) => (
        <div key={i} className="campus-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {item.icon}
          </div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{item.name}</div>
          <div style={{ marginTop: 'auto', background: item.stock > 10 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: item.stock > 10 ? '#10b981' : '#ef4444', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 800 }}>
            {item.stock} in stock
          </div>
        </div>
      ))}
    </div>
  )
}

export function StationeryContent() {
  const items = [
    { name: 'A4 Lined Notebook', stock: 42, icon: <PenLine size={28} color="#eab308" /> },
    { name: 'Blue Ballpoint Pen', stock: 150, icon: <PenLine size={28} color="#eab308" /> },
    { name: 'Campus T-Shirt (M)', stock: 5, icon: <Package size={28} color="#eab308" /> },
    { name: 'Eraser', stock: 85, icon: <Package size={28} color="#eab308" /> },
    { name: 'Graphing Calculator', stock: 2, icon: <Package size={28} color="#eab308" /> },
    { name: 'Water Bottle', stock: 12, icon: <Package size={28} color="#eab308" /> },
  ]
  return <StockGrid items={items} tint="rgba(234, 179, 8, 0.1)" />
}

export function MarketContent() {
  const items = [
    { name: 'Bottled Water 0.5L', stock: 120, icon: <ShoppingBag size={28} color="#10b981" /> },
    { name: 'Energy Drink', stock: 35, icon: <ShoppingBag size={28} color="#10b981" /> },
    { name: 'Mixed Nuts', stock: 18, icon: <ShoppingBag size={28} color="#10b981" /> },
    { name: 'Sandwich (Cheese)', stock: 0, icon: <ShoppingBag size={28} color="#10b981" /> },
    { name: 'Chocolate Bar', stock: 65, icon: <ShoppingBag size={28} color="#10b981" /> },
    { name: 'Filter Coffee', stock: 40, icon: <Coffee size={28} color="#10b981" /> },
  ]
  return <StockGrid items={items} tint="rgba(16, 185, 129, 0.1)" />
}

export function HairdresserContent() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedHour, setSelectedHour] = useState<string | null>(null)
  const [bookedDays, setBookedDays] = useState<number[]>([])
  const [justBooked, setJustBooked] = useState(false)

  // Dummy monthly calendar generation (30 days)
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const fullDays = [2, 5, 6, 12, 18, 19, 21, 25, 26] // Pre-booked/full days

  const availableHours = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']

  const handleBook = () => {
    if (selectedDay !== null && selectedHour !== null) {
      // In a real app we'd save {day, hour}, here we just mark the day
      setBookedDays([...bookedDays, selectedDay])
      setJustBooked(true)
      setTimeout(() => {
        setJustBooked(false)
        setSelectedDay(null)
        setSelectedHour(null)
      }, 2000)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="campus-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CalendarIcon size={24} color="#a855f7" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>March 2026</div>
          <div style={{ fontSize: 13, color: 'var(--campus-text-muted)', marginTop: 4 }}>Select a green day to book</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontWeight: 800, color: 'var(--campus-text-muted)', fontSize: 13, paddingBottom: 8 }}>{d}</div>
        ))}
        {/* Padding for start of month */}
        <div /> <div /> <div />
        {days.map(d => {
          const isFull = fullDays.includes(d)
          const isNewlyBooked = bookedDays.includes(d)
          const isAvailable = !isFull && !isNewlyBooked
          const isSelected = selectedDay === d && isAvailable

          return (
            <button
              key={d}
              disabled={!isAvailable}
              onClick={() => {
                if (isAvailable) {
                  setSelectedDay(d)
                  setSelectedHour(null) // Reset hour on day change
                }
              }}
              style={{
                aspectRatio: '1',
                borderRadius: '50%',
                border: isSelected ? '2px solid var(--campus-blue)' : 'none',
                background: isNewlyBooked ? 'var(--campus-blue)' : isFull ? 'rgba(239, 68, 68, 0.1)' : isSelected ? 'transparent' : 'rgba(16, 185, 129, 0.1)',
                color: isNewlyBooked ? '#fff' : isFull ? '#ef4444' : isSelected ? 'var(--campus-blue)' : '#10b981',
                fontWeight: 800,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                opacity: isFull ? 0.6 : 1
              }}
            >
              {d}
            </button>
          )
        })}
      </div>

      {selectedDay && !justBooked && (
        <div style={{ marginTop: 'auto', animation: 'scale-up 0.2s ease-out' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Select Time for March {selectedDay}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {availableHours.map((hour) => {
              // Simulate some randomly booked hours for MVP
              const isHourFull = hour === '11:00' || hour === '14:00'
              const selected = selectedHour === hour && !isHourFull
              return (
                <button
                  key={hour}
                  disabled={isHourFull}
                  onClick={() => !isHourFull && setSelectedHour(hour)}
                  style={{
                    padding: '10px 0',
                    borderRadius: 12,
                    border: selected ? '2px solid var(--campus-blue)' : '1px solid var(--campus-border)',
                    background: isHourFull ? 'rgba(15,23,42,0.05)' : selected ? 'rgba(59,89,218,0.1)' : 'var(--campus-card)',
                    color: isHourFull ? 'var(--campus-text-muted)' : selected ? 'var(--campus-blue)' : 'var(--campus-text)',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: isHourFull ? 'not-allowed' : 'pointer',
                    opacity: isHourFull ? 0.5 : 1
                  }}
                >
                  {hour}
                </button>
              )
            })}
          </div>

          <div className="campus-card" style={{ border: selectedHour ? '2px solid var(--campus-blue)' : '2px solid var(--campus-border)', transition: 'all 0.2s' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Confirm Appointment</h3>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--campus-text-muted)' }}>
              {selectedHour 
                ? `You selected March ${selectedDay}, 2026 at ${selectedHour}. Ready to book?`
                : 'Please select an available time slot above.'}
            </p>
            <button
              onClick={handleBook}
              disabled={!selectedHour}
              style={{ width: '100%', padding: 14, background: selectedHour ? 'var(--campus-blue)' : 'var(--campus-border)', color: selectedHour ? '#fff' : 'var(--campus-text-muted)', fontWeight: 800, fontSize: 16, border: 'none', borderRadius: 12, cursor: selectedHour ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
            >
              Book Now
            </button>
          </div>
        </div>
      )}

      {justBooked && (
        <div style={{ marginTop: 'auto', textAlign: 'center', padding: 20, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 16, color: '#10b981', fontWeight: 800 }}>
          🎉 Appointment successfully booked!
        </div>
      )}
    </div>
  )
}
