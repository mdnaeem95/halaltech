import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from './components/DashboardSidebar'
import { Suspense } from 'react'

async function DashboardContent({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      // Let middleware handle the redirect
      return null
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <DashboardSidebar user={user} profile={profile} />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Dashboard layout error:', error)
    return null
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    }>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  )
}