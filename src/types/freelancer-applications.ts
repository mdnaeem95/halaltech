// src/types/freelancer-applications.ts

export interface FreelancerApplicationRecord {
  id: string
  user_id: string | null
  full_name: string
  email: string
  phone: string
  years_experience: string
  primary_skills: string
  portfolio_url?: string | null
  why_join: string
  muslim_owned_experience: boolean
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string | null
  reviewed_at?: string | null
  rejection_reason?: string | null
  created_at: string
}

export interface FreelancerApplicationWithDetails extends FreelancerApplicationRecord {
  // Profile data
  bio: string
  hourly_rate: number
  onboarding_completed: boolean
  is_verified: boolean
  linkedin_url?: string | null
  github_url?: string | null
  
  // Skills data
  freelancer_skills: Array<{
    skill_name: string
    skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    years_experience: number
  }>
}