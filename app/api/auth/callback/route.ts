/**
 * Auth Callback API Route (server-side)
 *
 * Handles redirect from Supabase after email confirmation. Supabase can send
 * token_hash and type as query params (PKCE-style). We verify the OTP,
 * mark the profile as email_verified, then redirect. Session is not persisted
 * here (no cookie-based client); user can sign in after redirect.
 *
 * Security: Only GET with token_hash + type; verifyOtp validates the token
 * server-side. Redirect URLs are validated (same origin or allowlist).
 */

import type { EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyEmail } from '@/lib/auth-service';

const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

function isAllowedRedirect(next: string): boolean {
  if (!next || !APP_URL) return false;
  try {
    const base = new URL(APP_URL);
    const target = new URL(next, base.origin);
    return target.origin === base.origin && target.pathname.startsWith('/');
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const nextParam = searchParams.get('next') ?? '/portal';

  if (!SUPABASE_URL || !ANON_KEY) {
    console.error('Auth callback: missing Supabase env');
    return NextResponse.redirect(new URL('/auth/signin?error=config', request.url));
  }

  const redirectToError = (reason: string) => {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('error', reason);
    url.searchParams.set('message', 'Email confirmation failed. Try signing in or resend verification.');
    return NextResponse.redirect(url);
  };

  if (!token_hash || !type) {
    return redirectToError('missing_params');
  }

  const allowedTypes: EmailOtpType[] = ['email', 'signup', 'email_change'];
  if (!allowedTypes.includes(type)) {
    return redirectToError('invalid_type');
  }

  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type,
  });

  if (error) {
    console.error('Auth callback verifyOtp error:', error.message);
    return redirectToError('invalid_or_expired');
  }

  const user = data?.user;
  if (!user?.id) {
    return redirectToError('no_user');
  }

  try {
    await verifyEmail(user.id);
  } catch (err) {
    console.error('Auth callback verifyEmail error:', err);
    return redirectToError('verify_failed');
  }

  const nextPath = isAllowedRedirect(nextParam) ? nextParam : '/portal';
  const redirectUrl = new URL(nextPath, request.url);
  redirectUrl.searchParams.set('message', 'Email verified. You can sign in now.');
  return NextResponse.redirect(redirectUrl);
}
