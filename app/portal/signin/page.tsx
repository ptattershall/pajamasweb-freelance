/**
 * Redirect to new auth signin page
 */

import { redirect } from 'next/navigation'

export default function SignInPage() {
  redirect('/auth/signin')
}
