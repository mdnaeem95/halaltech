/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const serviceSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  category: z.enum(['web', 'mobile', 'design', 'consulting']),
  description: z.string().min(10),
  base_price: z.number().min(0).optional(),
  price_unit: z.string().optional(),
  duration_estimate: z.string().optional(),
  features: z.array(z.string()).optional(),
  display_order: z.number().optional(),
  is_active: z.boolean().optional(),
})

// Check if user is admin
async function checkAdmin(supabase: any) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { authorized: false, error: 'Unauthorized' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: 'Forbidden - Admin access required' }
  }

  return { authorized: true, user }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { authorized, error } = await checkAdmin(supabase)
    if (!authorized) {
      return NextResponse.json(
        { success: false, error },
        { status: error === 'Unauthorized' ? 401 : 403 }
      )
    }

    const { data, error: fetchError } = await supabase
      .from('services')
      .select(`
        *,
        service_packages (*)
      `)
      .order('display_order', { ascending: true })

    if (fetchError) throw fetchError

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Services fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch services' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { authorized, error } = await checkAdmin(supabase)
    if (!authorized) {
      return NextResponse.json(
        { success: false, error },
        { status: error === 'Unauthorized' ? 401 : 403 }
      )
    }

    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('services')
      .select('id')
      .eq('slug', validatedData.slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A service with this slug already exists' },
        { status: 400 }
      )
    }

    // Create service
    const { data, error: createError } = await supabase
      .from('services')
      .insert({
        ...validatedData,
        is_active: validatedData.is_active ?? true,
      })
      .select()
      .single()

    if (createError) throw createError

    return NextResponse.json({ 
      success: true, 
      message: 'Service created successfully',
      data 
    })
  } catch (error: any) {
    console.error('Service creation error:', error)
    
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
        error: error.message || 'Failed to create service' 
      },
      { status: 500 }
    )
  }
}