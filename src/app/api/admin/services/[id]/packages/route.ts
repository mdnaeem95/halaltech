// src/app/api/admin/services/[id]/packages/route.ts
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const packageSchema = z.object({
  name: z.string().min(3),
  price: z.number().min(0),
  delivery_days: z.number().min(1),
  revisions: z.number().min(0).optional(),
  features: z.array(z.string()).optional(),
  is_popular: z.boolean().optional(),
})

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

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    
    const { authorized, error } = await checkAdmin(supabase)
    if (!authorized) {
      return NextResponse.json(
        { success: false, error },
        { status: error === 'Unauthorized' ? 401 : 403 }
      )
    }

    const { data, error: fetchError } = await supabase
      .from('service_packages')
      .select('*')
      .eq('service_id', id)
      .order('price', { ascending: true })

    if (fetchError) throw fetchError

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Packages fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch packages' 
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
    
    const { authorized, error } = await checkAdmin(supabase)
    if (!authorized) {
      return NextResponse.json(
        { success: false, error },
        { status: error === 'Unauthorized' ? 401 : 403 }
      )
    }

    const body = await request.json()
    const validatedData = packageSchema.parse(body)

    // Check if service exists
    const { data: service } = await supabase
      .from('services')
      .select('id')
      .eq('id', id)
      .single()

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    // If marking as popular, unmark other packages first
    if (validatedData.is_popular) {
      await supabase
        .from('service_packages')
        .update({ is_popular: false })
        .eq('service_id', id)
    }

    const { data, error: createError } = await supabase
      .from('service_packages')
      .insert({
        service_id: id,
        ...validatedData,
      })
      .select()
      .single()

    if (createError) throw createError

    return NextResponse.json({ 
      success: true, 
      message: 'Package created successfully',
      data 
    })
  } catch (error: any) {
    console.error('Package creation error:', error)
    
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
        error: error.message || 'Failed to create package' 
      },
      { status: 500 }
    )
  }
}