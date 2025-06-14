/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Database, Users, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface FreelancerSeedData {
  email: string
  name: string
  id: string
}

export default function AdminSeedingPage() {
  const [loading, setLoading] = useState(false)
  const [checkingData, setCheckingData] = useState(false)
  const [seededFreelancers, setSeededFreelancers] = useState<FreelancerSeedData[]>([])
  const [currentData, setCurrentData] = useState<any[]>([])

  const handleSeedData = async (clearExisting = false) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/seed-freelancers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clearExisting }),
      })

      const data = await response.json()

      if (data.success) {
        setSeededFreelancers(data.data || [])
        toast.success(data.message)
        // Refresh current data
        await checkCurrentData()
      } else {
        toast.error(data.error || 'Failed to seed data')
      }
    } catch (error) {
      console.error('Seeding error:', error)
      toast.error('Failed to seed data')
    } finally {
      setLoading(false)
    }
  }

  const checkCurrentData = async () => {
    setCheckingData(true)
    try {
      const response = await fetch('/api/admin/seed-freelancers')
      const data = await response.json()

      if (data.success) {
        setCurrentData(data.data || [])
      } else {
        toast.error('Failed to check current data')
      }
    } catch (error) {
      console.error('Check data error:', error)
      toast.error('Failed to check current data')
    } finally {
      setCheckingData(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <Database className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Freelancer Database Seeding
            </h1>
            <p className="text-gray-600">
              Populate your database with realistic freelancer data for testing
            </p>
          </div>

          {/* Current Data Status */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Current Database Status</h2>
              <button
                onClick={checkCurrentData}
                disabled={checkingData}
                className="flex items-center px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${checkingData ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {checkingData ? (
              <div className="flex items-center text-gray-600">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking database...
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-700">
                    {currentData.length} test freelancers in database
                  </span>
                </div>
                {currentData.length > 0 && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            )}

            {currentData.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentData.slice(0, 6).map((freelancer, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{freelancer.full_name}</p>
                        <p className="text-sm text-gray-600">{freelancer.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-emerald-600">
                          ${freelancer.hourly_rate}/hr
                        </p>
                        <p className="text-xs text-gray-500">
                          ⭐ {freelancer.rating} ({freelancer.total_reviews})
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {currentData.length > 6 && (
                  <div className="col-span-full text-center text-gray-500 text-sm">
                    ... and {currentData.length - 6} more
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleSeedData(false)}
                disabled={loading}
                className="flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Database className="w-5 h-5 mr-2" />
                )}
                Add Test Freelancers
              </button>

              <button
                onClick={() => handleSeedData(true)}
                disabled={loading}
                className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5 mr-2" />
                )}
                Clear & Reseed Data
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">What this will create:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>8 realistic freelancer profiles with diverse skills</li>
                    <li>Multiple skills per freelancer (React, Flutter, Python, etc.)</li>
                    <li>Realistic ratings, earnings, and availability status</li>
                    <li>Working hours and availability schedules</li>
                    <li>Portfolio and social media links</li>
                  </ul>
                  <p className="mt-3 font-medium">
                    Default password for all test accounts: <code className="bg-blue-100 px-1 rounded">TestPassword123!</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Seeding Results */}
          {seededFreelancers.length > 0 && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Successfully Seeded Freelancers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {seededFreelancers.map((freelancer, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="font-medium text-gray-900">{freelancer.name}</p>
                    <p className="text-sm text-gray-600">{freelancer.email}</p>
                    <p className="text-xs text-green-600 font-mono">{freelancer.id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/marketplace/freelancers"
                className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <Users className="w-4 h-4 mr-2" />
                View Marketplace
              </a>
              <a
                href="/dashboard/freelancers"
                className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <Database className="w-4 h-4 mr-2" />
                Admin Dashboard
              </a>
              <button
                onClick={checkCurrentData}
                className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}