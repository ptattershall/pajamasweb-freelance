import { Metadata } from 'next'

import { ContactForm } from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact | PajamasWeb',
  description:
    'Send a message and we will get back to you by email. Share your project details, timeline, or questions.',
}

export default function ContactPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-gradient-to-br from-slate-50 to-white px-4 py-16 dark:from-zinc-950 dark:to-black sm:px-6"
    >
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Get in touch
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Send a message and we&apos;ll reply by email — usually within a
            business day.
          </p>
        </header>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <ContactForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Prefer email? Write to{' '}
          <a
            href="mailto:info@pajamasweb.com"
            className="text-primary hover:underline"
          >
            info@pajamasweb.com
          </a>
          .
        </p>
      </div>
    </main>
  )
}
