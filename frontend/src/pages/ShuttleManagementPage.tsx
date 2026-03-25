import { ScreenHeader } from '../components/ScreenHeader'

export function ShuttleManagementPage() {
  return (
    <div className="campus-page fade-in">
      <ScreenHeader title="Shuttle Management" />
      <div className="campus-content">
        <div className="campus-card p-4">
          <p>Welcome, Shuttle Operator.</p>
          <p>Use this page to edit cancelled times and enter standard shuttle schedules.</p>
        </div>
      </div>
    </div>
  )
}
