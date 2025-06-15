/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const applicationSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  years_experience: z.string(),
  primary_skills: z.string().min(10),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  why_join: z.string().min(50),
  muslim_owned_experience: z.boolean(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validate the data
    const validatedData = applicationSchema.parse(body)
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', validatedData.email)
      .single()
    
    if (existingUser) {
      if (existingUser.role === 'service_provider') {
        return NextResponse.json(
          { success: false, error: 'You are already registered as a freelancer' },
          { status: 400 }
        )
      }
    }
    
    // Create auth user if doesn't exist
    let userId = existingUser?.id
    
    if (!userId) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: Math.random().toString(36).slice(-12), // Temporary password
        options: {
          data: {
            full_name: validatedData.full_name,
            phone: validatedData.phone,
          }
        }
      })
      
      if (authError) throw authError
      userId = authData.user?.id
    }
    
    // Store application data
    const { error: applicationError } = await supabase
      .from('freelancer_applications')
      .insert({
        user_id: userId,
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone: validatedData.phone,
        years_experience: validatedData.years_experience,
        primary_skills: validatedData.primary_skills,
        portfolio_url: validatedData.portfolio_url || null,
        why_join: validatedData.why_join,
        muslim_owned_experience: validatedData.muslim_owned_experience,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
    
    if (applicationError) throw applicationError
    
    // Send notification to admin
    await sendAdminNotification(validatedData)
    
    // Send confirmation email to applicant
    await sendApplicantConfirmation(validatedData.email, validatedData.full_name)
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
    })
  } catch (error: any) {
    console.error('Error submitting application:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit application' },
      { status: 500 }
    )
  }
}

// Email notification functions (implement with your email service)
async function sendAdminNotification(data: any) {
  // Implement email notification to admin
  console.log('Sending admin notification for new application:', data.email)
}

async function sendApplicantConfirmation(email: string, name: string) {
  // Implement confirmation email to applicant
  console.log(`Sending confirmation email to: ${name}`, email)
}