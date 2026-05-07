'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

const NO_CLIENT_VALUE = '__none__'

const formSchema = z
  .object({
    client_id: z.string().optional(),
    title: z
      .string()
      .min(1, 'Title is required')
      .max(255, 'Title must be less than 255 characters'),
    attendee_email: z.string().email('Enter a valid email address'),
    attendee_name: z.string().max(255).optional(),
    starts_at: z.string().min(1, 'Start time is required'),
    ends_at: z.string().min(1, 'End time is required'),
    location: z.string().max(255).optional(),
    meeting_link: z
      .string()
      .url('Meeting link must be a valid URL')
      .optional()
      .or(z.literal('')),
    agenda: z.string().max(5000).optional(),
    description: z.string().max(2000).optional(),
    notify_attendee: z.boolean(),
  })
  .refine(
    (data) => new Date(data.starts_at) < new Date(data.ends_at),
    {
      message: 'End time must be after start time',
      path: ['ends_at'],
    }
  )

type FormValues = z.infer<typeof formSchema>

interface ClientOption {
  id: string
  name: string | null
  email: string | null
}

interface ClientsApiResponse {
  clients: ClientOption[]
}

const toIsoFromLocal = (localValue: string): string =>
  new Date(localValue).toISOString()

const defaultStart = (): string => {
  const date = new Date()
  date.setMinutes(0, 0, 0)
  date.setHours(date.getHours() + 1)
  return toLocalInputValue(date)
}

const defaultEnd = (): string => {
  const date = new Date()
  date.setMinutes(0, 0, 0)
  date.setHours(date.getHours() + 2)
  return toLocalInputValue(date)
}

const toLocalInputValue = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function NewAdminMeetingPage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: NO_CLIENT_VALUE,
      title: '',
      attendee_email: '',
      attendee_name: '',
      starts_at: defaultStart(),
      ends_at: defaultEnd(),
      location: '',
      meeting_link: '',
      agenda: '',
      description: '',
      notify_attendee: true,
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const selectedClientId = watch('client_id')
  const notifyAttendee = watch('notify_attendee')

  useEffect(() => {
    let cancelled = false
    const loadClients = async () => {
      try {
        const response = await fetch('/api/admin/clients?status=all&limit=100')
        if (!response.ok) throw new Error('Failed to load clients')
        const data: ClientsApiResponse = await response.json()
        if (!cancelled) setClients(data.clients ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setClientsLoading(false)
      }
    }
    loadClients()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId),
    [clients, selectedClientId]
  )

  useEffect(() => {
    if (selectedClient) {
      if (selectedClient.email) {
        setValue('attendee_email', selectedClient.email, { shouldValidate: true })
      }
      if (selectedClient.name) {
        setValue('attendee_name', selectedClient.name, { shouldValidate: true })
      }
    }
  }, [selectedClient, setValue])

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = {
        client_id:
          values.client_id && values.client_id !== NO_CLIENT_VALUE
            ? values.client_id
            : null,
        title: values.title,
        attendee_email: values.attendee_email,
        attendee_name: values.attendee_name || undefined,
        starts_at: toIsoFromLocal(values.starts_at),
        ends_at: toIsoFromLocal(values.ends_at),
        location: values.location || undefined,
        meeting_link: values.meeting_link || undefined,
        agenda: values.agenda || undefined,
        description: values.description || undefined,
        notify_attendee: values.notify_attendee,
      }

      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
          data?.error ??
            (data?.details
              ? 'Validation failed. Please check the form fields.'
              : 'Failed to schedule meeting')
        )
      }

      router.push('/admin/bookings')
      router.refresh()
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to schedule meeting'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Schedule a meeting</h1>
        <p className="text-muted-foreground mt-2">
          Send a calendar invite (.ics) to the attendee&apos;s email.
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Meeting details</CardTitle>
          <CardDescription>
            We&apos;ll save the meeting in your records and (optionally) email the
            attendee a calendar invite they can add to Google Calendar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Client select (optional) */}
            <div>
              <Label htmlFor="client_id">Client (optional)</Label>
              <Select
                value={selectedClientId ?? NO_CLIENT_VALUE}
                onValueChange={(value) => setValue('client_id', value)}
                disabled={clientsLoading || submitting}
              >
                <SelectTrigger id="client_id" className="mt-1">
                  <SelectValue placeholder="Select an existing client or leave blank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CLIENT_VALUE}>
                    No client / external attendee
                  </SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name || client.email || client.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Selecting a client pre-fills their email and name. Leave blank to
                schedule with a prospect who doesn&apos;t have an account.
              </p>
            </div>

            {/* Attendee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="attendee_email">Attendee email</Label>
                <Input
                  id="attendee_email"
                  type="email"
                  placeholder="attendee@example.com"
                  className="mt-1"
                  disabled={submitting}
                  aria-invalid={Boolean(errors.attendee_email) || undefined}
                  {...register('attendee_email')}
                />
                {errors.attendee_email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.attendee_email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="attendee_name">Attendee name</Label>
                <Input
                  id="attendee_name"
                  type="text"
                  placeholder="Optional"
                  className="mt-1"
                  disabled={submitting}
                  {...register('attendee_name')}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Meeting title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Project kickoff call"
                className="mt-1"
                disabled={submitting}
                aria-invalid={Boolean(errors.title) || undefined}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="starts_at">Starts at</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  className="mt-1"
                  disabled={submitting}
                  aria-invalid={Boolean(errors.starts_at) || undefined}
                  {...register('starts_at')}
                />
                {errors.starts_at && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.starts_at.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="ends_at">Ends at</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  className="mt-1"
                  disabled={submitting}
                  aria-invalid={Boolean(errors.ends_at) || undefined}
                  {...register('ends_at')}
                />
                {errors.ends_at && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.ends_at.message}
                  </p>
                )}
              </div>
            </div>

            {/* Location + meeting link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Office, phone, Zoom, etc."
                  className="mt-1"
                  disabled={submitting}
                  {...register('location')}
                />
              </div>
              <div>
                <Label htmlFor="meeting_link">Meeting link (optional)</Label>
                <Input
                  id="meeting_link"
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="mt-1"
                  disabled={submitting}
                  aria-invalid={Boolean(errors.meeting_link) || undefined}
                  {...register('meeting_link')}
                />
                {errors.meeting_link && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.meeting_link.message}
                  </p>
                )}
              </div>
            </div>

            {/* Agenda + description */}
            <div>
              <Label htmlFor="agenda">Agenda (optional)</Label>
              <Textarea
                id="agenda"
                rows={3}
                placeholder="What you plan to cover"
                className="mt-1"
                disabled={submitting}
                {...register('agenda')}
              />
            </div>
            <div>
              <Label htmlFor="description">Notes for the attendee (optional)</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Anything else the attendee should know"
                className="mt-1"
                disabled={submitting}
                {...register('description')}
              />
            </div>

            {/* Notify toggle */}
            <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-4">
              <input
                id="notify_attendee"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border accent-primary"
                checked={notifyAttendee}
                onChange={(event) =>
                  setValue('notify_attendee', event.target.checked)
                }
                disabled={submitting}
              />
              <div>
                <Label htmlFor="notify_attendee" className="cursor-pointer">
                  Email the attendee a calendar invite
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Sends an email with an .ics attachment so they can add the
                  meeting to Google Calendar, Apple Calendar, or Outlook.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Link href="/admin/bookings">
                <Button type="button" variant="outline" disabled={submitting}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule meeting'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
