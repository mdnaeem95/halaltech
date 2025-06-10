// middleware.ts (in your project root)
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware' // <-- Make sure this path is correct

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}