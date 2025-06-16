/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No user found' },
        { status: 401 }
      )
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: `Forbidden - Admin access required. Current role: ${profile?.role || 'none'}` },
        { status: 403 }
      )
    }

    // Fetch all freelancer applications from the freelancer_applications table
    const { data: applications, error } = await supabase
      .from('freelancer_applications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching applications:', error)
      throw error
    }

    // For each application, fetch the associated profile and skills
    const applicationsWithDetails = await Promise.all(
      (applications || []).map(async (app) => {
        // Get profile data if user_id exists
        let profileData = null
        let skills: any = []
        
        if (app.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', app.user_id)
            .single()
          
          profileData = profile
          
          // Get skills
          const { data: freelancerSkills } = await supabase
            .from('freelancer_skills')
            .select('skill_name, skill_level, years_experience')
            .eq('freelancer_id', app.user_id)
          
          skills = freelancerSkills || []
        }
        
        // Merge application data with profile data
        return {
          id: app.user_id || app.id,
          email: app.email,
          full_name: app.full_name,
          phone: app.phone,
          bio: profileData?.bio || '',
          hourly_rate: profileData?.hourly_rate || 0,
          years_experience: parseInt(app.years_experience) || profileData?.years_experience || 0,
          portfolio_url: app.portfolio_url || profileData?.portfolio_url,
          linkedin_url: profileData?.linkedin_url,
          github_url: profileData?.github_url,
          created_at: app.created_at,
          onboarding_completed: profileData?.onboarding_completed || false,
          is_verified: profileData?.is_verified || false,
          freelancer_skills: skills,
          application_status: app.status,
          primary_skills: app.primary_skills,
          why_join: app.why_join,
          muslim_owned_experience: app.muslim_owned_experience
        }
      })
    )

    if (error) {
      console.error('Error fetching applications:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      data: applicationsWithDetails
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch applications' 
      },
      { status: 500 }
    )
  }
}