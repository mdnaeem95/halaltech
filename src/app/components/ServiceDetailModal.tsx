/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { X, Check, Clock, RefreshCw, Star, ArrowRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface ServicePackage {
  id: string
  name: string
  price: number
  delivery_days: number
  revisions: number | null
  features: string[] | null
  is_popular: boolean
}

interface Service {
  id: string
  title: string
  description: string
  category: string
  features: string[] | null
  duration_estimate: string | null
}

interface ServiceDetailModalProps {
  service: Service
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  onAuthRequired: () => void
}

export default function ServiceDetailModal({ 
  service, 
  isOpen, 
  onClose, 
  isAuthenticated,
  onAuthRequired 
}: ServiceDetailModalProps) {
  const router = useRouter()
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && service) {
      fetchPackages()
    }
  }, [isOpen, service])

  const fetchPackages = async () => {
    try {
      const res = await fetch(`/api/services/${service.id}/packages`)
      const data = await res.json()
      
      if (data.success && data.data.length > 0) {
        setPackages(data.data)
        // Pre-select the popular package if exists
        const popularPackage = data.data.find((pkg: ServicePackage) => pkg.is_popular)
        if (popularPackage) {
          setSelectedPackage(popularPackage.id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      onAuthRequired()
      return
    }

    if (packages.length > 0 && !selectedPackage) {
      toast.error('Please select a package')
      return
    }

    // Navigate to project creation with service and package info
    const params = new URLSearchParams({
      service: service.id,
      ...(selectedPackage && { package: selectedPackage })
    })
    
    router.push(`/dashboard/projects/new?${params.toString()}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h2>
              <p className="text-lg text-gray-600">{service.description}</p>
              {service.duration_estimate && (
                <p className="mt-2 text-sm text-gray-500">
                  Typical timeline: {service.duration_estimate}
                </p>
              )}
            </div>

            {/* Service Features */}
            {service.features && service.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s Included</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packages */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : packages.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Package</h3>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`relative rounded-lg border-2 p-6 cursor-pointer transition ${
                        selectedPackage === pkg.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {pkg.is_popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full inline-flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Most Popular
                          </span>
                        </div>
                      )}

                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                      
                      <div className="text-3xl font-bold text-gray-900 mb-4">
                        ${pkg.price.toLocaleString()}
                        <span className="text-sm text-gray-500 font-normal"> SGD</span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {pkg.delivery_days} days
                        </div>
                        {pkg.revisions && (
                          <div className="flex items-center">
                            <RefreshCw className="w-4 h-4 mr-1" />
                            {pkg.revisions} revisions
                          </div>
                        )}
                      </div>

                      {pkg.features && pkg.features.length > 0 && (
                        <ul className="space-y-2">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-600">
                              <Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      {selectedPackage === pkg.id && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-emerald-500 text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <p className="text-gray-600 text-center">
                  Custom pricing available. Click below to discuss your project requirements.
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="flex justify-end">
              <button
                onClick={handleGetStarted}
                className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition flex items-center"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Create the API route to fetch packages for a service
// src/app/api/services/[id]/packages/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('service_packages')
      .select('*')
      .eq('service_id', id)
      .order('price', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Packages fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch packages' 
      },
      { status: 500 }
    )
  }
}