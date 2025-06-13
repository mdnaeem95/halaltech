/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get this month's earnings
    const { data: thisMonthData } = await supabase
      .from('freelancer_earnings')
      .select('amount')
      .eq('freelancer_id', user.id)
      .eq('status', 'completed')
      .gte('created_at', thisMonthStart.toISOString())

    // Get last month's earnings
    const { data: lastMonthData } = await supabase
      .from('freelancer_earnings')
      .select('amount')
      .eq('freelancer_id', user.id)
      .eq('status', 'completed')
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString())

    // Get pending earnings
    const { data: pendingData } = await supabase
      .from('freelancer_earnings')
      .select('amount')
      .eq('freelancer_id', user.id)
      .eq('status', 'pending')

    const earnings = {
      thisMonth: thisMonthData?.reduce((sum, e) => sum + e.amount, 0) || 0,
      lastMonth: lastMonthData?.reduce((sum, e) => sum + e.amount, 0) || 0,
      pending: pendingData?.reduce((sum, e) => sum + e.amount, 0) || 0,
    }

    return NextResponse.json({ success: true, data: earnings })
  } catch (error: any) {
    console.error('Earnings fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch earnings' 
      },
      { status: 500 }
    )
  }
}