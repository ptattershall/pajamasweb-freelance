'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Mail, Trash2 } from 'lucide-react'

type Status = 'new' | 'read' | 'replied' | 'archived'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  body: string
  status: Status
  admin_notes: string | null
  user_id: string | null
  source: string | null
  user_agent: string | null
  created_at: string
  read_at: string | null
  replied_at: string | null
}

const statusVariant = (
  status: Status
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'new':
      return 'default'
    case 'read':
      return 'secondary'
    case 'replied':
      return 'outline'
    case 'archived':
      return 'destructive'
  }
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

export default function AdminMessageDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [message, setMessage] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionPending, setActionPending] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [autoMarkedRead, setAutoMarkedRead] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/admin/contact-messages/${params.id}`
        )
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error ?? 'Failed to load message')
        }
        const data: ContactMessage = await response.json()
        if (!cancelled) {
          setMessage(data)
          setAdminNotes(data.admin_notes ?? '')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load message')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [params.id])

  const updateMessage = useCallback(
    async (
      updates: { status?: Status; admin_notes?: string | null },
      options: { silent?: boolean; messageId?: string } = {}
    ) => {
      const targetId = options.messageId ?? message?.id
      if (!targetId) return
      if (!options.silent) setActionPending(true)
      try {
        const response = await fetch(
          `/api/admin/contact-messages/${targetId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          }
        )
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error ?? 'Failed to update message')
        }
        const data: ContactMessage = await response.json()
        setMessage(data)
        if (updates.admin_notes !== undefined) {
          setAdminNotes(data.admin_notes ?? '')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update message')
      } finally {
        if (!options.silent) setActionPending(false)
      }
    },
    [message?.id]
  )

  // Auto-mark "new" messages as "read" when an admin opens them.
  useEffect(() => {
    if (!autoMarkedRead && message && message.status === 'new') {
      setAutoMarkedRead(true)
      void updateMessage(
        { status: 'read' },
        { silent: true, messageId: message.id }
      )
    }
  }, [message, autoMarkedRead, updateMessage])

  const handleDelete = async () => {
    if (!message) return
    const confirmed = window.confirm(
      'Delete this message permanently? This cannot be undone.'
    )
    if (!confirmed) return
    setActionPending(true)
    try {
      const response = await fetch(
        `/api/admin/contact-messages/${message.id}`,
        { method: 'DELETE' }
      )
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to delete message')
      }
      router.push('/admin/messages')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message')
      setActionPending(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!message) return
    setSavingNotes(true)
    try {
      await updateMessage({ admin_notes: adminNotes.trim() || null })
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !message) {
    return (
      <div className="space-y-6">
        <Link href="/admin/messages">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to inbox
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!message) {
    return null
  }

  const replyHref = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(
    `Re: ${message.subject ?? 'Your message'}`
  )}`

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/messages">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to inbox
          </Button>
        </Link>
        <Badge variant={statusVariant(message.status)}>{message.status}</Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {message.subject || '(No subject)'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            From <span className="font-medium text-foreground">{message.name}</span>{' '}
            &lt;
            <a
              href={`mailto:${message.email}`}
              className="text-primary hover:underline"
            >
              {message.email}
            </a>
            &gt;
            {message.user_id && (
              <Badge variant="secondary" className="ml-2">
                Signed in
              </Badge>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Received {formatDate(message.created_at)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
            {message.body}
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={replyHref}>
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Reply by email
              </Button>
            </a>
            <Button
              variant="outline"
              disabled={actionPending || message.status === 'replied'}
              onClick={() => updateMessage({ status: 'replied' })}
            >
              Mark as replied
            </Button>
            <Button
              variant="outline"
              disabled={actionPending || message.status === 'read'}
              onClick={() => updateMessage({ status: 'read' })}
            >
              Mark as read
            </Button>
            <Button
              variant="outline"
              disabled={actionPending || message.status === 'archived'}
              onClick={() => updateMessage({ status: 'archived' })}
            >
              Archive
            </Button>
            <Button
              variant="destructive"
              disabled={actionPending}
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Internal notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="admin-notes" className="sr-only">
            Internal notes
          </Label>
          <Textarea
            id="admin-notes"
            rows={4}
            placeholder="Private notes about this message (not sent to the customer)."
            value={adminNotes}
            onChange={(event) => setAdminNotes(event.target.value)}
            disabled={savingNotes}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveNotes}
            disabled={savingNotes || adminNotes === (message.admin_notes ?? '')}
          >
            {savingNotes ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save notes'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
