/**
 * Sign Up Page - Redirects to Sales Funnel
 *
 * New clients should go through the sales funnel to book a consultation.
 * Existing clients with invitations can use the invitation link directly.
 */

import { redirect } from 'next/navigation'

export default function SignUpPage() {
  // Redirect to sales funnel
  redirect('/sales')
}

