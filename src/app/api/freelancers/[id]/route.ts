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
    
    // Fetch freelancer with all related data
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        freelancer_skills (*),
        freelancer_portfolio (*),
        freelancer_availability (*),
        project_assignments (
          id,
          status,
          completed_at
        )
      `)
      .eq('id', id)
      .eq('role', 'service_provider')
      .eq('onboarding_completed', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Freelancer not found' 
          },
          { status: 404 }
        )
      }
      throw error
    }

    // Calculate additional stats
    const completedProjects = data.project_assignments?.filter(
      (assignment: any) => assignment.status === 'completed'
    ).length || 0

    const freelancerWithStats = {
      ...data,
      completed_projects: completedProjects,
      active_projects: data.project_assignments?.filter(
        (assignment: any) => assignment.status === 'active'
      ).length || 0,
    }

    return NextResponse.json({ 
      success: true, 
      data: freelancerWithStats
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