'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import {
  createContactMessageSchema,
  type CreateContactMessageInput,
} from '@/lib/validation-schemas'

interface ContactFormProps {
  defaultName?: string
  defaultEmail?: string
  className?: string
}

export function ContactForm({
  defaultName,
  defaultEmail,
  className,
}: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateContactMessageInput>({
    resolver: zodResolver(createContactMessageSchema),
    defaultValues: {
      name: defaultName ?? '',
      email: defaultEmail ?? '',
      subject: '',
      body: '',
    },
  })

  const onSubmit = async (values: CreateContactMessageInput) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Failed to send message')
      }

      setSubmitted(true)
      reset({
        name: defaultName ?? '',
        email: defaultEmail ?? '',
        subject: '',
        body: '',
      })
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to send message'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className={className}>
        <Alert>
          <AlertDescription>
            <p className="font-medium text-foreground">Thanks — message received.</p>
            <p className="text-sm text-muted-foreground mt-1">
              We&apos;ll get back to you by email shortly.
            </p>
            <Button
              variant="link"
              type="button"
              className="px-0 mt-2"
              onClick={() => setSubmitted(false)}
            >
              Send another message
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className} noValidate>
      <div className="space-y-4">
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact-name">Your name</Label>
            <Input
              id="contact-name"
              type="text"
              autoComplete="name"
              className="mt-1"
              disabled={submitting}
              aria-invalid={Boolean(errors.name) || undefined}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              className="mt-1"
              disabled={submitting}
              aria-invalid={Boolean(errors.email) || undefined}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="contact-subject">Subject (optional)</Label>
          <Input
            id="contact-subject"
            type="text"
            placeholder="What's this about?"
            className="mt-1"
            disabled={submitting}
            {...register('subject')}
          />
          {errors.subject && (
            <p className="text-xs text-red-500 mt-1">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="contact-body">Message</Label>
          <Textarea
            id="contact-body"
            rows={6}
            placeholder="Tell us a little about your project, timeline, or question."
            className="mt-1"
            disabled={submitting}
            aria-invalid={Boolean(errors.body) || undefined}
            {...register('body')}
          />
          {errors.body && (
            <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>
          )}
        </div>

        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send message'
          )}
        </Button>
      </div>
    </form>
  )
}
