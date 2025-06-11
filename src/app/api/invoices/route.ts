// src/app/api/invoices/route.ts
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    let query = supabase
      .from('invoices')
      .select(`
        *,
        project:projects (
          id,
          title,
          client:profiles!projects_client_id_fkey (
            id,
            full_name,
            company_name,
            email
          )
        )
      `)
      .order('created_at', { ascending: false })

    // If not admin, only show user's invoices
    if (!profile || profile.role === 'client') {
      // Need to get invoices for projects where user is the client
      const { data: userProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', user.id)
      
      if (userProjects) {
        const projectIds = userProjects.map(p => p.id)
        query = query.in('project_id', projectIds)
      }
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Invoices fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch invoices' 
      },
      { status: 500 }
    )
  }
}