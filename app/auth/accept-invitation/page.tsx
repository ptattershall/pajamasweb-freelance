/**
 * Accept Invitation Page
 *
 * Allows clients to accept an invitation and create their account
 */

import { Suspense } from 'react'
import AcceptInvitationForm from './accept-invitation-form'

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md border rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AcceptInvitationForm />
    </Suspense>
  )
}


