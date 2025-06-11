// src/app/api/invoices/[id]/route.ts
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateInvoiceSchema = z.object({
  status: z.enum(['pending', 'paid', 'cancelled']).optional(),
  paid_at: z.string().optional(),
  payment_method: z.string().optional(),
})

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        project:projects (
          id,
          title,
          description,
          service:services (
            title
          ),
          package:service_packages (
            name
          ),
          client:profiles!projects_client_id_fkey (
            id,
            full_name,
            company_name,
            email,
            phone,
            address
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Invoice not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Check if user has access to this invoice
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && data.project.client.id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Invoice fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch invoice' 
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
    
    // Only admins can update invoices
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
        { success: false, error: 'Only admins can update invoices' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateInvoiceSchema.parse(body)

    // If marking as paid, update project status if needed
    if (validatedData.status === 'paid') {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('project_id')
        .eq('id', id)
        .single()

      if (invoice) {
        // Check if this is the first invoice for the project
        const { } = await supabase
          .from('projects')
          .select('status')
          .eq('id', invoice.project_id)
          .single()

        // If project is still in progress and this is first payment, keep it in progress
        // If project is completed, don't change status
        // This logic can be customized based on business requirements
      }
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice updated successfully',
      data 
    })
  } catch (error: any) {
    console.error('Invoice update error:', error)
    
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
        error: error.message || 'Failed to update invoice' 
      },
      { status: 500 }
    )
  }
}