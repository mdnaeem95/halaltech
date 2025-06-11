/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Package,
  DollarSign,
  ArrowUpDown
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('display_order')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services')
      const data = await res.json()
      if (data.success) {
        setServices(data.data)
      } else {
        toast.error('Failed to fetch services')
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
      toast.error('Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'}`)
        fetchServices()
      } else {
        toast.error('Failed to update service status')
      }
    } catch (error) {
      console.error('Failed to update service:', error)
      toast.error('Failed to update service status')
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Service deleted successfully')
        fetchServices()
      } else {
        toast.error(data.error || 'Failed to delete service')
      }
    } catch (error) {
      console.error('Failed to delete service:', error)
      toast.error('Failed to delete service')
    }
  }

  const filteredServices = services
    .filter((service) => {
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'price':
          return (a.base_price || 0) - (b.base_price || 0)
        case 'display_order':
        default:
          return (a.display_order || 999) - (b.display_order || 999)
      }
    })

  const getCategoryBadge = (category: string) => {
    const categoryConfig: any = {
      web: { bg: 'bg-blue-100', text: 'text-blue-800' },
      mobile: { bg: 'bg-purple-100', text: 'text-purple-800' },
      design: { bg: 'bg-pink-100', text: 'text-pink-800' },
      consulting: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    }

    const config = categoryConfig[category] || { bg: 'bg-gray-100', text: 'text-gray-800' }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {category}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-600 mt-2">Manage your service offerings and packages</p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Service
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile Apps</option>
              <option value="design">Design</option>
              <option value="consulting">Consulting</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="display_order">Display Order</option>
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No services found</p>
            <Link
              href="/dashboard/services/new"
              className="text-emerald-600 hover:text-emerald-700 font-medium mt-2 inline-block"
            >
              Add your first service
            </Link>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-lg shadow hover:shadow-lg transition ${
                !service.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {service.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getCategoryBadge(service.category)}
                      {!service.is_active && (
                        <span className="text-xs text-red-600 font-medium">Inactive</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleServiceStatus(service.id, service.is_active)}
                    className="text-gray-400 hover:text-gray-600"
                    title={service.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {service.is_active ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-700">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-semibold">
                      {service.base_price ? `From $${service.base_price.toLocaleString()}` : 'Custom Pricing'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Order: {service.display_order || '-'}
                  </span>
                </div>

                {service.service_packages?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {service.service_packages.length} package{service.service_packages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/services/${service.id}/packages`}
                    className="flex-1 bg-emerald-100 text-emerald-700 py-2 rounded-lg hover:bg-emerald-200 transition flex items-center justify-center"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Packages ({service.service_packages?.length || 0})
                  </Link>
                  <Link
                    href={`/dashboard/services/${service.id}/edit`}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteService(service.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Services</p>
          <p className="text-2xl font-bold text-gray-900">{services.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Active Services</p>
          <p className="text-2xl font-bold text-emerald-600">
            {services.filter(s => s.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Packages</p>
          <p className="text-2xl font-bold text-gray-900">
            {services.reduce((sum, s) => sum + (s.service_packages?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Avg Base Price</p>
          <p className="text-2xl font-bold text-gray-900">
            ${Math.round(
              services.filter(s => s.base_price).reduce((sum, s) => sum + s.base_price, 0) / 
              services.filter(s => s.base_price).length || 0
            ).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}