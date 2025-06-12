// src/app/components/services/ServiceFilters.tsx
'use client'

import { serviceCategories } from '@/app/constants/categories'
import React from 'react'

interface ServiceFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({ 
  selectedCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {serviceCategories.map(cat => (
        <button
          key={cat.value}
          onClick={() => onCategoryChange(cat.value)}
          className={`px-4 py-2 rounded-full transition ${
            selectedCategory === cat.value
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}

export default ServiceFilters