/* eslint-disable  @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation'
import DashboardStats from './components/DashboardStats'
import RecentProjects from './components/RecentProjects'
import { createClient } from '@/lib/supabase/client'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get stats based on role
  let stats
  if (profile?.role === 'admin') {
    // Admin stats
    const [projectsCount, clientsCount, pendingCount, revenueData] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'client'),
      supabase.from('projects').select('id', { count: 'exact' }).eq('status', 'inquiry'),
      supabase.from('invoices').select('total_amount').eq('status', 'paid'),
    ])

    const totalRevenue = revenueData.data?.reduce((sum: any, inv: any) => sum + Number(inv.total_amount), 0) || 0

    stats = {
      totalProjects: projectsCount.count || 0,
      totalClients: clientsCount.count || 0,
      pendingInquiries: pendingCount.count || 0,
      totalRevenue: totalRevenue,
    }
  } else {
    // Client stats
    const [projectsData, invoicesData] = await Promise.all([
      supabase
        .from('projects')
        .select('id, status', { count: 'exact' })
        .eq('client_id', user.id),
      supabase
        .from('invoices')
        .select('total_amount, status')
        .eq('project_id', user.id),
    ])

    const activeProjects = projectsData.data?.filter((p: any) => p.status === 'in_progress').length || 0
    const totalSpent = invoicesData.data
      ?.filter((inv: any) => inv.status === 'paid')
      .reduce((sum: any, inv: any) => sum + Number(inv.total_amount), 0) || 0

    stats = {
      totalProjects: projectsData.count || 0,
      activeProjects,
      totalSpent,
      pendingInvoices: invoicesData.data?.filter((inv: any) => inv.status === 'pending').length || 0,
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || user.email}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s an overview of your {profile?.role === 'admin' ? 'business' : 'projects'}
        </p>
      </div>

      <DashboardStats stats={stats} role={profile?.role || 'client'} />
      
      <div className="mt-8">
        <RecentProjects userId={user.id} role={profile?.role || 'client'} />
      </div>
    </div>
  )
}