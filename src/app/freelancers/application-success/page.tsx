/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  ArrowRight,
  Home,
  FileText,
  Users
} from 'lucide-react'
import confetti from 'canvas-confetti'

export default function ApplicationSuccessPage() {

  useEffect(() => {
    // Trigger confetti animation on mount
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const nextSteps = [
    {
      icon: Clock,
      title: 'Application Review',
      description: 'Our team will review your application within 24-48 hours',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Mail,
      title: 'Email Notification',
      description: 'You\'ll receive an email once your application is reviewed',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: FileText,
      title: 'Complete Profile',
      description: 'If approved, you\'ll be invited to complete your full profile',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ]

  const faqs = [
    {
      question: 'How long does the review process take?',
      answer: 'We typically review applications within 24-48 hours. During busy periods, it may take up to 3 business days.'
    },
    {
      question: 'What happens after my application is approved?',
      answer: 'You\'ll receive an email with instructions to complete your freelancer profile, including setting your rates, skills, and availability.'
    },
    {
      question: 'Can I update my application?',
      answer: 'Once submitted, applications cannot be edited. However, you can provide additional information when completing your profile after approval.'
    },
    {
      question: 'What are the approval criteria?',
      answer: 'We look for relevant experience, quality portfolio work, and alignment with our mission to serve Muslim-owned businesses in Singapore.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Success Message */}
      <div className="pt-16 pb-8 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Thank you for applying to join our freelancer network. We&apos;re excited to review your application.
          </p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <p className="text-gray-700">
              We&apos;ve sent a confirmation email to the address you provided. 
              Please check your inbox (and spam folder) for next steps.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Next Steps */}
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            What Happens Next?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${step.bgColor} rounded-lg mb-4`}>
                  <step.icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            While You Wait
          </h2>
          <p className="text-gray-600 mb-8">
            Explore our platform and learn more about how we&apos;re helping Muslim-owned businesses succeed online.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              <Users className="w-5 h-5 mr-2" />
              Learn About Us
            </Link>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="py-12 px-4 bg-emerald-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Prepare for Success
            </h3>
            <p className="text-gray-600 mb-6">
              While your application is being reviewed, here are some tips to prepare for your freelancing journey:
            </p>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <ArrowRight className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Update your portfolio with recent projects, especially those relevant to small businesses
                </span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Prepare case studies that showcase your problem-solving abilities
                </span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Think about your ideal project types and pricing strategy
                </span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Consider how you can best serve the Muslim business community in Singapore
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}