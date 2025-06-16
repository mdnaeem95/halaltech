/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendFreelancerApplicationEmail } from '@/lib/email/service'

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
      // If user exists but isn't a freelancer, we'll just add their application
      // without creating a new auth account
    }
    
    // Store application data first (before creating account)
    const { data: application, error: applicationError } = await supabase
      .from('freelancer_applications')
      .insert({
        user_id: existingUser?.id || null, // Link to existing user if they have an account
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone: validatedData.phone,
        years_experience: validatedData.years_experience,
        primary_skills: validatedData.primary_skills,
        portfolio_url: validatedData.portfolio_url || null,
        why_join: validatedData.why_join,
        muslim_owned_experience: validatedData.muslim_owned_experience,
        status: 'pending'
      })
      .select()
      .single()

    if (applicationError) throw applicationError
    
    // Only create auth account if user doesn't exist
    if (!existingUser) {
      // Generate a secure temporary password
      const tempPassword = generateSecurePassword()
      
      // Create auth user with temporary password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: tempPassword,
        options: {
          data: {
            full_name: validatedData.full_name,
            phone: validatedData.phone,
          },
          // Don't send the default confirmation email
          emailRedirectTo: undefined
        }
      })
      
      if (authError) {
        // If auth creation fails, delete the application
        await supabase
          .from('freelancer_applications')
          .delete()
          .eq('id', application.id)
        
        throw authError
      }
      
      // Update application with user_id
      await supabase
        .from('freelancer_applications')
        .update({ user_id: authData.user?.id })
        .eq('id', application.id)
      
      // Send password reset email so they can set their own password
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        validatedData.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?type=welcome`,
        }
      )
      
      if (resetError) {
        console.error('Failed to send password reset email:', resetError)
        // Don't fail the whole request if email fails
      }
    }
    
    // Send application confirmation email
    try {
      await sendFreelancerApplicationEmail(
        validatedData.email,
        validatedData.full_name,
        !existingUser // includePasswordSetup = true if new user
      )
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({ 
      success: true,
      isNewUser: !existingUser,
      message: existingUser 
        ? 'Application submitted successfully!'
        : 'Application submitted! Check your email to set up your account password.'
    })
    
  } catch (error: any) {
    console.error('Application error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'An application with this email already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit application' },
      { status: 500 }
    )
  }
}

// Helper function to generate secure temporary password
function generateSecurePassword(length = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one of each required character type
  password += 'A' // uppercase
  password += 'a' // lowercase  
  password += '1' // number
  password += '!' // special
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}