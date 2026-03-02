/**
 * Confirm Email API Route
 *
 * Called after user lands on /auth/callback with a valid session (e.g. from
 * hash fragment). Validates JWT server-side, marks profile email_verified.
 *
 * Security: Rate-limited by IP; generic error messages; no user data in response.
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/auth-service';
import { checkIpRateLimit, getClientIp, getRateLimitHeaders, rateLimiters } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success, remaining, resetTime } = await checkIpRateLimit(ip, rateLimiters.auth);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      {
        status: 429,
        headers: getRateLimitHeaders(remaining, resetTime),
      }
    );
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid authorization' }, { status: 401 });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return NextResponse.json({ error: 'Missing or invalid authorization' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  try {
    await verifyEmail(user.id);
    return NextResponse.json(
      { success: true },
      { headers: getRateLimitHeaders(remaining, resetTime) }
    );
  } catch (err) {
    console.error('Confirm email error:', err);
    return NextResponse.json(
      { error: 'Failed to confirm email. Try again or sign in.' },
      { status: 500 }
    );
  }
}
