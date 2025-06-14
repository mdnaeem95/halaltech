// src/app/freelancers/apply/page.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Code, 
  Palette, 
  Smartphone, 
  Globe,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export default function FreelancerApplyPage() {
  const router = useRouter()

  const benefits = [
    {
      icon: Shield,
      title: 'Verified Clients',
      description: 'Work with legitimate Muslim-owned businesses that value quality and professionalism'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join a network of talented professionals supporting each other'
    },
    {
      icon: TrendingUp,
      title: 'Growth Opportunities',
      description: 'Access training, resources, and opportunities to expand your skills'
    }
  ]

  const requirements = [
    'Minimum 2 years of professional experience',
    'Portfolio showcasing your best work',
    'Strong communication skills in English',
    'Commitment to quality and deadlines',
    'Professional references available',
    'Based in or able to work with Singapore timezone'
  ]

  const services = [
    { icon: Globe, label: 'Web Development' },
    { icon: Palette, label: 'UI/UX Design' },
    { icon: Smartphone, label: 'Mobile Development' },
    { icon: Code, label: 'Backend Development' },
  ]

  const stats = [
    { value: '500+', label: 'Active Projects' },
    { value: '$80-150', label: 'Hourly Rates' },
    { value: '95%', label: 'Client Satisfaction' },
    { value: '48hrs', label: 'Avg Response Time' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-emerald-600">
              TechHalal
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Back to Home
              </Link>
              <Link
                href="/freelancer"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Start Application
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl font-bold mb-6">
              Join Singapore&apos;s Premier Halal Tech Marketplace
            </h1>
            <p className="text-xl mb-8 text-emerald-50">
              Connect with Muslim-owned businesses seeking top-tier tech talent. 
              Build meaningful projects while growing your career.
            </p>
            <button
              onClick={() => router.push('/freelancer')}
              className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105 inline-flex items-center"
            >
              Apply Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join TechHalal?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  <Icon className="w-12 h-12 text-emerald-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Needed */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Services We Need</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg text-center hover:shadow-lg transition"
                >
                  <Icon className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <h4 className="font-semibold">{service.label}</h4>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">What We&apos;re Looking For</h2>
              <p className="text-gray-600 mb-8">
                We maintain high standards to ensure our clients receive the best service. 
                Our selection process ensures only qualified professionals join our platform.
              </p>
              <ul className="space-y-3">
                {requirements.map((req, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{req}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="bg-emerald-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Application Process</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Submit Application</h4>
                    <p className="text-gray-600 text-sm">Fill out our comprehensive form</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Review Process</h4>
                    <p className="text-gray-600 text-sm">Our team reviews within 2-3 days</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Start Working</h4>
                    <p className="text-gray-600 text-sm">Get matched with projects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-xl mb-8 text-emerald-50">
            Join our selective network of top-tier freelancers serving the Muslim business community
          </p>
          <button
            onClick={() => router.push('/freelancer')}
            className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105 inline-flex items-center"
          >
            Start Your Application
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  )
}