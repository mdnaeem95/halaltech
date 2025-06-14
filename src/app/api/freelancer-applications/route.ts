/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Fetch all freelancer applications (both pending and approved)
    const { data: applications, error } = await supabase
      .from('profiles')
      .select(`
        *,
        freelancer_skills (*)
      `)
      .eq('role', 'service_provider')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: applications || []
    })
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch applications' 
      },
      { status: 500 }
    )
  }
}