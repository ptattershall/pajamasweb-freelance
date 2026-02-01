import Link from 'next/link'
import { getAllCaseStudies } from '@/lib/content'
import { JsonLdScript } from '@/components/JsonLdScript'
import { generateBreadcrumbSchema } from '@/lib/json-ld-schemas'
import { ContentNavigation } from '@/components/ContentNavigation'
import { FloatingChatButton } from '@/components/FloatingChatButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Studies | PJais.ai',
  description: 'Explore our portfolio of successful projects and client transformations.',
  openGraph: {
    title: 'Case Studies | PJais.ai',
    description: 'Explore our portfolio of successful projects and client transformations.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/case-studies`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/thumbnail.png`,
        width: 1200,
        height: 630,
        alt: 'PJais.ai Case Studies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Case Studies | PJais.ai',
    description: 'Explore our portfolio of successful projects and client transformations.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/thumbnail.png`],
  },
}

export default function CaseStudiesPage() {
  const caseStudies = getAllCaseStudies()

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}` },
    { name: 'Case Studies', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/case-studies` },
  ])

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <JsonLdScript schema={breadcrumbSchema} />
      <ContentNavigation />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-5xl">
            Case Studies
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Explore how we've helped businesses achieve their goals through strategic design and development.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="space-y-8">
          {caseStudies.map((study) => (
            <article
              key={study.slug}
              className="border-b border-gray-200 pb-8 dark:border-gray-800 last:border-b-0"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {study.clientName}
                  </span>
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {study.formattedDate}
                  </time>
                </div>

                <h2 className="text-2xl font-bold text-black dark:text-white">
                  <Link
                    href={study.url}
                    className="hover:text-gray-600 dark:hover:text-gray-400"
                  >
                    {study.title}
                  </Link>
                </h2>

                <p className="text-gray-600 dark:text-gray-400">
                  {study.problem}
                </p>

                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                    Results:
                  </p>
                  <p className="mt-2 text-sm text-green-800 dark:text-green-200">
                    {study.results}
                  </p>
                </div>

                {study.tags && study.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {study.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={study.url}
                  className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Read case study →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {caseStudies.length === 0 && (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No case studies yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  )
}

