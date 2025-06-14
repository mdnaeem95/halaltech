/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
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

    // Update freelancer profile to mark as approved
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        is_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('role', 'service_provider')

    if (updateError) throw updateError

    // Send notification email (you can implement this later)
    // await sendApprovalEmail(id)

    // Create a notification for the freelancer
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: id,
        title: 'Application Approved!',
        message: 'Congratulations! Your freelancer application has been approved. You can now start accepting projects.',
        type: 'success',
        is_read: false
      })

    if (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

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