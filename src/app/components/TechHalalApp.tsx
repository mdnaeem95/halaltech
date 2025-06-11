/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Menu, X, Code, Smartphone, Monitor, Palette, ChevronRight, Star, Phone, Mail, MapPin, Check, ArrowRight, Loader2 } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import AuthModal from './auth/AuthModal'
import UserMenu from './auth/UserMenu'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

const TechHalalApp = () => {
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [services, setServices] = useState<any[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: ''
  })
  const [submittingContact, setSubmittingContact] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [serviceModalOpen, setServiceModalOpen] = useState(false)

  const ServiceDetailModal = dynamic(
    () => import('./ServiceDetailModal'),
    { 
      loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }
  )

  useEffect(() => {
    // Check auth status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    // Fetch services
    fetchServices()

    return () => subscription.unsubscribe()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      if (data.success) {
        setServices(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoadingServices(false)
    }
  }

  const testimonials = [
    {
      name: "Ahmad Ibrahim",
      company: "Halal Fresh Groceries",
      text: "Excellent service! They understood our needs perfectly and delivered a beautiful e-commerce site.",
      rating: 5
    },
    {
      name: "Fatimah Abdullah",
      company: "Modest Fashion SG",
      text: "Professional team that respects our values. The mobile app they built exceeded expectations.",
      rating: 5
    },
    {
      name: "Muhammad Hassan",
      company: "Islamic Education Hub",
      text: "Great communication throughout the project. Our learning platform is now serving thousands.",
      rating: 5
    }
  ]

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'web', label: 'Web Development' },
    { value: 'mobile', label: 'Mobile Apps' },
    { value: 'design', label: 'Design' }
  ]

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory)

  const handleContactSubmit = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmittingContact(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success(data.message)
        setContactForm({
          name: '',
          email: '',
          company: '',
          phone: '',
          service: '',
          message: ''
        })
      } else {
        toast.error(data.error || 'Failed to submit form')
      }
    } catch (error) {
      toast.error('Failed to submit form')
      console.log('Failed to submit form: ', error)
    } finally {
      setSubmittingContact(false)
    }
  }

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'web':
        return <Monitor className="w-8 h-8" />
      case 'mobile':
        return <Smartphone className="w-8 h-8" />
      case 'design':
        return <Palette className="w-8 h-8" />
      default:
        return <Code className="w-8 h-8" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-emerald-600">
                TechHalal
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-emerald-600 transition">Services</a>
              <a href="#about" className="text-gray-700 hover:text-emerald-600 transition">About</a>
              <a href="#testimonials" className="text-gray-700 hover:text-emerald-600 transition">Testimonials</a>
              <a href="#contact" className="text-gray-700 hover:text-emerald-600 transition">Contact</a>
              
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-emerald-600 transition"
                  >
                    Dashboard
                  </Link>
                  <UserMenu />
                </>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                  Get Started
                </button>
              )}
            </div>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#services" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Services</a>
              <a href="#about" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">About</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Testimonials</a>
              <a href="#contact" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Contact</a>
              {user ? (
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full text-left bg-emerald-600 text-white px-3 py-2 rounded"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
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
                onClick={() => setAuthModalOpen(true)}
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

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h3>
            <p className="text-lg text-gray-600">Comprehensive tech solutions for your business needs</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
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

          {/* Service Cards */}
          {loadingServices ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredServices.map(service => (
                <div key={service.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                      {getServiceIcon(service.category)}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-gray-600">4.9</span>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h4>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <ul className="space-y-2 mb-4">
                    {service.features?.slice(0, 4).map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-lg font-semibold text-gray-900">
                      From ${service.base_price?.toLocaleString() || '2,500'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedService(service)
                        setServiceModalOpen(true)
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
                    >
                      View Details <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose TechHalal?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-lg p-2 mr-4">
                    <Check className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Understanding of Islamic Values</h4>
                    <p className="text-gray-600">We respect and incorporate Islamic principles in our business practices</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-lg p-2 mr-4">
                    <Check className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Local Expertise</h4>
                    <p className="text-gray-600">Deep understanding of Singapore&apos;s Muslim business community</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-lg p-2 mr-4">
                    <Check className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Modern Technology</h4>
                    <p className="text-gray-600">Latest tech stack and best practices for optimal results</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl p-8">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h4 className="text-2xl font-bold text-gray-900 mb-4">500+</h4>
                <p className="text-gray-600 mb-6">Muslim-owned businesses transformed digitally</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client Satisfaction</span>
                    <span className="font-semibold">98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projects Completed</span>
                    <span className="font-semibold">750+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Years of Experience</span>
                    <span className="font-semibold">8+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Client Success Stories</h3>
            <p className="text-lg text-gray-600">Hear from businesses we&apos;ve helped grow</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">&quot;{testimonial.text}&quot;</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
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
                  <span className="text-gray-700">+65 8123 4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-emerald-600 mr-3" />
                  <span className="text-gray-700">hello@techhalal.sg</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-emerald-600 mr-3" />
                  <span className="text-gray-700">Queenstown, Singapore</span>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-emerald-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Business Hours</h4>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="text-gray-600">Saturday: 10:00 AM - 2:00 PM</p>
                <p className="text-gray-600">Sunday & Public Holidays: Closed</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Company</label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="+65 8123 4567"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Service Interested In</label>
                  <select
                    value={contactForm.service}
                    onChange={(e) => setContactForm({...contactForm, service: e.target.value})}
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
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Tell us about your project..."
                  />
                </div>
                
                <button
                  onClick={handleContactSubmit}
                  disabled={submittingContact}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submittingContact ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-2xl font-bold mb-4 text-emerald-400">TechHalal</h5>
              <p className="text-gray-400">Empowering Muslim businesses through technology</p>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">Services</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Web Development</a></li>
                <li><a href="#" className="hover:text-white transition">Mobile Apps</a></li>
                <li><a href="#" className="hover:text-white transition">UI/UX Design</a></li>
                <li><a href="#" className="hover:text-white transition">Consulting</a></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">Company</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Portfolio</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">Newsletter</h6>
              <p className="text-gray-400 mb-4">Get tech tips and updates</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 bg-gray-800 rounded-l-lg flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button className="bg-emerald-600 px-4 py-2 rounded-r-lg hover:bg-emerald-700 transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TechHalal. All rights reserved. Built with ❤️ for the Muslim business community.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <Suspense>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </Suspense>

      {/* Selected Service Modal */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          isOpen={serviceModalOpen}
          onClose={() => {
            setServiceModalOpen(false)
            setSelectedService(null)
          }}
          isAuthenticated={!!user}
          onAuthRequired={() => {
            setServiceModalOpen(false)
            setAuthModalOpen(true)
          }}
        />
      )}
    </div>
  )
}

export default TechHalalApp