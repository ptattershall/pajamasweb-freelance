import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="h-8 w-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-amber-900">
            Payment Cancelled
          </h1>

          <p className="mb-6 text-amber-700">
            Your payment has been cancelled. No charges have been made to your account.
          </p>

          <p className="mb-6 text-sm text-slate-600">
            If you have any questions or need assistance, please don't hesitate to contact us.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/services"
              className="flex-1 rounded-lg bg-amber-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-amber-700"
            >
              Back to Services
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-lg border border-amber-600 px-6 py-2 font-semibold text-amber-600 transition-colors hover:bg-amber-50"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

