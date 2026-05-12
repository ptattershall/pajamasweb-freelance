import type { ProfileRole } from '@/lib/validation-schemas'

const adminPrefix = '/admin'
const portalPrefix = '/portal'
const clientPrefix = '/client'

export const defaultRouteForRole = (role: ProfileRole | null): string => {
  switch (role) {
    case 'OWNER':
      return '/admin'
    case 'SALES':
    case 'DEV':
      return '/portal'
    case 'CLIENT':
      return '/client'
    default:
      // Must not return a role-guarded path: null role + `/client` caused an
      // infinite redirect in proxy.ts (CLIENT gate sends null role back to default).
      return '/auth/redirect'
  }
}

export const isSafeRedirect = (target: string | null): target is string => {
  if (!target) return false
  return target.startsWith('/') && !target.startsWith('//')
}

export const buildProtectedRedirectTarget = (
  pathname: string,
  search: string = ''
): string => {
  if (!pathname.startsWith('/')) {
    return '/'
  }

  if (!search || search === '?') {
    return pathname
  }

  return `${pathname}${search.startsWith('?') ? search : `?${search}`}`
}

export const canRoleAccessPath = (
  role: ProfileRole | null,
  pathname: string
): boolean => {
  if (pathname.startsWith(adminPrefix)) {
    return role === 'OWNER'
  }

  if (pathname.startsWith(portalPrefix)) {
    return role === 'OWNER' || role === 'SALES' || role === 'DEV'
  }

  if (pathname.startsWith(clientPrefix)) {
    return role === 'CLIENT'
  }

  return true
}

export const routeAfterSignIn = (
  role: ProfileRole | null,
  redirectTarget: string | null
): string => {
  if (
    isSafeRedirect(redirectTarget) &&
    !redirectTarget.startsWith('/auth/redirect') &&
    canRoleAccessPath(role, redirectTarget)
  ) {
    return redirectTarget
  }

  return defaultRouteForRole(role)
}
