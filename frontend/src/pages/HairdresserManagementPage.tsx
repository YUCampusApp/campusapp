import { ScreenHeader } from '../components/ScreenHeader'

export function HairdresserManagementPage() {
  return (
    <div className="campus-page fade-in">
      <ScreenHeader title="Hairdresser Management" />
      <div className="campus-content">
        <div className="campus-card p-4">
          <p>Welcome, Hairdresser.</p>
          <p>Manage appointment times and accept student bookings from this page.</p>
        </div>
      </div>
    </div>
  )
}
