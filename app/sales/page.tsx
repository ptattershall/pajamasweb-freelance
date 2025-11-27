'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'

const SERVICES = [
  { id: 'web-development', label: 'Web Development', icon: '🚀' },
  { id: 'ui-ux-design', label: 'UI/UX Design', icon: '🎨' },
  { id: 'consulting', label: 'Consulting', icon: '💡' },
  { id: 'maintenance', label: 'Maintenance & Support', icon: '🔧' },
]

const TIMELINES = [
  'ASAP',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  'Flexible',
]

const BUDGETS = [
  'Under $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000 - $50,000',
  '$50,000+',
  'Not sure yet',
]

type FormData = {
  services: string[]
  project_description: string
  timeline: string
  budget_range: string
  additional_notes: string
  full_name: string
  email: string
  company: string
  phone: string
}

export default function SalesFunnelPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [inquiryId, setInquiryId] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    services: [],
    project_description: '',
    timeline: '',
    budget_range: '',
    additional_notes: '',
    full_name: '',
    email: '',
    company: '',
    phone: '',
  })

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }))
  }

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (formData.services.length === 0) {
      setError('Please select at least one service')
      return false
    }
    if (!formData.project_description.trim()) {
      setError('Please provide a project description')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.full_name.trim()) {
      setError('Please provide your full name')
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')

    if (step === 1) {
      if (!validateStep1()) return
      setStep(2)
    } else if (step === 2) {
      if (!validateStep2()) return
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/sales-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit inquiry')
      }

      setInquiryId(data.id)
      setSuccess(true)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Let&apos;s Build Something Amazing
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Tell us about your project and schedule a consultation
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'} font-semibold text-sm`}>
              1
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-black dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'} font-semibold text-sm`}>
              2
            </div>
            <div className={`w-12 h-1 ${step >= 3 ? 'bg-black dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'} font-semibold text-sm`}>
              3
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Project Details'}
              {step === 2 && 'Contact Information'}
              {step === 3 && 'Book Your Consultation'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Tell us about your project needs'}
              {step === 2 && 'How can we reach you?'}
              {step === 3 && 'Schedule a time to discuss your project'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-600 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Project Details */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Services Selection */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    What services are you interested in? *
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICES.map(service => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => toggleService(service.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.services.includes(service.id)
                            ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{service.icon}</span>
                          <span className="font-semibold">{service.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Description */}
                <div>
                  <Label htmlFor="project_description" className="text-base font-semibold">
                    Describe your project *
                  </Label>
                  <Textarea
                    id="project_description"
                    placeholder="Tell us about your project goals, challenges, and what you're hoping to achieve..."
                    value={formData.project_description}
                    onChange={(e) => updateField('project_description', e.target.value)}
                    className="mt-2 min-h-32"
                    required
                  />
                </div>

                {/* Timeline */}
                <div>
                  <Label htmlFor="timeline" className="text-base font-semibold">
                    Project Timeline
                  </Label>
                  <Select value={formData.timeline} onValueChange={(value) => updateField('timeline', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMELINES.map(timeline => (
                        <SelectItem key={timeline} value={timeline}>
                          {timeline}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget */}
                <div>
                  <Label htmlFor="budget_range" className="text-base font-semibold">
                    Estimated Budget
                  </Label>
                  <Select value={formData.budget_range} onValueChange={(value) => updateField('budget_range', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGETS.map(budget => (
                        <SelectItem key={budget} value={budget}>
                          {budget}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="additional_notes" className="text-base font-semibold">
                    Additional Information
                  </Label>
                  <Textarea
                    id="additional_notes"
                    placeholder="Any other details you'd like to share..."
                    value={formData.additional_notes}
                    onChange={(e) => updateField('additional_notes', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="full_name" className="text-base font-semibold">
                    Full Name *
                  </Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="company" className="text-base font-semibold">
                    Company
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Your Company Name"
                    value={formData.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-base font-semibold">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Booking */}
            {step === 3 && success && (
              <div className="space-y-6">
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Thank you! Your inquiry has been submitted successfully.
                  </AlertDescription>
                </Alert>

                <div className="text-center py-4">
                  <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6">
                    Now let&apos;s schedule a time to discuss your project in detail.
                  </p>

                  {/* Cal.com embed will be loaded here */}
                  <div id="sales-booking-embed" className="w-full" style={{ minHeight: '500px' }}>
                    {/* Cal.com booking widget */}
                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-8 border border-zinc-200 dark:border-zinc-800">
                      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                        Loading calendar...
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        If the calendar doesn&apos;t load, you can also{' '}
                        <a
                          href="mailto:info@pajamasweb.com"
                          className="text-black dark:text-white underline hover:no-underline"
                        >
                          email us directly
                        </a>
                        {' '}or{' '}
                        <a
                          href="/book"
                          className="text-black dark:text-white underline hover:no-underline"
                        >
                          visit our booking page
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      onClick={() => router.push('/')}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Return to Home
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 3 && (
              <div className="flex justify-between mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className={step === 1 ? 'ml-auto' : ''}
                >
                  {loading ? 'Processing...' : step === 2 ? 'Submit & Continue' : 'Next'}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
