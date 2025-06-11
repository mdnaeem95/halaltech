/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const quoteSchema = z.object({
  amount: z.number().min(0),
  deliverables: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
  })),
  payment_terms: z.string(),
  valid_until: z.string(), // ISO date string
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

    // Get the latest quote for this project
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      data: data || null 
    })
  } catch (error: any) {
    console.error('Quote fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch quote' 
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
        { success: false, error: 'Only admins can create quotes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = quoteSchema.parse(body)

    // Check if project exists and get client info
    const { data: project } = await supabase
      .from('projects')
      .select('*, client:profiles!projects_client_id_fkey(email, full_name)')
      .eq('id', id)
      .single()

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Create the quote
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        project_id: id,
        ...validatedData,
      })
      .select()
      .single()

    if (error) throw error

    // Update project status to 'quoted' and set quoted_price
    await supabase
      .from('projects')
      .update({ 
        status: 'quoted',
        quoted_price: validatedData.amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    // TODO: Send email notification to client
    // await sendQuoteEmail(project.client.email, {
    //   clientName: project.client.full_name,
    //   projectTitle: project.title,
    //   quoteAmount: validatedData.amount,
    //   validUntil: validatedData.valid_until,
    // })

    return NextResponse.json({ 
      success: true, 
      message: 'Quote created and sent to client',
      data 
    })
  } catch (error: any) {
    console.error('Quote creation error:', error)
    
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
        error: error.message || 'Failed to create quote' 
      },
      { status: 500 }
    )
  }
}

// Accept or reject quote
export async function PATCH(
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

    const { action } = await request.json()
    
    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Get the latest quote
    const { data: quote } = await supabase
      .from('quotes')
      .select('*, project:projects(*)')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'No quote found for this project' },
        { status: 404 }
      )
    }

    // Verify the user is the project client
    if (quote.project.client_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (action === 'accept') {
      // Update quote
      await supabase
        .from('quotes')
        .update({ 
          is_accepted: true,
          accepted_at: new Date().toISOString()
        })
        .eq('id', quote.id)

      // Update project status
      await supabase
        .from('projects')
        .update({ 
          status: 'in_progress',
          start_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      // TODO: Generate invoice
      // await createInvoice(id, quote.amount)

      return NextResponse.json({ 
        success: true, 
        message: 'Quote accepted! Project is now in progress.'
      })
    } else {
      // Update project status back to inquiry
      await supabase
        .from('projects')
        .update({ 
          status: 'inquiry',
          quoted_price: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      return NextResponse.json({ 
        success: true, 
        message: 'Quote rejected. We\'ll prepare a new quote for you.'
      })
    }
  } catch (error: any) {
    console.error('Quote update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update quote' 
      },
      { status: 500 }
    )
  }
}