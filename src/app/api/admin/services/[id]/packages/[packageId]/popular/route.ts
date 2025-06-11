/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Get current package status
    const { data: currentPackage } = await supabase
      .from('service_packages')
      .select('is_popular')
      .eq('id', packageId)
      .single()

    if (!currentPackage) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      )
    }

    // If making popular, unmark all other packages first
    if (!currentPackage.is_popular) {
      await supabase
        .from('service_packages')
        .update({ is_popular: false })
        .eq('service_id', id)
    }

    // Toggle the popular status
    const { data, error: updateError } = await supabase
      .from('service_packages')
      .update({ is_popular: !currentPackage.is_popular })
      .eq('id', packageId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true, 
      message: 'Popular status updated',
      data 
    })
  } catch (error: any) {
    console.error('Popular status update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update popular status' 
      },
      { status: 500 }
    )
  }
}