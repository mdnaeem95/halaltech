/* eslint-disable  @typescript-eslint/no-explicit-any */
// src/app/api/admin/freelancer-applications/[id]/approve/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    
    console.log('Approving application:', id)
    
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

    // First, get the application details
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
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateAppError) {
      console.error('Error updating application:', updateAppError)
      throw updateAppError
    }

    // If there's a user_id, update their profile
    if (application.user_id) {
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          role: 'service_provider',
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.user_id)

      if (profileUpdateError) {
        console.error('Error updating profile:', profileUpdateError)
        // Don't throw - application is still approved
      }
    }

    // Try to create a notification (if table exists and user exists)
    if (application.user_id) {
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: application.user_id,
            title: 'Application Approved!',
            message: 'Congratulations! Your freelancer application has been approved. You can now complete your profile.',
            type: 'success',
            is_read: false
          })
      } catch (notifError) {
        console.log('Could not create notification:', notifError)
      }
    }

    // TODO: Send approval email to application.email

    return NextResponse.json({ 
      success: true, 
      message: 'Application approved successfully' 
    })
  } catch (error: any) {
    console.error('Error approving application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to approve application' 
      },
      { status: 500 }
    )
  }
}