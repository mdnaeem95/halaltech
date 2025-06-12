// src/types/services.ts
export interface Service {
  id: string
  title: string
  slug: string
  description: string
  category: ServiceCategory
  base_price?: number
  price_unit?: string
  duration_estimate?: string | null
  features?: string[] | null
  display_order?: number | null
  is_active: boolean
  service_packages?: ServicePackage[]
}

export interface ServicePackage {
  id: string
  name: string
  price: number
  delivery_days: number
  revisions: number | null
  features: string[] | null
  is_popular: boolean
}

export type ServiceCategory = 'web' | 'mobile' | 'design' | 'consulting'

export interface CategoryOption {
  value: string
  label: string
}

export interface Testimonial {
  id?: string
  name: string
  company: string
  text: string
  rating: number
}

export interface ContactFormData {
  name: string
  email: string
  company: string
  phone: string
  service: string
  message: string
}