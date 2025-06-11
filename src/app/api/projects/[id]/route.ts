/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Build the query with proper relations
    let query = supabase
      .from('projects')
      .select(`
        *,
        service:services (
          id,
          title,
          category,
          base_price
        ),
        package:service_packages (
          id,
          name,
          price,
          delivery_days,
          revisions,
          features,
          is_popular
        ),
        client:profiles!projects_client_id_fkey (
          id,
          full_name,
          company_name,
          email,
          phone
        )
      `)
      .eq('id', id)

    // If not admin/service_provider, only allow viewing own projects
    if (!profile || profile.role === 'client') {
      query = query.eq('client_id', user.id)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Project not found or access denied' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Project fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch project' 
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
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin/service_provider (only they can update projects)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role === 'client') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admins can update projects' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Only allow certain fields to be updated
    const allowedUpdates = {
      status: body.status,
      quoted_price: body.quoted_price ? Number(body.quoted_price) : undefined,
      final_price: body.final_price ? Number(body.final_price) : undefined,
      start_date: body.start_date,
      deadline: body.deadline,
      completed_at: body.status === 'completed' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    }

    // Remove undefined values
    const updateData = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([value]) => value !== undefined)
    )

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        service:services (
          id,
          title,
          category
        ),
        client:profiles!projects_client_id_fkey (
          id,
          full_name,
          company_name,
          email
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Project updated successfully',
      data 
    })
  } catch (error: any) {
    console.error('Project update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update project' 
      },
      { status: 500 }
    )
  }
}