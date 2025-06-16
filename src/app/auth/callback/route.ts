// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // Handle errors from Supabase
  if (error) {
    console.error('Auth callback error:', error, error_description)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/error?error=${encodeURIComponent(
        error_description || error
      )}`
    )
  }

  if (code) {
    try {
      const supabase = await createClient()
      
      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/error?error=${encodeURIComponent(
            exchangeError.message
          )}`
        )
      }

      // Check if this is a password reset flow
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // If the next URL contains 'reset-password', this is a password reset flow
        if (next.includes('reset-password')) {
          return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`)
        }
        
        // For email verification
        if (next.includes('verify')) {
          return NextResponse.redirect(`${requestUrl.origin}/auth/verify-success`)
        }

        // Default redirect based on user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'admin') {
          return NextResponse.redirect(`${requestUrl.origin}/admin`)
        } else if (profile?.role === 'service_provider') {
          return NextResponse.redirect(`${requestUrl.origin}/freelancer/dashboard`)
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
        }
      }
    } catch (error) {
      console.error('Auth callback processing error:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/error?error=callback_error`
      )
    }
  }

  // No code present, redirect to home
  return NextResponse.redirect(requestUrl.origin)
}