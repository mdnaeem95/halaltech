/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const skillSchema = z.object({
  skill_name: z.string().min(1),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  years_experience: z.number().min(0).default(0),
})

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    
    // Verify user is the freelancer or admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.id !== id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const validatedData = skillSchema.parse(body)

    const { data, error } = await supabase
      .from('freelancer_skills')
      .insert({
        freelancer_id: id,
        ...validatedData,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error: any) {
    console.error('Skill creation error:', error)
    
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
        error: error.message || 'Failed to add skill' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const skillId = searchParams.get('skillId')
    
    if (!skillId) {
      return NextResponse.json(
        { success: false, error: 'Skill ID required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Verify user is the freelancer or admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.id !== id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    const { error } = await supabase
      .from('freelancer_skills')
      .delete()
      .eq('id', skillId)
      .eq('freelancer_id', id)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Skill removed successfully' 
    })
  } catch (error: any) {
    console.error('Skill deletion error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to remove skill' 
      },
      { status: 500 }
    )
  }
}