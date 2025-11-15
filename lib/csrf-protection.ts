/**
 * CSRF Protection Utility
 * Provides CSRF token generation and validation
 * Edge Runtime compatible
 */

import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Generate a new CSRF token (Edge Runtime compatible)
 */
export function generateCsrfToken(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash CSRF token for storage (Edge Runtime compatible)
 */
export async function hashCsrfToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify CSRF token
 */
export async function verifyCsrfToken(token: string, storedHash: string): Promise<boolean> {
  const tokenHash = await hashCsrfToken(token);
  return tokenHash === storedHash;
}

/**
 * Get CSRF token from request
 */
export function getCsrfTokenFromRequest(request: NextRequest): string | null {
  // Check header first (preferred for API requests)
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }

  // Check form data for POST requests
  if (request.method === 'POST') {
    // Note: This would need to be parsed from FormData in actual implementation
    // For now, we rely on header-based CSRF tokens
  }

  return null;
}

/**
 * Get CSRF token from cookies
 */
export function getCsrfTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null;
}

/**
 * Check if request needs CSRF protection
 */
export function needsCsrfProtection(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
}

/**
 * Validate CSRF token on request
 */
export async function validateCsrfToken(request: NextRequest): Promise<{ valid: boolean; error?: string }> {
  // Skip CSRF check for GET requests
  if (!needsCsrfProtection(request.method)) {
    return { valid: true };
  }

  // Get token from request
  const requestToken = getCsrfTokenFromRequest(request);
  if (!requestToken) {
    return { valid: false, error: 'CSRF token missing from request' };
  }

  // Get stored token hash from cookies
  const storedHash = getCsrfTokenFromCookies(request);
  if (!storedHash) {
    return { valid: false, error: 'CSRF token missing from cookies' };
  }

  // Verify token
  const isValid = await verifyCsrfToken(requestToken, storedHash);
  if (!isValid) {
    return { valid: false, error: 'CSRF token invalid' };
  }

  return { valid: true };
}

