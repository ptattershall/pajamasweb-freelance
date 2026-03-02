/**
 * Auth Callback Page
 *
 * Handles redirect after email confirmation. Two flows:
 * 1) Query params token_hash + type: redirect to GET /api/auth/callback (server-side verifyOtp).
 * 2) Hash fragment access_token/refresh_token or existing session: confirm via POST /api/auth/confirm-email then redirect.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientSupabaseClient } from '@/lib/auth-service';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Confirming your email…');

  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const nextParam = searchParams.get('next') ?? '/portal';

    if (token_hash && type) {
      const apiUrl = new URL('/api/auth/callback', window.location.origin);
      apiUrl.searchParams.set('token_hash', token_hash);
      apiUrl.searchParams.set('type', type);
      apiUrl.searchParams.set('next', nextParam);
      window.location.replace(apiUrl.toString());
      return;
    }

    const handleCallback = async () => {
      const supabase = createClientSupabaseClient();

      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');

      if (access_token && refresh_token) {
        const { error: setError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (setError) {
          setStatus('error');
          setMessage(setError.message || 'Failed to restore session.');
          return;
        }
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setStatus('error');
        setMessage(sessionError.message || 'Failed to restore session.');
        return;
      }

      if (!session) {
        setStatus('error');
        setMessage('No session found. You may have already verified your email. Try signing in.');
        return;
      }

      try {
        const res = await fetch('/api/auth/confirm-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Failed to confirm email.');
          return;
        }

        setStatus('success');
        setMessage('Email verified! Redirecting…');
        router.replace('/portal');
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Try signing in.');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      {status === 'loading' && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
          <p className="text-muted-foreground">{message}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <p className="text-foreground">{message}</p>
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        </>
      )}
      {status === 'error' && (
        <>
          <p className="text-destructive">{message}</p>
          <a
            href="/auth/signin"
            className="text-primary underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Go to sign in
          </a>
        </>
      )}
    </div>
  );
}
