/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FreelancerSearchFilters } from '@/types/freelancer'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = await createClient()
    
    // Parse filters
    const filters: FreelancerSearchFilters = {
      skills: searchParams.get('skills')?.split(',').filter(Boolean),
      min_rating: searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')!) : undefined,
      max_hourly_rate: searchParams.get('max_hourly_rate') ? parseFloat(searchParams.get('max_hourly_rate')!) : undefined,
      availability_status: searchParams.get('availability_status') || undefined,
      category: searchParams.get('category') || undefined,
      sort_by: searchParams.get('sort_by') as any || 'rating',
      sort_order: searchParams.get('sort_order') as any || 'desc',
    }

    // Build query
    let query = supabase
      .from('profiles')
      .select(`
        *,
        freelancer_skills (*),
        project_assignments (
          id,
          status
        )
      `)
      .eq('role', 'service_provider')
      .eq('onboarding_completed', true)

    // Apply filters
    if (filters.min_rating) {
      query = query.gte('rating', filters.min_rating)
    }
    
    if (filters.max_hourly_rate) {
      query = query.lte('hourly_rate', filters.max_hourly_rate)
    }
    
    if (filters.availability_status) {
      query = query.eq('availability_status', filters.availability_status)
    }

    // Apply sorting
    const sortColumn = {
      'rating': 'rating',
      'hourly_rate': 'hourly_rate',
      'experience': 'years_experience',
      'projects_completed': 'total_reviews'
    }[filters.sort_by || 'rating']

    query = query.order(sortColumn, { ascending: filters.sort_order === 'asc' })

    const { data, error } = await query

    if (error) throw error

    // Filter by skills if provided
    let filteredData = data
    if (filters.skills && filters.skills.length > 0) {
      filteredData = data?.filter(freelancer => {
        const freelancerSkills = freelancer.freelancer_skills.map((s: any) => s.skill_name.toLowerCase())
        return filters.skills!.some(skill => freelancerSkills.includes(skill.toLowerCase()))
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: filteredData,
      count: filteredData?.length || 0
    })
  } catch (error: any) {
    console.error('Freelancers fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch freelancers' 
      },
      { status: 500 }
    )
  }
}