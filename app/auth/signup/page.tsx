/**
 * Sign Up Page - Redirects to Invitation Flow
 *
 * The client portal now uses an invitation-based system.
 * Clients must be invited by an admin to create an account.
 */

import { redirect } from 'next/navigation'

export default function SignUpPage() {
  // Redirect to signin page with a message
  redirect('/auth/signin?message=Please contact your administrator for an invitation to join the client portal')
}

