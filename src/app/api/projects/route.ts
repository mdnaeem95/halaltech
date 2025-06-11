/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createProjectSchema = z.object({
  service_id: z.string().uuid(),
  package_id: z.string().uuid().optional(),
  title: z.string().min(5),
  description: z.string().min(20),
  requirements: z.string().optional(),
})

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    let query = supabase
      .from('projects')
      .select(`
        *,
        service:services (
          id,
          title,
          category
        ),
        package:service_packages (
          id,
          name,
          price,
          delivery_days
        ),
        client:profiles!projects_client_id_fkey (
          id,
          full_name,
          company_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    // If not admin/service_provider, only show user's own projects
    if (!profile || profile.role === 'client') {
      query = query.eq('client_id', user.id)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Projects fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch projects' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    // If package_id is provided, fetch the package price to set as quoted_price
    let quoted_price = null
    if (validatedData.package_id) {
      const { data: packageData } = await supabase
        .from('service_packages')
        .select('price')
        .eq('id', validatedData.package_id)
        .single()
      
      if (packageData) {
        quoted_price = packageData.price
      }
    }

    // Create project
    const { data, error } = await supabase
      .from('projects')
      .insert({
        client_id: user.id,
        ...validatedData,
        status: 'inquiry',
        ...(quoted_price && { quoted_price })
      })
      .select()
      .single()

    if (error) throw error

    // TODO: Send notification to admin about new project inquiry
    // await sendNewProjectNotification(data, user)

    return NextResponse.json({ 
      success: true, 
      message: 'Project inquiry submitted successfully!',
      data 
    })
  } catch (error: any) {
    console.error('Project creation error:', error)
    
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
        error: error.message || 'Failed to create project' 
      },
      { status: 400 }
    )
  }
}