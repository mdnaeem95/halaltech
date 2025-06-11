/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { 
  ArrowLeft, 
  Send,
  User,
  Edit,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Save,
  X,
  Calculator,
  Eye,
  Receipt
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [quote, setQuote] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  
  // Admin management states
  const [editingProject, setEditingProject] = useState(false)
  const [projectForm, setProjectForm] = useState({
    status: '',
    quoted_price: '',
    final_price: '',
    start_date: '',
    deadline: ''
  })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProject()
      fetchMessages()
      fetchQuote()
    }
  }, [params.id])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setProject(data.data)
        // Initialize form with current project data
        setProjectForm({
          status: data.data.status || '',
          quoted_price: data.data.quoted_price?.toString() || '',
          final_price: data.data.final_price?.toString() || '',
          start_date: data.data.start_date ? data.data.start_date.split('T')[0] : '',
          deadline: data.data.deadline ? data.data.deadline.split('T')[0] : ''
        })
      } else {
        toast.error('Failed to fetch project')
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
      toast.error('Failed to fetch project')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}/messages`)
      const data = await res.json()
      if (data.success) {
        setMessages(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}/quote`)
      const data = await res.json()
      if (data.success && data.data) {
        setQuote(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setSendingMessage(true)
    try {
      const res = await fetch(`/api/projects/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      })

      const data = await res.json()
      if (data.success) {
        setNewMessage('')
        fetchMessages()
        toast.success('Message sent')
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const updateProject = async () => {
    setUpdating(true)
    try {
      const updateData = {
        status: projectForm.status,
        quoted_price: projectForm.quoted_price ? parseFloat(projectForm.quoted_price) : undefined,
        final_price: projectForm.final_price ? parseFloat(projectForm.final_price) : undefined,
        start_date: projectForm.start_date || undefined,
        deadline: projectForm.deadline || undefined,
      }

      const res = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const data = await res.json()
      if (data.success) {
        setProject(data.data)
        setEditingProject(false)
        toast.success('Project updated successfully')
      } else {
        toast.error(data.error || 'Failed to update project')
      }
    } catch (error) {
      console.error('Failed to update project:', error)
      toast.error('Failed to update project')
    } finally {
      setUpdating(false)
    }
  }

  const quickStatusUpdate = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()
      if (data.success) {
        setProject(data.data)
        toast.success(`Status updated to ${newStatus}`)
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      inquiry: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inquiry', icon: AlertCircle },
      quoted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Quoted', icon: DollarSign },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Progress', icon: Clock },
      review: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'In Review', icon: FileText },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled', icon: XCircle },
    }

    const config = statusConfig[status] || statusConfig.inquiry
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
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

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Project not found</p>
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="mt-4 text-emerald-600 hover:text-emerald-700"
        >
          Back to projects
        </button>
      </div>
    )
  }

  // Check if user is admin (you might want to get this from a context or API)
  const isAdmin = true // For now, assume admin. You can get this from user context

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to projects
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              {getStatusBadge(project.status)}
              <span className="text-gray-600">
                Created {format(new Date(project.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex space-x-2">
              <button
                onClick={() => setEditingProject(!editingProject)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                {editingProject ? 'Cancel Edit' : 'Manage Project'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Admin Quote & Project Management Panel */}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow p-6 border-2 border-emerald-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
              
              {/* Quote Management */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-3">Quote Management</h3>
                <div className="flex flex-wrap gap-2">
                  {project.status === 'inquiry' && !quote && (
                    <Link
                      href={`/dashboard/projects/${params.id}/quote`}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Create Quote
                      {project.package && (
                        <span className="ml-2 text-xs bg-emerald-500 px-2 py-1 rounded">
                          Auto-fill from {project.package.name}
                        </span>
                      )}
                    </Link>
                  )}
                  
                  {quote && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/projects/${params.id}/quote`)}
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Quote (${quote.amount.toLocaleString()})
                      </button>
                      
                      {project.status === 'quoted' && (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Awaiting Client Response
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Project Management */}
              {editingProject && (
                <div className="border-t pt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={projectForm.status}
                        onChange={(e) => setProjectForm({...projectForm, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="inquiry">Inquiry</option>
                        <option value="quoted">Quoted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">In Review</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quoted Price (SGD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={projectForm.quoted_price}
                        onChange={(e) => setProjectForm({...projectForm, quoted_price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="5000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Final Price (SGD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={projectForm.final_price}
                        onChange={(e) => setProjectForm({...projectForm, final_price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="4800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={projectForm.start_date}
                        onChange={(e) => setProjectForm({...projectForm, start_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                      <input
                        type="date"
                        value={projectForm.deadline}
                        onChange={(e) => setProjectForm({...projectForm, deadline: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={updateProject}
                      disabled={updating}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setEditingProject(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions (Admin Only) */}
          {isAdmin && !editingProject && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Status Updates</h3>
              <div className="flex flex-wrap gap-2">
                {project.status === 'inquiry' && (
                  <button
                    onClick={() => quickStatusUpdate('quoted')}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition"
                  >
                    Mark as Quoted
                  </button>
                )}
                {project.status === 'quoted' && (
                  <button
                    onClick={() => quickStatusUpdate('in_progress')}
                    className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm hover:bg-yellow-200 transition"
                  >
                    Start Project
                  </button>
                )}
                {project.status === 'in_progress' && (
                  <button
                    onClick={() => quickStatusUpdate('review')}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition"
                  >
                    Send for Review
                  </button>
                )}
                {project.status === 'review' && (
                  <button
                    onClick={() => quickStatusUpdate('completed')}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-200 transition"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-gray-900">{project.description}</p>
              </div>
              
              {project.requirements && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Requirements</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{project.requirements}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Service</label>
                  <p className="mt-1 text-gray-900">{project.service?.title || 'N/A'}</p>
                </div>
                
                {project.package && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Package</label>
                    <p className="mt-1 text-gray-900 font-semibold">{project.package.name}</p>
                    <p className="text-sm text-gray-600">${project.package.price.toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {project.quoted_price && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quoted Price</label>
                    <p className="mt-1 font-semibold text-emerald-600">
                      ${project.quoted_price.toLocaleString()}
                    </p>
                  </div>
                )}
                
                {project.package && project.package.delivery_days && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estimated Delivery</label>
                    <p className="mt-1 text-gray-900">
                      {project.package.delivery_days} days
                    </p>
                  </div>
                )}
              </div>
              
              {(project.start_date || project.deadline) && (
                <div className="grid grid-cols-2 gap-4">
                  {project.start_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Date</label>
                      <p className="mt-1 text-gray-900">
                        {format(new Date(project.start_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                  
                  {project.deadline && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Deadline</label>
                      <p className="mt-1 text-gray-900">
                        {format(new Date(project.deadline), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Project Communication</h2>
            </div>
            
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500">No messages yet</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender?.role === 'client' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender?.role === 'client'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender?.role === 'client'
                            ? 'text-emerald-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {format(new Date(message.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          {project.client && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {project.client.full_name}
                    </p>
                    {project.client.company_name && (
                      <p className="text-sm text-gray-600">{project.client.company_name}</p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {project.client.email}
                </div>
                {project.client.phone && (
                  <div className="text-sm text-gray-600">
                    {project.client.phone}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                {getStatusBadge(project.status)}
              </div>
              
              {project.package && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Package</span>
                  <span className="text-sm font-medium text-gray-900">
                    {project.package.name}
                  </span>
                </div>
              )}
              
              {project.quoted_price && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quote</span>
                  <span className="font-semibold text-emerald-600">
                    ${project.quoted_price.toLocaleString()}
                  </span>
                </div>
              )}
              
              {project.deadline && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Deadline</span>
                  <span className="text-sm text-gray-900">
                    {format(new Date(project.deadline), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              
              {project.package && project.package.delivery_days && !project.deadline && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Est. Delivery</span>
                  <span className="text-sm text-gray-900">
                    {project.package.delivery_days} days
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Related Invoices */}
          {(project.status === 'in_progress' || project.status === 'completed') && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoices</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-between">
                  <div className="flex items-center">
                    <Receipt className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Project Invoice</p>
                      <p className="text-xs text-gray-500">Generated automatically</p>
                    </div>
                  </div>
                  <span className="text-sm text-emerald-600 font-medium">
                    ${(project.quoted_price || 0) * 1.09}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}