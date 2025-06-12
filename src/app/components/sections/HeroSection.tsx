// src/app/components/sections/HeroSection.tsx
'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'

interface HeroSectionProps {
  onAuthClick: () => void
}

const HeroSection: React.FC<HeroSectionProps> = ({ onAuthClick }) => {
  return (
    <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Empowering Muslim Businesses with Technology
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Professional tech services tailored for Muslim-owned businesses in Singapore. 
            Build your digital presence with partners who understand your values.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onAuthClick}
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center"
            >
              Start Your Project <ChevronRight className="ml-2" />
            </button>
            <a
              href="#services"
              className="bg-white text-emerald-600 border-2 border-emerald-600 px-8 py-3 rounded-lg hover:bg-emerald-50 transition"
            >
              View Our Services
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection