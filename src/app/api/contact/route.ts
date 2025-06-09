import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const data = await request.json()
  
  // Add your email service logic here
  console.log('Contact form submission:', data)
  
  return NextResponse.json({ success: true })
}