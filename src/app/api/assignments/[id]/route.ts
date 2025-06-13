/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { action } = await request.json()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get assignment
    const { data: assignment } = await supabase
      .from('project_assignments')
      .select('*, project:projects(*)')
      .eq('id', id)
      .single()

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Verify user is the assigned freelancer
    if (assignment.freelancer_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (action === 'accept') {
      const { error } = await supabase
        .from('project_assignments')
        .update({ 
          status: 'active',
          accepted_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // Add message to project
      await supabase
        .from('project_messages')
        .insert({
          project_id: assignment.project_id,
          sender_id: user.id,
          message: 'I have accepted the project assignment and will begin work shortly.',
          is_internal: false,
        })

      return NextResponse.json({ 
        success: true, 
        message: 'Assignment accepted successfully' 
      })
    } else if (action === 'reject') {
      const { error } = await supabase
        .from('project_assignments')
        .update({ status: 'rejected' })
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: 'Assignment rejected' 
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Assignment update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update assignment' 
      },
      { status: 500 }
    )
  }
}