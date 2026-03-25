import { ScreenHeader } from '../components/ScreenHeader'

export function CafeteriaManagementPage() {
  return (
    <div className="campus-page fade-in">
      <ScreenHeader title="Cafeteria Management" />
      <div className="campus-content">
        <div className="campus-card p-4">
          <p>Welcome, Cafeteria Personnel.</p>
          <p>Here you can enter all upcoming meals for the day so students see it on the app.</p>
        </div>
      </div>
    </div>
  )
}
