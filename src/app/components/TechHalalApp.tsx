// src/app/components/TechHalalApp.tsx
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { User } from '@supabase/supabase-js'
import dynamic from 'next/dynamic'
import { Toaster } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Service } from '@/types/services'

// Layout Components
import Navigation from './layout/Navigation'
import Footer from './layout/Footer'

// Section Components
import HeroSection from './sections/HeroSection'
import ServicesSection from './sections/ServicesSection'
import AboutSection from './sections/AboutSection'
import TestimonialsSection from './sections/TestimonialsSection'
import ContactSection from './sections/ContactSection'

// Auth Component
import AuthModal from './auth/AuthModal'

// Custom Hooks
import { useServices } from '@/hooks/useServices'
import { useContactForm } from '@/hooks/useContactForm'
import { AuthErrorBoundary } from './auth/AuthErrorBoundary'

// Dynamic import for Service Detail Modal
const ServiceDetailModal = dynamic(
  () => import('./ServiceDetailModal'),
  { 
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-white" />
      </div>
    )
  }
)

const TechHalalApp: React.FC = () => {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [serviceModalOpen, setServiceModalOpen] = useState(false)

  // Custom hooks
  const { 
    services, 
    filteredServices, 
    loading: loadingServices, 
    selectedCategory, 
    setSelectedCategory 
  } = useServices()
  
  const { 
    formData, 
    updateField, 
    handleSubmit, 
    submitting 
  } = useContactForm()

  // Auth state management
  useEffect(() => {
    // Check initial auth status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Service selection handler
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setServiceModalOpen(true)
  }

  // Auth modal handler
  const handleAuthRequired = () => {
    setServiceModalOpen(false)
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <Navigation 
        user={user} 
        onAuthClick={() => setAuthModalOpen(true)} 
      />

      <main>
        <HeroSection onAuthClick={() => setAuthModalOpen(true)} />
        
        <ServicesSection
          services={filteredServices}
          loading={loadingServices}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onServiceSelect={handleServiceSelect}
        />

        <AboutSection />
        
        <TestimonialsSection />
        
        <ContactSection
          formData={formData}
          updateField={updateField}
          handleSubmit={handleSubmit}
          submitting={submitting}
          services={services}
        />
      </main>

      <Footer />

      {/* Modals */}
      <AuthErrorBoundary>
        <Suspense>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
        </Suspense>
      </AuthErrorBoundary>

      {selectedService && (
        <ServiceDetailModal
          service={{
            ...selectedService,
            features: selectedService.features ?? null,
            duration_estimate: selectedService.duration_estimate ?? null,
          }}
          isOpen={serviceModalOpen}
          onClose={() => {
            setServiceModalOpen(false)
            setSelectedService(null)
          }}
          isAuthenticated={!!user}
          onAuthRequired={handleAuthRequired}
        />
      )}
    </div>
  )
}

export default TechHalalApp