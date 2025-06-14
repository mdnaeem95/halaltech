/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface FreelancerProfile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  role: 'service_provider'
  is_verified: boolean
  bio: string | null
  hourly_rate: number | null
  availability_status: 'available' | 'busy' | 'unavailable'
  years_experience: number
  portfolio_url: string | null
  linkedin_url: string | null
  github_url: string | null
  total_earnings: number
  rating: number
  total_reviews: number
  stripe_account_id: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
  freelancer_skills?: FreelancerSkill[]
  project_assignments?: ProjectAssignment[]
}

export interface FreelancerSkill {
  id: string
  freelancer_id: string
  skill_name: string
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  years_experience: number
  created_at: string
}

export interface FreelancerPortfolio {
  id: string
  freelancer_id: string
  title: string
  description: string | null
  project_url: string | null
  github_url: string | null
  image_urls: string[]
  technologies: string[]
  category: string | null
  featured: boolean
  created_at: string
  updated_at: string
}

export interface FreelancerAvailability {
  id: string
  freelancer_id: string
  day_of_week: number // 0-6 (Sunday-Saturday)
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
}

export interface ProjectAssignment {
  id: string
  project_id: string
  freelancer_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'cancelled'
  assigned_at: string
  accepted_at: string | null
  completed_at: string | null
  hourly_rate: number | null
  fixed_price: number | null
  payment_type: 'hourly' | 'fixed'
  estimated_hours: number | null
  actual_hours: number | null
  notes: string | null
  // Relations
  project?: any
  freelancer?: FreelancerProfile
}

export interface FreelancerEarning {
  id: string
  freelancer_id: string
  project_id: string | null
  amount: number
  type: 'project_payment' | 'bonus' | 'adjustment' | 'withdrawal'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  payment_method: string | null
  stripe_transfer_id: string | null
  paid_at: string | null
  created_at: string
}

export interface TimeEntry {
  id: string
  freelancer_id: string
  project_id: string
  description: string | null
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  is_billable: boolean
  is_approved: boolean
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

export interface FreelancerReview {
  id: string
  freelancer_id: string
  client_id: string
  project_id: string | null
  rating: number
  review: string | null
  created_at: string
  // Relations
  client?: any
  project?: any
}

export interface FreelancerStats {
  id: string
  full_name: string | null
  email: string
  hourly_rate: number | null
  rating: number
  total_reviews: number
  total_earnings: number
  total_projects: number
  active_projects: number
  completed_projects: number
}

// Form types
export interface FreelancerOnboardingData {
  bio: string
  hourly_rate: number
  years_experience: number
  skills: {
    skill_name: string
    skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    years_experience: number
  }[]
  portfolio_url?: string
  linkedin_url?: string
  github_url?: string
  availability: {
    day_of_week: number
    start_time: string
    end_time: string
    is_available: boolean
  }[]
}

export interface ProjectAssignmentRequest {
  project_id: string
  freelancer_id: string
  payment_type: 'hourly' | 'fixed'
  hourly_rate?: number
  fixed_price?: number
  estimated_hours?: number
  notes?: string
}

// Search/Filter types
export interface FreelancerSearchFilters {
  skills?: string[]
  min_rating?: number
  max_hourly_rate?: number
  availability_status?: string
  category?: string
  sort_by?: 'rating' | 'hourly_rate' | 'experience' | 'projects_completed'
  sort_order?: 'asc' | 'desc'
}