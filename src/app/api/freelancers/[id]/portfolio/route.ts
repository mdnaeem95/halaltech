/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const portfolioSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  project_url: z.string().url().optional(),
  github_url: z.string().url().optional(),
  image_urls: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
})

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('freelancer_portfolios')
      .select('*')
      .eq('freelancer_id', id)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch portfolio' 
      },
      { status: 500 }
    )
  }
}

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
    const validatedData = portfolioSchema.parse(body)

    const { data, error } = await supabase
      .from('freelancer_portfolios')
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
    console.error('Portfolio creation error:', error)
    
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
        error: error.message || 'Failed to add portfolio item' 
      },
      { status: 500 }
    )
  }
}