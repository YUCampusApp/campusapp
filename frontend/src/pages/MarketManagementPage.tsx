import { ScreenHeader } from '../components/ScreenHeader'

export function MarketManagementPage() {
  return (
    <div className="campus-page fade-in">
      <ScreenHeader title="Market Management" />
      <div className="campus-content">
        <div className="campus-card p-4">
          <p>Welcome, Market Personnel.</p>
          <p>Enter items and update stock levels directly from this dashboard.</p>
        </div>
      </div>
    </div>
  )
}
