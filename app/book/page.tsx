'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';

export default function BookingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/token');
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Initialize Cal.com embed only if authenticated
    if (!isAuthenticated) return;

    (window as any).Cal?.("init", {
      origin: "https://cal.com"
    });

    // Set up event listeners
    (window as any).Cal?.("on", {
      action: "bookingSuccessful",
      callback: (e: any) => {
        console.log('Booking successful:', e.detail);
        // Show success message
        const successDiv = document.getElementById('booking-success');
        if (successDiv) {
          successDiv.style.display = 'block';
          setTimeout(() => {
            successDiv.style.display = 'none';
          }, 5000);
        }
      }
    });

    (window as any).Cal?.("on", {
      action: "bookingFailed",
      callback: (e: any) => {
        console.error('Booking failed:', e.detail);
        // Show error message
        const errorDiv = document.getElementById('booking-error');
        if (errorDiv) {
          errorDiv.style.display = 'block';
          setTimeout(() => {
            errorDiv.style.display = 'none';
          }, 5000);
        }
      }
    });
  }, [isAuthenticated]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Book a Meeting
            </h1>
            <p className="text-xl text-slate-300">
              Schedule a call with our team to discuss your project
            </p>
          </div>

          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Account Required
            </h2>
            <p className="text-slate-200 mb-6">
              You need to have an account to book a meeting. Please sign in or create an account to continue.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-100"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Book a Meeting
          </h1>
          <p className="text-xl text-slate-300">
            Schedule a call with our team to discuss your project
          </p>
        </div>

        {/* Success Message */}
        <div
          id="booking-success"
          className="hidden mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200"
        >
          ✓ Booking confirmed! Check your email for details.
        </div>

        {/* Error Message */}
        <div
          id="booking-error"
          className="hidden mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200"
        >
          ✗ Booking failed. Please try again.
        </div>

        {/* Cal.com Embed Container */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div
            data-testid="cal-embed"
            style={{
              width: '100%',
              height: '600px',
              overflow: 'auto'
            }}
          >
            {/* Cal.com embed will be rendered here */}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-700/50 p-6 rounded-lg">
            <div className="text-2xl mb-2">📅</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Flexible Scheduling
            </h3>
            <p className="text-slate-300">
              Choose a time that works best for you
            </p>
          </div>

          <div className="bg-slate-700/50 p-6 rounded-lg">
            <div className="text-2xl mb-2">📧</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Instant Confirmation
            </h3>
            <p className="text-slate-300">
              Get confirmation and reminders via email
            </p>
          </div>

          <div className="bg-slate-700/50 p-6 rounded-lg">
            <div className="text-2xl mb-2">🔔</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Smart Reminders
            </h3>
            <p className="text-slate-300">
              Never miss your scheduled meeting
            </p>
          </div>
        </div>
      </div>

      {/* Cal.com Script */}
      <Script
        src="https://cdn.cal.com/cal.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Initialize Cal.com embed after script loads
          (window as any).Cal?.("inline", {
            elementOrSelector: "[data-testid='cal-embed']",
            calLink: process.env.NEXT_PUBLIC_CALCOM_LINK || "your-username/intro-call",
            config: {
              theme: "light",
              layout: "month_view"
            }
          });
        }}
      />
    </div>
  );
}

