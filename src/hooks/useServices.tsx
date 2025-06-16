// src/hooks/useServices.tsx
import { useState, useEffect } from 'react'
import { Service } from '@/types/services'
import toast from 'react-hot-toast'

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch('/api/services', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })
      
      if (!res.ok) {
        throw new Error(`Failed to fetch services: ${res.status}`)
      }
      
      const data = await res.json()
      
      if (data.success && Array.isArray(data.data)) {
        setServices(data.data)
      } else {
        // Handle case where data structure is unexpected
        console.warn('Unexpected services data structure:', data)
        setServices([])
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
      setError(error instanceof Error ? error.message : 'Failed to load services')
      
      // Don't show toast for initial load failures to avoid annoying users
      if (services.length > 0) {
        toast.error('Failed to refresh services')
      }
      
      // Set empty array to prevent undefined errors
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory)

  return {
    services,
    filteredServices,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    refetch: fetchServices,
  }
}