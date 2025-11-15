import { getServices, Service } from '@/lib/supabase'
import Link from 'next/link'
import { Metadata } from 'next'
import { JsonLdScript } from '@/components/JsonLdScript'
import { generateBreadcrumbSchema } from '@/lib/json-ld-schemas'

export const metadata: Metadata = {
  title: 'Services | PajamasWeb',
  description: 'Explore our web development and design services',
  openGraph: {
    title: 'Services | PajamasWeb',
    description: 'Explore our web development and design services',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/services`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/og/service?title=Our Services&description=Web development and design services`,
        width: 1200,
        height: 630,
        alt: 'PajamasWeb Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Services | PajamasWeb',
    description: 'Explore our web development and design services',
    images: [`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/og/service?title=Our Services&description=Web development and design services`],
  },
}

export default async function ServicesPage() {
  let services: Service[] = []
  try {
    services = await getServices(true)
  } catch (error) {
    console.warn('Failed to fetch services:', error)
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}` },
    { name: 'Services', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/services` },
  ])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <JsonLdScript schema={breadcrumbSchema} />
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
            Our Services
          </h1>
          <p className="text-lg text-slate-600">
            Choose the perfect package for your project needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group rounded-lg border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-slate-300"
            >
              <div className="mb-4">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  {service.tier || 'Standard'}
                </span>
              </div>

              <h2 className="mb-2 text-2xl font-bold text-slate-900 group-hover:text-blue-600">
                {service.title}
              </h2>

              {service.price_from_cents && (
                <p className="mb-4 text-3xl font-bold text-slate-900">
                  ${(service.price_from_cents / 100).toFixed(0)}
                  <span className="text-lg text-slate-600">/mo</span>
                </p>
              )}

              <p className="mb-6 text-slate-600">
                {service.summary}
              </p>

              <div className="inline-block rounded bg-blue-600 px-4 py-2 text-white font-semibold transition-colors group-hover:bg-blue-700">
                View Details →
              </div>
            </Link>
          ))}
        </div>

        {services.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-slate-600">No services available at this time.</p>
          </div>
        )}
      </div>
    </main>
  )
}

