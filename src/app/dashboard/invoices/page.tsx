// src/app/dashboard/invoices/page.tsx
/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  Receipt, 
  Search, 
  Filter, 
  Download,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Eye,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalRevenue: 0,
    pendingRevenue: 0
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      const data = await res.json()
      if (data.success) {
        setInvoices(data.data)
        calculateStats(data.data)
      } else {
        toast.error('Failed to fetch invoices')
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      toast.error('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (invoiceData: any[]) => {
    const now = new Date()
    const stats = invoiceData.reduce((acc, invoice) => {
      acc.total++
      
      if (invoice.status === 'paid') {
        acc.paid++
        acc.totalRevenue += invoice.total_amount
      } else if (invoice.status === 'pending') {
        if (new Date(invoice.due_date) < now) {
          acc.overdue++
        } else {
          acc.pending++
        }
        acc.pendingRevenue += invoice.total_amount
      }
      
      return acc
    }, {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      totalRevenue: 0,
      pendingRevenue: 0
    })
    
    setStats(stats)
  }

  const markAsPaid = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: 'bank_transfer'
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Invoice marked as paid')
        fetchInvoices()
      } else {
        toast.error('Failed to update invoice')
      }
    } catch (error) {
      console.error('Failed to update invoice:', error)
      toast.error('Failed to update invoice')
    }
  }

  const sendReminder = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/reminder`, {
        method: 'POST',
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Payment reminder sent')
      } else {
        toast.error('Failed to send reminder')
      }
    } catch (error) {
      console.error('Failed to send reminder:', error)
      toast.error('Failed to send reminder')
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesFilter = filter === 'all' || 
      (filter === 'overdue' && invoice.status === 'pending' && new Date(invoice.due_date) < new Date()) ||
      (filter === invoice.status)
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.project?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.project?.client?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.project?.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (invoice: any) => {
    if (invoice.status === 'paid') {
      return (
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1" />
          Paid
        </span>
      )
    }
    
    const isOverdue = new Date(invoice.due_date) < new Date()
    if (invoice.status === 'pending' && isOverdue) {
      return (
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 flex items-center">
          <XCircle className="w-4 h-4 mr-1" />
          Overdue
        </span>
      )
    }
    
    return (
      <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center">
        <Clock className="w-4 h-4 mr-1" />
        Pending
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-2">Manage and track all project invoices</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Receipt className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">
                ${stats.pendingRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by invoice number, project, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Invoices</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoice.project?.client?.full_name || 'N/A'}
                      </div>
                      {invoice.project?.client?.company_name && (
                        <div className="text-xs text-gray-500">
                          {invoice.project.client.company_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {invoice.project?.title || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${invoice.total_amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        GST: ${invoice.tax_amount?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                      </div>
                      {invoice.paid_at && (
                        <div className="text-xs text-gray-500">
                          Paid: {format(new Date(invoice.paid_at), 'MMM d')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`/dashboard/invoices/${invoice.id}`, '_blank')}
                          className="text-emerald-600 hover:text-emerald-900"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toast('PDF download coming soon!')}
                          className="text-gray-600 hover:text-gray-900"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {invoice.status === 'pending' && (
                          <>
                            <button
                              onClick={() => markAsPaid(invoice.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => sendReminder(invoice.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Send Reminder"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}