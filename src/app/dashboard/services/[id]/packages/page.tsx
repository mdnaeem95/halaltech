// src/app/dashboard/services/[id]/packages/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  Clock,
  RefreshCw,
  Star,
  Package
} from 'lucide-react'
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
  category: string
}

export default function ServicePackagesPage() {
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState<Service | null>(null)
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [, setEditingPackage] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    delivery_days: '',
    revisions: '',
    features: [''],
    is_popular: false
  })

  useEffect(() => {
    if (params.id) {
      fetchServiceAndPackages()
    }
  }, [params.id])

  const fetchServiceAndPackages = async () => {
    try {
      // Fetch service details
      const serviceRes = await fetch(`/api/admin/services/${params.id}`)
      const serviceData = await serviceRes.json()
      
      if (serviceData.success) {
        setService(serviceData.data)
      } else {
        toast.error('Failed to fetch service')
        router.push('/dashboard/services')
        return
      }

      // Fetch packages
      const packagesRes = await fetch(`/api/admin/services/${params.id}/packages`)
      const packagesData = await packagesRes.json()
      
      if (packagesData.success) {
        setPackages(packagesData.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      delivery_days: '',
      revisions: '',
      features: [''],
      is_popular: false
    })
    setShowAddForm(false)
    setEditingPackage(null)
  }

  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    })
  }

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({
      ...formData,
      features: newFeatures
    })
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.price || !formData.delivery_days) {
      toast.error('Please fill in all required fields')
      return
    }

    const packageData = {
      name: formData.name,
      price: parseFloat(formData.price),
      delivery_days: parseInt(formData.delivery_days),
      revisions: formData.revisions ? parseInt(formData.revisions) : null,
      features: formData.features.filter(f => f.trim() !== ''),
      is_popular: formData.is_popular
    }

    try {
      const res = await fetch(`/api/admin/services/${params.id}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData),
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success('Package created successfully')
        resetForm()
        fetchServiceAndPackages()
      } else {
        toast.error(data.error || 'Failed to create package')
      }
    } catch (error) {
      console.error('Failed to create package:', error)
      toast.error('Failed to create package')
    }
  }

//   const handleUpdate = async (packageId: string) => {
//     // Similar to handleSubmit but with PATCH method
//     // Implementation would be similar, updating existing package
//     toast('Update functionality to be implemented')
//     setEditingPackage(null)
//   }

  const handleDelete = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) {
      return
    }

    try {
      // Note: You'll need to create this DELETE endpoint
      const res = await fetch(`/api/admin/services/${params.id}/packages/${packageId}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success('Package deleted successfully')
        fetchServiceAndPackages()
      } else {
        toast.error(data.error || 'Failed to delete package')
      }
    } catch (error) {
      console.error('Failed to delete package:', error)
      toast.error('Failed to delete package')
    }
  }

  const togglePopular = async (packageId: string) => {
    try {
      // Note: You'll need to create this endpoint
      const res = await fetch(`/api/admin/services/${params.id}/packages/${packageId}/popular`, {
        method: 'PATCH',
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success('Popular status updated')
        fetchServiceAndPackages()
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Failed to update popular status:', error)
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Service not found</p>
        <button
          onClick={() => router.push('/dashboard/services')}
          className="mt-4 text-emerald-600 hover:text-emerald-700"
        >
          Back to services
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/services/${params.id}/edit`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {service.title}
        </button>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Packages</h1>
            <p className="text-gray-600 mt-2">
              Manage pricing packages for {service.title}
            </p>
          </div>
          
          {!showAddForm && packages.length < 5 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Package
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Package
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Basic, Standard, Premium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (SGD) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="2500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Days *
              </label>
              <input
                type="number"
                value={formData.delivery_days}
                onChange={(e) => setFormData({...formData, delivery_days: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="14"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revisions
              </label>
              <input
                type="number"
                value={formData.revisions}
                onChange={(e) => setFormData({...formData, revisions: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="3"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Feature description"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddFeature}
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                + Add Feature
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_popular}
                onChange={(e) => setFormData({...formData, is_popular: e.target.checked})}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Mark as most popular</span>
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSubmit}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Create Package
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No packages created yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Create your first package
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-lg shadow hover:shadow-lg transition ${
                pkg.is_popular ? 'ring-2 ring-emerald-500' : ''
              }`}
            >
              {pkg.is_popular && (
                <div className="bg-emerald-500 text-white text-center py-2 rounded-t-lg">
                  <Star className="w-4 h-4 inline mr-1" />
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                
                <div className="text-3xl font-bold text-emerald-600 mb-4">
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
                  <ul className="space-y-2 mb-4">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => setEditingPackage(pkg.id)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => togglePopular(pkg.id)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                    title={pkg.is_popular ? 'Remove popular status' : 'Mark as popular'}
                  >
                    <Star className={`w-4 h-4 ${pkg.is_popular ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {/* Package Pricing Guide */}
      {packages.length >= 2 && (
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Package Analytics</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Average Price</p>
              <p className="text-xl font-bold text-gray-900">
                ${Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Price Range</p>
              <p className="text-xl font-bold text-gray-900">
                ${Math.min(...packages.map(p => p.price)).toLocaleString()} - ${Math.max(...packages.map(p => p.price)).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Popular Package</p>
              <p className="text-xl font-bold text-emerald-600">
                {packages.find(p => p.is_popular)?.name || 'None set'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Package Tips</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
          <li>Offer 3 packages (Basic, Standard, Premium) for better conversion</li>
          <li>Mark your recommended package as &quot;Most Popular&quot; to guide clients</li>
          <li>Price your middle package at 2-2.5x the basic package</li>
          <li>Include clear deliverables and timelines for each package</li>
          <li>Consider offering more revisions in higher-tier packages</li>
        </ul>
      </div>
    </div>
  )
}