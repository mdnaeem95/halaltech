/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { reason } = body
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

    // Delete freelancer-specific data
    // Delete skills
    await supabase
      .from('freelancer_skills')
      .delete()
      .eq('freelancer_id', id)

    // Delete availability (if table exists)
    try {
      await supabase
        .from('freelancer_availability')
        .delete()
        .eq('freelancer_id', id)
    } catch (e) {
      console.log('Availability table might not exist')
      console.log('Error: ', e)
    }

    // Reset profile to regular user
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'client',
        onboarding_completed: false,
        bio: null,
        hourly_rate: null,
        years_experience: 0,
        portfolio_url: null,
        linkedin_url: null,
        github_url: null,
        availability_status: null,
        is_verified: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) throw updateError

    // Create a notification for the user (if notifications table exists)
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: id,
          title: 'Application Status Update',
          message: reason || 'Your freelancer application was not approved at this time. Please contact support for more information.',
          type: 'info',
          is_read: false
        })
    } catch (notifError) {
      console.log('Notifications table might not exist:', notifError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Application rejected' 
    })
  } catch (error: any) {
    console.error('Error rejecting application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to reject application' 
      },
      { status: 500 }
    )
  }
}