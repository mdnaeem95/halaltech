'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'

const Footer: React.FC = () => {
  const [email, setEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    // TODO: Implement newsletter subscription
    toast.success('Thank you for subscribing!')
    setEmail('')
  }

  const footerLinks = {
    services: [
      { label: 'Web Development', href: '#' },
      { label: 'Mobile Apps', href: '#' },
      { label: 'UI/UX Design', href: '#' },
      { label: 'Consulting', href: '#' },
    ],
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Portfolio', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  }

  return (
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
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h6 className="font-semibold mb-4">Company</h6>
            <ul className="space-y-2 text-gray-400">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h6 className="font-semibold mb-4">Newsletter</h6>
            <p className="text-gray-400 mb-4">Get tech tips and updates</p>
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="px-4 py-2 bg-gray-800 rounded-l-lg flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
              />
              <button
                type="submit"
                className="bg-emerald-600 px-4 py-2 rounded-r-lg hover:bg-emerald-700 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 TechHalal. All rights reserved. Built with ❤️ for the Muslim business community.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer