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

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        freelancer_skills (*),
        freelancer_portfolios (*),
        freelancer_availability (*),
        freelancer_reviews (
          *,
          client:profiles!freelancer_reviews_client_id_fkey (
            full_name,
            company_name
          ),
          project:projects (
            title
          )
        )
      `)
      .eq('id', id)
      .eq('role', 'service_provider')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Freelancer not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Get stats
    const { data: stats } = await supabase
      .from('freelancer_stats')
      .select('*')
      .eq('id', id)
      .single()

    return NextResponse.json({ 
      success: true, 
      data: {
        ...data,
        stats
      }
    })
  } catch (error: any) {
    console.error('Freelancer fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch freelancer' 
      },
      { status: 500 }
    )
  }
}