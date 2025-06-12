// src/app/components/sections/ContactSection.tsx
'use client'

import React from 'react'
import { Phone, Mail, MapPin, Loader2 } from 'lucide-react'
import { ContactFormData, Service } from '@/types/services'
import { contactInfo } from '@/app/constants/contact'

interface ContactSectionProps {
  formData: ContactFormData
  updateField: (field: keyof ContactFormData, value: string) => void
  handleSubmit: () => void
  submitting: boolean
  services: Service[]
}

const ContactSection: React.FC<ContactSectionProps> = ({
  formData,
  updateField,
  handleSubmit,
  submitting,
  services
}) => {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Get In Touch</h3>
            <p className="text-lg text-gray-600 mb-8">
              Ready to transform your business digitally? Let&apos;s discuss how we can help.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="w-6 h-6 text-emerald-600 mr-3" />
                <span className="text-gray-700">{contactInfo.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-6 h-6 text-emerald-600 mr-3" />
                <span className="text-gray-700">{contactInfo.email}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-6 h-6 text-emerald-600 mr-3" />
                <span className="text-gray-700">{contactInfo.address}</span>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-emerald-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Business Hours</h4>
              <p className="text-gray-600">{contactInfo.businessHours.weekdays}</p>
              <p className="text-gray-600">{contactInfo.businessHours.saturday}</p>
              <p className="text-gray-600">{contactInfo.businessHours.sunday}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-8">
            <ContactForm
              formData={formData}
              updateField={updateField}
              handleSubmit={handleSubmit}
              submitting={submitting}
              services={services}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

const ContactForm: React.FC<ContactSectionProps> = ({
  formData,
  updateField,
  handleSubmit,
  submitting,
  services
}) => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-2">Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Your name"
          required
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="you@example.com"
          required
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">Company</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => updateField('company', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Your company name"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="+65 8123 4567"
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">Service Interested In</label>
        <select
          value={formData.service}
          onChange={(e) => updateField('service', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">Select a service</option>
          {services.map(service => (
            <option key={service.id} value={service.title}>{service.title}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">Message *</label>
        <textarea
          rows={4}
          value={formData.message}
          onChange={(e) => updateField('message', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Tell us about your project..."
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {submitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  )
}

export default ContactSection