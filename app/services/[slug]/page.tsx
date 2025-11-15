import { getServiceBySlug, getServices } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ServiceCheckoutButtons from '@/components/ServiceCheckoutButtons'
import { MultipleJsonLdScripts } from '@/components/JsonLdScript'
import { generateServiceSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/json-ld-schemas'

export async function generateStaticParams() {
  try {
    const services = await getServices(true)
    return services.map((service) => ({
      slug: service.slug,
    }))
  } catch (error) {
    console.warn('Failed to generate static params for services:', error)
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug)

  if (!service) {
    return {
      title: 'Service Not Found',
    }
  }

  const ogImageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/og/service?title=${encodeURIComponent(service.title)}&description=${encodeURIComponent(service.summary || 'Service details')}`

  return {
    title: `${service.title} | PajamasWeb`,
    description: service.summary || 'Service details',
    openGraph: {
      title: service.title,
      description: service.summary || 'Service details',
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/services/${params.slug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: service.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: service.title,
      description: service.summary || 'Service details',
      images: [ogImageUrl],
    },
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const service = await getServiceBySlug(params.slug)

  if (!service) {
    notFound()
  }

  // Generate JSON-LD schemas
  const serviceSchema = generateServiceSchema({
    title: service.title,
    summary: service.summary,
    slug: service.slug,
    price_from_cents: service.price_from_cents,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}` },
    { name: 'Services', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/services` },
    { name: service.title, url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/services/${params.slug}` },
  ])

  // Example FAQ schema - customize based on your service FAQs
  const faqSchema = generateFAQSchema([
    {
      question: `What is included in ${service.title}?`,
      answer: service.summary || 'This service includes professional web development and design services tailored to your needs.',
    },
    {
      question: 'How long does the project take?',
      answer: 'Project timeline depends on scope and complexity. Contact us for a detailed estimate.',
    },
  ])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <MultipleJsonLdScripts schemas={[serviceSchema, breadcrumbSchema, faqSchema]} />
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12 max-w-3xl">
          <div className="mb-4">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {service.tier || 'Standard'}
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
            {service.title}
          </h1>

          <p className="mb-8 text-xl text-slate-600">
            {service.summary}
          </p>

          {service.price_from_cents && (
            <div className="mb-8 rounded-lg bg-blue-50 p-6">
              <p className="text-sm text-slate-600">Starting at</p>
              <p className="text-4xl font-bold text-slate-900">
                ${(service.price_from_cents / 100).toFixed(0)}
                <span className="text-lg text-slate-600">/month</span>
              </p>
            </div>
          )}
        </div>

        {/* Details */}
        {service.details_md && (
          <div className="mb-12 max-w-3xl rounded-lg border border-slate-200 bg-white p-8">
            <div className="prose prose-sm max-w-none">
              {/* Simple markdown rendering - in production, use MDXRemote or similar */}
              <div
                dangerouslySetInnerHTML={{
                  __html: service.details_md
                    .split('\n')
                    .map((line: string) => {
                      if (line.startsWith('# ')) {
                        return `<h2 class="text-2xl font-bold mt-6 mb-4">${line.slice(2)}</h2>`
                      }
                      if (line.startsWith('- ')) {
                        return `<li class="ml-4">${line.slice(2)}</li>`
                      }
                      if (line.trim()) {
                        return `<p class="mb-4">${line}</p>`
                      }
                      return ''
                    })
                    .join(''),
                }}
              />
            </div>
          </div>
        )}

        {/* Checkout Buttons */}
        <div className="max-w-3xl">
          <ServiceCheckoutButtons service={service} />
        </div>
      </div>
    </main>
  )
}

