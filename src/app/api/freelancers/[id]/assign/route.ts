/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const assignmentSchema = z.object({
  freelancer_id: z.string().uuid(),
  payment_type: z.enum(['hourly', 'fixed']),
  hourly_rate: z.number().optional(),
  fixed_price: z.number().optional(),
  estimated_hours: z.number().optional(),
  notes: z.string().optional(),
})

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admins can assign freelancers' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = assignmentSchema.parse(body)

    // Validate payment details
    if (validatedData.payment_type === 'hourly' && !validatedData.hourly_rate) {
      return NextResponse.json(
        { success: false, error: 'Hourly rate is required for hourly payment type' },
        { status: 400 }
      )
    }

    if (validatedData.payment_type === 'fixed' && !validatedData.fixed_price) {
      return NextResponse.json(
        { success: false, error: 'Fixed price is required for fixed payment type' },
        { status: 400 }
      )
    }

    // Create assignment
    const { data, error } = await supabase
      .from('project_assignments')
      .insert({
        project_id: id,
        ...validatedData,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Send notification to freelancer
    await supabase
      .from('project_messages')
      .insert({
        project_id: id,
        sender_id: user.id,
        message: `You have been assigned to this project. Please review the assignment details and accept or decline.`,
        is_internal: false,
      })

    return NextResponse.json({ 
      success: true, 
      message: 'Freelancer assigned successfully',
      data 
    })
  } catch (error: any) {
    console.error('Assignment error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to assign freelancer' 
      },
      { status: 500 }
    )
  }
}