// src/app/dashboard/invoices/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { 
  ArrowLeft, 
  Download, 
  Mail,
  CheckCircle,
  Clock,
  Printer
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Invoice {
  id: string
  invoice_number: string
  amount: number
  tax_amount: number
  total_amount: number
  status: 'pending' | 'paid' | 'cancelled'
  due_date: string
  paid_at?: string
  payment_method?: string
  created_at: string
  project: {
    id: string
    title: string
    description: string
    service: {
      title: string
    }
    package?: {
      name: string
    }
    client: {
      id: string
      full_name: string
      company_name?: string
      email: string
      phone?: string
      address?: string
    }
  }
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchInvoice()
    }
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`)
      const data = await res.json()
      
      if (data.success) {
        setInvoice(data.data)
      } else {
        toast.error('Failed to fetch invoice')
        router.push('/dashboard/invoices')
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error)
      toast.error('Failed to fetch invoice')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    toast('PDF download coming soon!')
  }

  const handleSendEmail = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}/send`, {
        method: 'POST',
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Invoice sent to client')
      } else {
        toast.error('Failed to send invoice')
      }
    } catch (error) {
      console.error('Failed to send invoice:', error)
      toast.error('Failed to send invoice')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Invoice not found</p>
        <button
          onClick={() => router.push('/dashboard/invoices')}
          className="mt-4 text-emerald-600 hover:text-emerald-700"
        >
          Back to invoices
        </button>
      </div>
    )
  }

  const isPaid = invoice.status === 'paid'
  const isOverdue = !isPaid && new Date(invoice.due_date) < new Date()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Actions - Hide in print */}
      <div className="mb-6 no-print">
        <button
          onClick={() => router.push('/dashboard/invoices')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to invoices
        </button>
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={handleSendEmail}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send to Client
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none">
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 print:bg-white print:text-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2 print:text-gray-900">INVOICE</h2>
              <p className="text-lg print:text-gray-700">#{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold mb-1 print:text-gray-900">TechHalal</h3>
              <p className="print:text-gray-700">Queenstown, Singapore</p>
              <p className="print:text-gray-700">hello@techhalal.sg</p>
              <p className="print:text-gray-700">+65 8123 4567</p>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {isPaid ? (
          <div className="bg-green-50 border-b border-green-200 px-8 py-4 no-print">
            <div className="flex items-center text-green-800">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">
                Paid on {format(new Date(invoice.paid_at!), 'MMMM d, yyyy')}
                {invoice.payment_method && ` via ${invoice.payment_method}`}
              </span>
            </div>
          </div>
        ) : isOverdue ? (
          <div className="bg-red-50 border-b border-red-200 px-8 py-4 no-print">
            <div className="flex items-center text-red-800">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-medium">Overdue - Payment was due on {format(new Date(invoice.due_date), 'MMMM d, yyyy')}</span>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border-b border-yellow-200 px-8 py-4 no-print">
            <div className="flex items-center text-yellow-800">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-medium">Payment due by {format(new Date(invoice.due_date), 'MMMM d, yyyy')}</span>
            </div>
          </div>
        )}

        <div className="p-8 space-y-8">
          {/* Billing Info */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">BILL TO</h3>
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{invoice.project.client.full_name}</p>
                {invoice.project.client.company_name && (
                  <p className="text-gray-700">{invoice.project.client.company_name}</p>
                )}
                <p className="text-gray-700">{invoice.project.client.email}</p>
                {invoice.project.client.phone && (
                  <p className="text-gray-700">{invoice.project.client.phone}</p>
                )}
                {invoice.project.client.address && (
                  <p className="text-gray-700 whitespace-pre-line">{invoice.project.client.address}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">INVOICE DETAILS</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Date:</span>
                  <span className="font-medium">{format(new Date(invoice.created_at), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{format(new Date(invoice.due_date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    isPaid ? 'text-green-600' : isOverdue ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">PROJECT DETAILS</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{invoice.project.title}</h4>
              <p className="text-gray-700 text-sm mb-2">{invoice.project.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600">
                  Service: <span className="font-medium text-gray-900">{invoice.project.service.title}</span>
                </span>
                {invoice.project.package && (
                  <span className="text-gray-600">
                    Package: <span className="font-medium text-gray-900">{invoice.project.package.name}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Table */}
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">DESCRIPTION</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4">
                    <p className="font-medium text-gray-900">{invoice.project.service.title}</p>
                    {invoice.project.package && (
                      <p className="text-sm text-gray-600">{invoice.project.package.name} Package</p>
                    )}
                  </td>
                  <td className="text-right py-4 font-medium">
                    ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-right text-gray-600">Subtotal</td>
                  <td className="text-right py-3 font-medium">
                    ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-right text-gray-600">GST (9%)</td>
                  <td className="text-right py-3 font-medium">
                    ${invoice.tax_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-right font-semibold text-gray-900">Total Due</td>
                  <td className="text-right py-4 text-xl font-bold text-emerald-600">
                    ${invoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Instructions */}
          {!isPaid && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Payment Instructions</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>Please make payment via bank transfer to:</p>
                <div className="ml-4 space-y-1">
                  <p><strong>Bank:</strong> DBS Bank</p>
                  <p><strong>Account Name:</strong> TechHalal Pte Ltd</p>
                  <p><strong>Account Number:</strong> 123-456789-0</p>
                  <p><strong>Reference:</strong> {invoice.invoice_number}</p>
                </div>
                <p className="mt-3">
                  Alternative payment methods available upon request. 
                  Please contact us at hello@techhalal.sg for assistance.
                </p>
              </div>
            </div>
          )}

          {/* Terms */}
          <div className="text-sm text-gray-600 pt-8 border-t">
            <p className="font-medium mb-2">Terms & Conditions</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Payment is due within 7 days of invoice date</li>
              <li>Late payments may incur additional charges</li>
              <li>All prices are in Singapore Dollars (SGD)</li>
              <li>This invoice is computer generated and valid without signature</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}