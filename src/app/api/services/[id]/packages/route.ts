// src/app/api/services/[id]/packages/route.ts
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
      .from('service_packages')
      .select('*')
      .eq('service_id', id)
      .order('price', { ascending: true })

    if (error) throw error

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