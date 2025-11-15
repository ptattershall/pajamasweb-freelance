'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Copy, Check } from 'lucide-react'

export default function InviteClientPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [expiresInDays, setExpiresInDays] = useState('7')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/invitations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          expiresInDays: parseInt(expiresInDays),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create invitation')
      }

      const data = await response.json()
      setInvitationUrl(data.invitation.invitationUrl)
      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard() {
    if (invitationUrl) {
      navigator.clipboard.writeText(invitationUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (success && invitationUrl) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invitation Sent</h1>
          <p className="text-muted-foreground mt-2">Share this link with your client</p>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Success!</CardTitle>
            <CardDescription className="text-green-800">
              Invitation created and email sent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Invitation Link</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={invitationUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this link with your client. It will expire in {expiresInDays} days.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Next Steps:</h3>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Share the link with your client</li>
                <li>Client clicks the link and sets their password</li>
                <li>Client can then sign in to the portal</li>
              </ol>
            </div>

            <div className="flex gap-2 pt-4">
              <Link href="/admin/clients">
                <Button variant="outline">Back to Clients</Button>
              </Link>
              <Button onClick={() => {
                setSuccess(false)
                setInvitationUrl(null)
              }}>
                Send Another Invitation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Invite New Client</h1>
        <p className="text-muted-foreground mt-2">Create an invitation for a new client</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Create Invitation</CardTitle>
          <CardDescription>
            Send an invitation link to your client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="email">Client Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="expires">Invitation Expires In</Label>
              <Select value={expiresInDays} onValueChange={setExpiresInDays} disabled={loading}>
                <SelectTrigger id="expires" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                The invitation link will expire after this period
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invitation'
              )}
            </Button>

            <Link href="/admin/clients">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

