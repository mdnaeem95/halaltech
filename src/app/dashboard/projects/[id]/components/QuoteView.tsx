// src/app/dashboard/projects/[id]/components/QuoteView.tsx
/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { format, differenceInDays } from 'date-fns'
import { 
  CheckCircle, 
  XCircle, 
  Calendar,
  Download,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface QuoteViewProps {
  quote: any
  project: any
  userRole: string
  onQuoteUpdate: () => void
}

export default function QuoteView({ quote, project, userRole, onQuoteUpdate }: QuoteViewProps) {
  const [processing, setProcessing] = useState(false)
  const [action, setAction] = useState<'accept' | 'reject' | null>(null)

  const isExpired = new Date(quote.valid_until) < new Date()
  const daysUntilExpiry = differenceInDays(new Date(quote.valid_until), new Date())
  const canRespond = userRole === 'client' && !quote.is_accepted && !isExpired && project.status === 'quoted'

  const handleQuoteResponse = async (responseAction: 'accept' | 'reject') => {
    setProcessing(true)
    setAction(responseAction)
    
    try {
      const res = await fetch(`/api/projects/${project.id}/quote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: responseAction }),
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success(data.message)
        onQuoteUpdate()
      } else {
        toast.error(data.error || `Failed to ${responseAction} quote`)
      }
    } catch (error) {
      console.error(`Failed to ${responseAction} quote:`, error)
      toast.error(`Failed to ${responseAction} quote`)
    } finally {
      setProcessing(false)
      setAction(null)
    }
  }

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    toast('PDF download coming soon!')
  }

  const subtotal = quote.amount
  const tax = subtotal * 0.09 // 9% GST
  const total = subtotal + tax

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Project Quote</h2>
            <p className="text-emerald-100">
              Quote #{quote.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-emerald-100">Created on</p>
            <p className="font-semibold">{format(new Date(quote.created_at), 'MMM d, yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {quote.is_accepted && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3">
          <div className="flex items-center text-green-800">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Quote Accepted on {format(new Date(quote.accepted_at), 'MMM d, yyyy')}</span>
          </div>
        </div>
      )}

      {isExpired && !quote.is_accepted && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex items-center text-red-800">
            <XCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">This quote has expired</span>
          </div>
        </div>
      )}

      {!isExpired && !quote.is_accepted && daysUntilExpiry <= 3 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="flex items-center text-yellow-800">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Quote expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Client & Project Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Prepared For</h3>
            <p className="font-semibold text-gray-900">{project.client.full_name}</p>
            {project.client.company_name && (
              <p className="text-gray-600">{project.client.company_name}</p>
            )}
            <p className="text-gray-600">{project.client.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Project Details</h3>
            <p className="font-semibold text-gray-900">{project.title}</p>
            <p className="text-gray-600">{project.service.title}</p>
            {project.package && (
              <p className="text-sm text-gray-500">{project.package.name} Package</p>
            )}
          </div>
        </div>

        {/* Quote Validity */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Quote Valid Until</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(quote.valid_until), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          {!quote.is_accepted && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isExpired 
                ? 'bg-red-100 text-red-800' 
                : daysUntilExpiry <= 3 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
            }`}>
              {isExpired ? 'Expired' : `${daysUntilExpiry} days remaining`}
            </div>
          )}
        </div>

        {/* Deliverables */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deliverables</h3>
          <div className="space-y-3">
            {quote.deliverables.map((deliverable: any, index: number) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-emerald-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{deliverable.title}</h4>
                  {deliverable.description && (
                    <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Summary</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (9%)</span>
                <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
                <span>Total</span>
                <span className="text-emerald-600">
                  ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Terms</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900">{quote.payment_terms}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          {canRespond ? (
            <>
              <button
                onClick={() => handleQuoteResponse('accept')}
                disabled={processing}
                className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing && action === 'accept' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Accept Quote
                  </>
                )}
              </button>
              <button
                onClick={() => handleQuoteResponse('reject')}
                disabled={processing}
                className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing && action === 'reject' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    Request Revision
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="flex-1 text-center text-gray-600">
              {quote.is_accepted && (
                <p className="flex items-center justify-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  This quote has been accepted
                </p>
              )}
              {isExpired && !quote.is_accepted && (
                <p className="flex items-center justify-center text-red-600">
                  <Clock className="w-5 h-5 mr-2" />
                  This quote has expired. Please request a new quote.
                </p>
              )}
              {userRole === 'admin' && !quote.is_accepted && !isExpired && (
                <p className="flex items-center justify-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  Waiting for client response
                </p>
              )}
            </div>
          )}
          
          <button
            onClick={handleDownloadPDF}
            className="sm:w-auto bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}