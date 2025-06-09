/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { 
  ArrowLeft, 
  Send,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProject()
      fetchMessages()
    }
  }, [params.id])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setProject(data.data)
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
        fetchMessages() // Refresh messages
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

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      inquiry: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inquiry' },
      quoted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Quoted' },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Progress' },
      review: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'In Review' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    }

    const config = statusConfig[status] || statusConfig.inquiry

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.bg} ${config.text}`}>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                
                {project.quoted_price && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quoted Price</label>
                    <p className="mt-1 text-gray-900">${project.quoted_price.toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              {project.start_date && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                    <p className="mt-1 text-gray-900">
                      {format(new Date(project.start_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  
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
            
            {/* Messages List */}
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
            
            {/* Message Input */}
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
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
                Update Status
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
                Create Invoice
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
                Add Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}