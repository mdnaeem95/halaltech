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
    
    console.log('Rejecting application:', id)
    
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

    // Get the application details first
    const { data: application, error: appError } = await supabase
      .from('freelancer_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (appError || !application) {
      console.error('Application not found:', appError)
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    // Update the application status
    const { error: updateAppError } = await supabase
      .from('freelancer_applications')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason || null
      })
      .eq('id', id)

    if (updateAppError) {
      console.error('Error updating application:', updateAppError)
      throw updateAppError
    }

    // If there's a user_id, clean up their freelancer data
    if (application.user_id) {
      // Delete skills
      await supabase
        .from('freelancer_skills')
        .delete()
        .eq('freelancer_id', application.user_id)

      // Delete availability (if table exists)
      try {
        await supabase
          .from('freelancer_availability')
          .delete()
          .eq('freelancer_id', application.user_id)
      } catch (e) {
        console.log('Availability table might not exist: ', e)
      }

      // Reset profile to regular user
      const { error: profileUpdateError } = await supabase
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
        .eq('id', application.user_id)

      if (profileUpdateError) {
        console.error('Error updating profile:', profileUpdateError)
        // Don't throw - application is still rejected
      }

      // Try to create a notification
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: application.user_id,
            title: 'Application Status Update',
            message: reason || 'Your freelancer application was not approved at this time. Please contact support for more information.',
            type: 'info',
            is_read: false
          })
      } catch (notifError) {
        console.log('Could not create notification:', notifError)
      }
    }

    // TODO: Send rejection email to application.email

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