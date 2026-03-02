import { getServices, Service } from '@/lib/supabase'
import { Metadata } from 'next'
import { JsonLdScript } from '@/components/JsonLdScript'
import { generateBreadcrumbSchema } from '@/lib/json-ld-schemas'
import { ServiceFilterGrid } from '@/components/ServiceFilterGrid'

export const metadata: Metadata = {
  title: 'Services | PajamasWeb',
  description: 'Explore our web development and design services',
  openGraph: {
    title: 'Services | PajamasWeb',
    description: 'Explore our web development and design services',
    type: 'website',
    url: 'https://www.pajamasweb.com/services',
    images: [
      {
        url: 'https://www.pajamasweb.com/thumbnail.png',
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
    images: ['https://www.pajamasweb.com/thumbnail.png'],
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
    { name: 'Home', url: 'https://www.pajamasweb.com' },
    { name: 'Services', url: 'https://www.pajamasweb.com/services' },
  ])

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <JsonLdScript schema={breadcrumbSchema} />
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
            Our Services
          </h1>
          <p className="text-lg text-slate-600">
            Choose the perfect package for your project needs
          </p>
        </div>

        {/* Service Filter and Grid */}
        <ServiceFilterGrid services={services} />
      </div>
    </main>
  )
}

