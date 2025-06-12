// utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  // This refreshes the session if needed
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  // Add session refresh error handling
  if (error && error.message.includes('refresh_token_not_found')) {
    // Clear invalid session cookies
    supabaseResponse.cookies.delete('sb-access-token')
    supabaseResponse.cookies.delete('sb-refresh-token')
    
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'session_expired')
      return NextResponse.redirect(url)
    }
  }

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard']
  const authRoutes = ['/login', '/signup']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Skip redirect for API routes - let them handle auth themselves
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return supabaseResponse
  }

  // Debug: Log auth state (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware auth check:', {
      pathname: request.nextUrl.pathname,
      hasUser: !!user,
      userEmail: user?.email,
      isProtectedRoute,
      isAuthRoute,
      error: error?.message
    })
  }

  // Redirect to login if accessing protected route without authentication
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (user && isAuthRoute) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    const url = request.nextUrl.clone()
    url.pathname = redirectTo || '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}