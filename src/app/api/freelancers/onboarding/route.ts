/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { FreelancerOnboardingData } from '@/types/freelancer'

const onboardingSchema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  hourly_rate: z.number().min(10, 'Hourly rate must be at least $10'),
  years_experience: z.number().min(0),
  skills: z.array(z.object({
    skill_name: z.string(),
    skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    years_experience: z.number().min(0),
  })).min(1, 'Add at least one skill'),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  availability: z.array(z.object({
    day_of_week: z.number().min(0).max(6),
    start_time: z.string(),
    end_time: z.string(),
    is_available: z.boolean(),
  })),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = onboardingSchema.parse(body) as FreelancerOnboardingData

    // Start a transaction
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        bio: validatedData.bio,
        hourly_rate: validatedData.hourly_rate,
        years_experience: validatedData.years_experience,
        portfolio_url: validatedData.portfolio_url || null,
        linkedin_url: validatedData.linkedin_url || null,
        github_url: validatedData.github_url || null,
        role: 'service_provider',
        onboarding_completed: true,
        availability_status: 'available',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Add skills
    if (validatedData.skills.length > 0) {
      const { error: skillsError } = await supabase
        .from('freelancer_skills')
        .insert(
          validatedData.skills.map(skill => ({
            freelancer_id: user.id,
            ...skill,
          }))
        )

      if (skillsError) throw skillsError
    }

    // Add availability
    if (validatedData.availability.length > 0) {
      const { error: availabilityError } = await supabase
        .from('freelancer_availability')
        .insert(
          validatedData.availability.map(avail => ({
            freelancer_id: user.id,
            ...avail,
          }))
        )

      if (availabilityError) throw availabilityError
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Freelancer profile created successfully!' 
    })
  } catch (error: any) {
    console.error('Onboarding error:', error)
    
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
        error: error.message || 'Failed to complete onboarding' 
      },
      { status: 500 }
    )
  }
}