// src/app/components/sections/AboutSection.tsx
'use client'

import React from 'react'
import { Check } from 'lucide-react'

const AboutSection: React.FC = () => {
  const features = [
    {
      title: "Understanding of Islamic Values",
      description: "We respect and incorporate Islamic principles in our business practices"
    },
    {
      title: "Local Expertise",
      description: "Deep understanding of Singapore's Muslim business community"
    },
    {
      title: "Modern Technology",
      description: "Latest tech stack and best practices for optimal results"
    }
  ]

  const stats = [
    { label: 'Client Satisfaction', value: '98%' },
    { label: 'Projects Completed', value: '750+' },
    { label: 'Years of Experience', value: '8+' }
  ]

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Why Choose TechHalal?
            </h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-emerald-100 rounded-lg p-2 mr-4">
                    <Check className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl p-8">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">500+</h4>
              <p className="text-gray-600 mb-6">Muslim-owned businesses transformed digitally</p>
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{stat.label}</span>
                    <span className="font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection