export default function DashboardTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard Test</h1>
      <p>If you can see this, routing is working!</p>
      <a href="/dashboard" className="text-blue-600 underline">
        Go to real dashboard
      </a>
    </div>
  )
}