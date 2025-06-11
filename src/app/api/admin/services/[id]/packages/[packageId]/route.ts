/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updatePackageSchema = z.object({
  name: z.string().min(3).optional(),
  price: z.number().min(0).optional(),
  delivery_days: z.number().min(1).optional(),
  revisions: z.number().min(0).optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const { id, packageId } = await context.params
    const supabase = await createClient()
    
    const { authorized, error } = await checkAdmin(supabase)
    if (!authorized) {
      return NextResponse.json(
        { success: false, error },
        { status: error === 'Unauthorized' ? 401 : 403 }
      )
    }

    const body = await request.json()
    const validatedData = updatePackageSchema.parse(body)

    // If marking as popular, unmark other packages first
    if (validatedData.is_popular) {
      await supabase
        .from('service_packages')
        .update({ is_popular: false })
        .eq('service_id', id)
    }

    const { data, error: updateError } = await supabase
      .from('service_packages')
      .update(validatedData)
      .eq('id', packageId)
      .eq('service_id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true, 
      message: 'Package updated successfully',
      data 
    })
  } catch (error: any) {
    console.error('Package update error:', error)
    
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
        error: error.message || 'Failed to update package' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const { id, packageId } = await context.params
    const supabase = await createClient()
    
    const { authorized, error } = await checkAdmin(supabase)
    if (!authorized) {
      return NextResponse.json(
        { success: false, error },
        { status: error === 'Unauthorized' ? 401 : 403 }
      )
    }

    // Check if package is being used in any projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('package_id', packageId)
      .limit(1)

    if (projects && projects.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete package that is being used in projects' 
        },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('service_packages')
      .delete()
      .eq('id', packageId)
      .eq('service_id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({ 
      success: true, 
      message: 'Package deleted successfully' 
    })
  } catch (error: any) {
    console.error('Package deletion error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete package' 
      },
      { status: 500 }
    )
  }
}