import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY // Changed from SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file:\n' +
    `NEXT_PUBLIC_SUPABASE_URL is ${supabaseUrl ? 'set' : 'missing'}\n` +
    `NEXT_PUBLIC_SUPABASE_KEY is ${supabaseKey ? 'set' : 'missing'}`
  )
}

// Create a single supabase client for interacting with your database
export function createBrowserClient() {
  return createClient(supabaseUrl!, supabaseKey!)
}

// Export a singleton instance
export const supabase = createClient(supabaseUrl, supabaseKey)