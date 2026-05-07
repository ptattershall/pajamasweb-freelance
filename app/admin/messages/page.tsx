'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Mail, Inbox } from 'lucide-react'

type Status = 'new' | 'read' | 'replied' | 'archived'
type Tab = Status | 'all'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  body: string
  status: Status
  user_id: string | null
  created_at: string
  updated_at: string
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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

const truncate = (text: string, max = 100): string =>
  text.length > max ? `${text.slice(0, max)}…` : text

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [tab, setTab] = useState<Tab>('new')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/admin/contact-messages?status=${tab}`
        )
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error ?? 'Failed to fetch messages')
        }
        const data: ContactMessage[] = await response.json()
        if (!cancelled) setMessages(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load messages')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [tab])

  const headingLabel = useMemo(() => {
    switch (tab) {
      case 'new':
        return 'New messages'
      case 'read':
        return 'Read messages'
      case 'replied':
        return 'Replied messages'
      case 'archived':
        return 'Archived messages'
      default:
        return 'All messages'
    }
  }, [tab])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Inbox</h1>
        <p className="text-muted-foreground mt-2">
          Customer messages submitted through the contact form.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <TabsList>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
          <TabsTrigger value="replied">Replied</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{headingLabel}</CardTitle>
          <CardDescription>
            Showing {messages.length} message{messages.length === 1 ? '' : 's'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Inbox size={48} className="mx-auto mb-4 opacity-50" aria-hidden="true" />
              <p>No {tab === 'all' ? '' : tab} messages.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div className="font-medium">{message.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {message.email}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      {message.subject && (
                        <div className="text-sm font-medium">
                          {truncate(message.subject, 60)}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {truncate(message.body)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(message.status)}>
                        {message.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(message.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/messages/${message.id}`}>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
