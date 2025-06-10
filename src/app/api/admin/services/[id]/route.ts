/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateServiceSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().min(3).optional(),
  category: z.enum(['web', 'mobile', 'design', 'consulting']).optional(),
  description: z.string().min(10).optional(),
  base_price: z.number().min(0).optional().nullable(),
  price_unit: z.string().optional().nullable(),
  duration_estimate: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  display_order: z.number().optional().nullable(),
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
      .from('services')
      .select(`
        *,
        service_packages (*)
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Service not found' },
          { status: 404 }
        )
      }
      throw fetchError
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Service fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch service' 
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const validatedData = updateServiceSchema.parse(body)

    // If slug is being updated, check if it already exists
    if (validatedData.slug) {
      const { data: existing } = await supabase
        .from('services')
        .select('id')
        .eq('slug', validatedData.slug)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'A service with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update service
    const { data, error: updateError } = await supabase
      .from('services')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true, 
      message: 'Service updated successfully',
      data 
    })
  } catch (error: any) {
    console.error('Service update error:', error)
    
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
        error: error.message || 'Failed to update service' 
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
    const supabase = await createClient()
    
    const { authorized, error } = await checkAdmin(supabase)
    if (!authorized) {
      return NextResponse.json(
        { success: false, error },
        { status: error === 'Unauthorized' ? 401 : 403 }
      )
    }

    // Check if service has any active projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('service_id', id)
      .limit(1)

    if (projects && projects.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete service with existing projects. Please deactivate the service instead.' 
        },
        { status: 400 }
      )
    }

    // Delete service packages first (due to foreign key constraint)
    await supabase
      .from('service_packages')
      .delete()
      .eq('service_id', id)

    // Delete the service
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({ 
      success: true, 
      message: 'Service deleted successfully' 
    })
  } catch (error: any) {
    console.error('Service deletion error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete service' 
      },
      { status: 500 }
    )
  }
}