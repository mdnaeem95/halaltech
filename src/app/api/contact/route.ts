/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' // Changed import
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = contactSchema.parse(body)

    const supabase = await createClient() // Changed from createServerSupabaseClient()

    // Save to database
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company,
        phone: validatedData.phone,
        service_interested: validatedData.service,
        message: validatedData.message,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your inquiry! We will contact you within 24 hours.',
      data 
    })
  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to submit contact form' 
      },
      { status: 400 }
    )
  }
}