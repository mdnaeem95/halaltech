// src/app/components/sections/ServicesSection.tsx
'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { Service } from '@/types/services'
import ServiceCard from '../services/ServiceCard'
import ServiceFilters from '../services/ServiceFilters'

interface ServicesSectionProps {
  services: Service[]
  loading: boolean
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onServiceSelect: (service: Service) => void
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  loading,
  selectedCategory,
  onCategoryChange,
  onServiceSelect
}) => {
  return (
    <section id="services" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h3>
          <p className="text-lg text-gray-600">Comprehensive tech solutions for your business needs</p>
        </div>

        <ServiceFilters
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onViewDetails={onServiceSelect}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ServicesSection