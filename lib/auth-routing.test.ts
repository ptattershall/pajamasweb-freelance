import { describe, expect, it } from 'vitest'
import {
  buildProtectedRedirectTarget,
  routeAfterSignIn,
} from './auth-routing'

describe('auth-routing', () => {
  describe('buildProtectedRedirectTarget', () => {
    it('preserves the original query string for protected routes', () => {
      expect(
        buildProtectedRedirectTarget('/client/bookings', '?tab=upcoming&page=2')
      ).toBe('/client/bookings?tab=upcoming&page=2')
    })

    it('falls back to the pathname when there is no search string', () => {
      expect(buildProtectedRedirectTarget('/portal/messages')).toBe(
        '/portal/messages'
      )
    })
  })

  describe('routeAfterSignIn', () => {
    it('returns the original redirect when the role is allowed there', () => {
      expect(
        routeAfterSignIn('CLIENT', '/client/invoices?page=2')
      ).toBe('/client/invoices?page=2')
    })

    it('falls back to the role default when the redirect is not allowed', () => {
      expect(routeAfterSignIn('CLIENT', '/admin')).toBe('/client')
      expect(routeAfterSignIn('OWNER', '/client/projects')).toBe('/admin')
    })

    it('falls back to the redirect resolver when no role can be determined', () => {
      expect(routeAfterSignIn(null, '/client')).toBe('/auth/redirect')
    })
  })
})
