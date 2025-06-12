import { useState } from 'react'
import { ContactFormData } from '@/types/services'
import toast from 'react-hot-toast'

const initialFormState: ContactFormData = {
  name: '',
  email: '',
  company: '',
  phone: '',
  service: '',
  message: ''
}

export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormState)
  const [submitting, setSubmitting] = useState(false)

  const updateField = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success(data.message)
        setFormData(initialFormState)
      } else {
        toast.error(data.error || 'Failed to submit form')
      }
    } catch (error) {
      toast.error('Failed to submit form')
      console.log('Failed to submit form: ', error)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    formData,
    updateField,
    handleSubmit,
    submitting,
    resetForm: () => setFormData(initialFormState)
  }
}