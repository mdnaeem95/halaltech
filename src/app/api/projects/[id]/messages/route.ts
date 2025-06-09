/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

const messageSchema = z.object({
  message: z.string().min(1),
  attachments: z.array(z.any()).optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has access to this project
    const { data: project } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', params.id)
      .single()

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user is the client or admin/service_provider
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (project.client_id !== user.id && (!profile || profile.role === 'client')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get messages
    const { data, error } = await supabase
      .from('project_messages')
      .select(`
        *,
        sender:profiles!project_messages_sender_id_fkey (
          id,
          full_name,
          role
        )
      `)
      .eq('project_id', params.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Messages fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch messages' 
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = messageSchema.parse(body)

    // Verify user has access to this project (same as GET)
    // ... (verification code)

    // Create message
    const { data, error } = await supabase
      .from('project_messages')
      .insert({
        project_id: params.id,
        sender_id: user.id,
        ...validatedData,
      })
      .select()
      .single()

    if (error) throw error

    // TODO: Send notification to other party

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error: any) {
    console.error('Message creation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send message' 
      },
      { status: 400 }
    )
  }
}