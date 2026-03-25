import { ScreenHeader } from '../components/ScreenHeader'

export function LibraryManagementPage() {
  return (
    <div className="campus-page fade-in">
      <ScreenHeader title="Library Management" />
      <div className="campus-content">
        <div className="campus-card p-4">
          <p>Welcome, Library Staff.</p>
          <p>Here you can confirm student reservations.</p>
        </div>
      </div>
    </div>
  )
}
