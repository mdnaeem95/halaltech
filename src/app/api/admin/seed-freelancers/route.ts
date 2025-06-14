/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Sample freelancer data
const freelancerData = [
  {
    email: 'ahmad.hassan@example.com',
    full_name: 'Ahmad Hassan',
    bio: 'Full-stack developer with 6+ years of experience specializing in React, Node.js, and cloud architecture. I have successfully delivered 50+ web applications for clients ranging from startups to enterprise companies. My expertise includes modern JavaScript frameworks, API development, and database design. I pride myself on writing clean, maintainable code and delivering projects on time and within budget.',
    hourly_rate: 75,
    years_experience: 6,
    portfolio_url: 'https://ahmadhassan.dev',
    linkedin_url: 'https://linkedin.com/in/ahmadhassan',
    github_url: 'https://github.com/ahmadhassan',
    rating: 4.9,
    total_reviews: 42,
    total_earnings: 95000,
    availability_status: 'available',
    skills: [
      { skill_name: 'React', skill_level: 'expert', years_experience: 5 },
      { skill_name: 'Next.js', skill_level: 'expert', years_experience: 4 },
      { skill_name: 'Node.js', skill_level: 'advanced', years_experience: 6 },
      { skill_name: 'TypeScript', skill_level: 'expert', years_experience: 4 },
      { skill_name: 'MongoDB', skill_level: 'advanced', years_experience: 5 },
    ]
  },
  {
    email: 'fatima.ali@example.com',
    full_name: 'Fatima Ali',
    bio: 'UI/UX Designer and Flutter developer passionate about creating beautiful, user-centered mobile applications. With 4+ years in the industry, I have designed and developed 30+ mobile apps with over 100K+ downloads combined. I specialize in Material Design, iOS Human Interface Guidelines, and creating seamless user experiences across all platforms.',
    hourly_rate: 60,
    years_experience: 4,
    portfolio_url: 'https://fatimaali.design',
    linkedin_url: 'https://linkedin.com/in/fatimaali',
    github_url: 'https://github.com/fatimaali',
    rating: 4.8,
    total_reviews: 28,
    total_earnings: 65000,
    availability_status: 'available',
    skills: [
      { skill_name: 'Flutter', skill_level: 'expert', years_experience: 4 },
      { skill_name: 'UI/UX Design', skill_level: 'expert', years_experience: 5 },
      { skill_name: 'Figma', skill_level: 'expert', years_experience: 4 },
      { skill_name: 'React Native', skill_level: 'intermediate', years_experience: 2 },
      { skill_name: 'Dart', skill_level: 'advanced', years_experience: 4 },
    ]
  },
  {
    email: 'omar.rahman@example.com',
    full_name: 'Omar Rahman',
    bio: 'Senior Backend Engineer with extensive experience in Python, Django, and cloud infrastructure. I have architected and scaled systems handling millions of requests for fintech and e-commerce companies. My expertise includes API design, microservices architecture, DevOps, and security best practices. I am passionate about building robust, scalable solutions.',
    hourly_rate: 85,
    years_experience: 8,
    portfolio_url: 'https://omarrahman.tech',
    linkedin_url: 'https://linkedin.com/in/omarrahman',
    github_url: 'https://github.com/omarrahman',
    rating: 4.9,
    total_reviews: 36,
    total_earnings: 125000,
    availability_status: 'busy',
    skills: [
      { skill_name: 'Python', skill_level: 'expert', years_experience: 8 },
      { skill_name: 'Django', skill_level: 'expert', years_experience: 7 },
      { skill_name: 'PostgreSQL', skill_level: 'advanced', years_experience: 6 },
      { skill_name: 'AWS', skill_level: 'advanced', years_experience: 5 },
      { skill_name: 'Docker', skill_level: 'advanced', years_experience: 4 },
    ]
  },
  {
    email: 'aisha.mohamed@example.com',
    full_name: 'Aisha Mohamed',
    bio: 'Creative Frontend Developer and WordPress specialist with a keen eye for design and performance optimization. I have built 80+ responsive websites and custom WordPress themes for businesses across various industries. My approach combines technical expertise with creative problem-solving to deliver exceptional digital experiences.',
    hourly_rate: 45,
    years_experience: 3,
    portfolio_url: 'https://aishamohamed.com',
    linkedin_url: 'https://linkedin.com/in/aishamohamed',
    github_url: 'https://github.com/aishamohamed',
    rating: 4.7,
    total_reviews: 52,
    total_earnings: 35000,
    availability_status: 'available',
    skills: [
      { skill_name: 'WordPress', skill_level: 'expert', years_experience: 3 },
      { skill_name: 'PHP', skill_level: 'intermediate', years_experience: 3 },
      { skill_name: 'JavaScript', skill_level: 'intermediate', years_experience: 3 },
      { skill_name: 'CSS', skill_level: 'advanced', years_experience: 4 },
      { skill_name: 'HTML', skill_level: 'expert', years_experience: 4 },
    ]
  },
  {
    email: 'yusuf.khan@example.com',
    full_name: 'Yusuf Khan',
    bio: 'Full-stack developer specializing in modern web technologies and e-commerce solutions. I have successfully launched 25+ online stores and web applications, with expertise in both frontend and backend development. My focus is on creating fast, secure, and user-friendly applications that drive business growth.',
    hourly_rate: 65,
    years_experience: 5,
    portfolio_url: 'https://yusufkhan.dev',
    linkedin_url: 'https://linkedin.com/in/yusufkhan',
    github_url: 'https://github.com/yusufkhan',
    rating: 4.6,
    total_reviews: 33,
    total_earnings: 78000,
    availability_status: 'available',
    skills: [
      { skill_name: 'Vue.js', skill_level: 'advanced', years_experience: 4 },
      { skill_name: 'Laravel', skill_level: 'expert', years_experience: 5 },
      { skill_name: 'MySQL', skill_level: 'advanced', years_experience: 5 },
      { skill_name: 'JavaScript', skill_level: 'advanced', years_experience: 5 },
      { skill_name: 'PHP', skill_level: 'expert', years_experience: 5 },
    ]
  },
  {
    email: 'sara.ibrahim@example.com',
    full_name: 'Sara Ibrahim',
    bio: 'Mobile app developer and startup consultant with expertise in React Native and cross-platform development. I have helped 15+ startups bring their mobile app ideas to life, from concept to App Store launch. My strength lies in rapid prototyping, user testing, and iterative development approaches.',
    hourly_rate: 70,
    years_experience: 4,
    portfolio_url: 'https://saraibrahim.app',
    linkedin_url: 'https://linkedin.com/in/saraibrahim',
    github_url: 'https://github.com/saraibrahim',
    rating: 4.8,
    total_reviews: 19,
    total_earnings: 45000,
    availability_status: 'available',
    skills: [
      { skill_name: 'React Native', skill_level: 'expert', years_experience: 4 },
      { skill_name: 'React', skill_level: 'advanced', years_experience: 4 },
      { skill_name: 'JavaScript', skill_level: 'advanced', years_experience: 5 },
      { skill_name: 'Firebase', skill_level: 'intermediate', years_experience: 3 },
      { skill_name: 'iOS', skill_level: 'intermediate', years_experience: 2 },
    ]
  },
  {
    email: 'hassan.tariq@example.com',
    full_name: 'Hassan Tariq',
    bio: 'DevOps Engineer and Cloud Architect passionate about automation and scalable infrastructure. I have migrated 20+ applications to the cloud and implemented CI/CD pipelines that have reduced deployment time by 80%. My expertise spans across AWS, Azure, Kubernetes, and modern DevOps practices.',
    hourly_rate: 90,
    years_experience: 7,
    portfolio_url: 'https://hassantariq.cloud',
    linkedin_url: 'https://linkedin.com/in/hassantariq',
    github_url: 'https://github.com/hassantariq',
    rating: 4.9,
    total_reviews: 24,
    total_earnings: 89000,
    availability_status: 'busy',
    skills: [
      { skill_name: 'AWS', skill_level: 'expert', years_experience: 6 },
      { skill_name: 'Kubernetes', skill_level: 'advanced', years_experience: 4 },
      { skill_name: 'Docker', skill_level: 'expert', years_experience: 5 },
      { skill_name: 'Terraform', skill_level: 'advanced', years_experience: 3 },
      { skill_name: 'Linux', skill_level: 'expert', years_experience: 7 },
    ]
  },
  {
    email: 'mariam.nasser@example.com',
    full_name: 'Mariam Nasser',
    bio: 'UX/UI Designer and Frontend Developer with a passion for creating accessible and inclusive digital experiences. I have designed and prototyped interfaces for 40+ web and mobile applications, always putting user needs first. My design philosophy centers around simplicity, functionality, and beautiful aesthetics.',
    hourly_rate: 55,
    years_experience: 3,
    portfolio_url: 'https://mariamnasser.design',
    linkedin_url: 'https://linkedin.com/in/mariamnasser',
    github_url: 'https://github.com/mariamnasser',
    rating: 4.7,
    total_reviews: 31,
    total_earnings: 42000,
    availability_status: 'available',
    skills: [
      { skill_name: 'UI/UX Design', skill_level: 'expert', years_experience: 3 },
      { skill_name: 'Figma', skill_level: 'expert', years_experience: 3 },
      { skill_name: 'Adobe XD', skill_level: 'advanced', years_experience: 3 },
      { skill_name: 'HTML', skill_level: 'advanced', years_experience: 3 },
      { skill_name: 'CSS', skill_level: 'advanced', years_experience: 3 },
    ]
  }
]

// Default availability schedule (Mon-Fri, 9 AM - 5 PM)
const defaultAvailability = [
  { day_of_week: 1, start_time: '09:00', end_time: '17:00', is_available: true },  // Monday
  { day_of_week: 2, start_time: '09:00', end_time: '17:00', is_available: true },  // Tuesday
  { day_of_week: 3, start_time: '09:00', end_time: '17:00', is_available: true },  // Wednesday
  { day_of_week: 4, start_time: '09:00', end_time: '17:00', is_available: true },  // Thursday
  { day_of_week: 5, start_time: '09:00', end_time: '17:00', is_available: true },  // Friday
  { day_of_week: 6, start_time: '00:00', end_time: '00:00', is_available: false }, // Saturday
  { day_of_week: 0, start_time: '00:00', end_time: '00:00', is_available: false }, // Sunday
]

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { clearExisting } = await request.json()

    // Clear existing test freelancers if requested
    if (clearExisting) {
      const testEmails = freelancerData.map(f => f.email)
      
      // Get freelancer IDs to delete related data
      const { data: existingFreelancers } = await supabase
        .from('profiles')
        .select('id')
        .in('email', testEmails)

      if (existingFreelancers && existingFreelancers.length > 0) {
        const freelancerIds = existingFreelancers.map(f => f.id)
        
        // Delete related data first
        await supabase.from('freelancer_skills').delete().in('freelancer_id', freelancerIds)
        await supabase.from('freelancer_availability').delete().in('freelancer_id', freelancerIds)
        
        // Delete profiles
        await supabase.from('profiles').delete().in('email', testEmails)
      }
    }

    const createdFreelancers = []

    for (const freelancerInfo of freelancerData) {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: freelancerInfo.email,
        password: 'TestPassword123!', // Default password for testing
        email_confirm: true,
      })

      if (authError) {
        console.error(`Failed to create auth user for ${freelancerInfo.email}:`, authError)
        continue
      }

      const userId = authData.user.id

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: freelancerInfo.email,
          full_name: freelancerInfo.full_name,
          role: 'service_provider',
          bio: freelancerInfo.bio,
          hourly_rate: freelancerInfo.hourly_rate,
          years_experience: freelancerInfo.years_experience,
          portfolio_url: freelancerInfo.portfolio_url,
          linkedin_url: freelancerInfo.linkedin_url,
          github_url: freelancerInfo.github_url,
          rating: freelancerInfo.rating,
          total_reviews: freelancerInfo.total_reviews,
          total_earnings: freelancerInfo.total_earnings,
          availability_status: freelancerInfo.availability_status,
          onboarding_completed: true,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error(`Failed to create profile for ${freelancerInfo.email}:`, profileError)
        continue
      }

      // Add skills
      const skillsToInsert = freelancerInfo.skills.map(skill => ({
        freelancer_id: userId,
        skill_name: skill.skill_name,
        skill_level: skill.skill_level,
        years_experience: skill.years_experience,
        created_at: new Date().toISOString(),
      }))

      const { error: skillsError } = await supabase
        .from('freelancer_skills')
        .insert(skillsToInsert)

      if (skillsError) {
        console.error(`Failed to create skills for ${freelancerInfo.email}:`, skillsError)
      }

      // Add availability
      const availabilityToInsert = defaultAvailability.map(avail => ({
        freelancer_id: userId,
        day_of_week: avail.day_of_week,
        start_time: avail.start_time,
        end_time: avail.end_time,
        is_available: avail.is_available,
        created_at: new Date().toISOString(),
      }))

      const { error: availabilityError } = await supabase
        .from('freelancer_availability')
        .insert(availabilityToInsert)

      if (availabilityError) {
        console.error(`Failed to create availability for ${freelancerInfo.email}:`, availabilityError)
      }

      createdFreelancers.push({
        email: freelancerInfo.email,
        name: freelancerInfo.full_name,
        id: userId
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdFreelancers.length} freelancers`,
      data: createdFreelancers
    })

  } catch (error: any) {
    console.error('Seeding error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed freelancers'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check seeded data
export async function GET() {
  try {
    const supabase = await createClient()
    
    const testEmails = freelancerData.map(f => f.email)
    
    const { data: freelancers, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        hourly_rate,
        rating,
        total_reviews,
        availability_status,
        freelancer_skills (
          skill_name,
          skill_level
        )
      `)
      .in('email', testEmails)
      .eq('role', 'service_provider')

    if (error) throw error

    return NextResponse.json({
      success: true,
      count: freelancers?.length || 0,
      data: freelancers || []
    })

  } catch (error: any) {
    console.error('Check seeded data error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check seeded data'
      },
      { status: 500 }
    )
  }
}