// src/app/components/services/ServiceCard.tsx
'use client'

import React from 'react'
import { Star, Check, ArrowRight, Monitor, Smartphone, Palette, Code } from 'lucide-react'
import { Service } from '@/types/services'

interface ServiceCardProps {
  service: Service
  onViewDetails: (service: Service) => void
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onViewDetails }) => {
  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'web':
        return <Monitor className="w-8 h-8" />
      case 'mobile':
        return <Smartphone className="w-8 h-8" />
      case 'design':
        return <Palette className="w-8 h-8" />
      default:
        return <Code className="w-8 h-8" />
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
          {getServiceIcon(service.category)}
        </div>
        <div className="flex items-center">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          <span className="ml-1 text-gray-600">4.9</span>
        </div>
      </div>
      
      <h4 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h4>
      <p className="text-gray-600 mb-4">{service.description}</p>
      
      <ul className="space-y-2 mb-4">
        {service.features?.slice(0, 4).map((feature: string, idx: number) => (
          <li key={idx} className="flex items-center text-sm text-gray-600">
            <Check className="w-4 h-4 text-emerald-600 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      
      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-lg font-semibold text-gray-900">
          From ${service.base_price?.toLocaleString() || '2,500'}
        </span>
        <button
          onClick={() => onViewDetails(service)}
          className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
        >
          View Details <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  )
}

export default ServiceCard