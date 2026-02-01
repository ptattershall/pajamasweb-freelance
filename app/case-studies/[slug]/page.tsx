import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getCaseStudyBySlug, getAllCaseStudies } from '@/lib/content'
import { getCaseStudyImages, supabase, CaseStudyImage } from '@/lib/supabase'
import Link from 'next/link'
import { OptimizedImage } from '@/components/OptimizedImage'
import { RelatedCaseStudies } from '@/components/RelatedCaseStudies'
import { ContentNavigation } from '@/components/ContentNavigation'
import { FloatingChatButton } from '@/components/FloatingChatButton'
import { MultipleJsonLdScripts } from '@/components/JsonLdScript'
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/json-ld-schemas'
import type { Metadata } from 'next'

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const studies = getAllCaseStudies()
  return studies.map((study) => ({
    slug: study.slug,
  }))
}

export async function generateMetadata(
  props: CaseStudyPageProps
): Promise<Metadata> {
  const params = await props.params
  const study = getCaseStudyBySlug(params.slug)

  if (!study) {
    return {}
  }

  const ogImageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/thumbnail.png`

  return {
    title: `${study.title} | PJais.ai`,
    description: study.problem,
    openGraph: {
      title: study.title,
      description: study.problem,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/case-studies/${params.slug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: study.title,
        },
      ],
      publishedTime: study.publishedAt,
      authors: ['PJais.ai'],
    },
    twitter: {
      card: 'summary_large_image',
      title: study.title,
      description: study.problem,
      images: [ogImageUrl],
    },
  }
}

export default async function CaseStudyPage(props: CaseStudyPageProps) {
  const params = await props.params
  const study = getCaseStudyBySlug(params.slug)

  if (!study) {
    notFound()
  }

  // Fetch associated images
  let images: CaseStudyImage[] = []
  try {
    images = await getCaseStudyImages(params.slug)
  } catch (error) {
    console.error('Error fetching case study images:', error)
  }

  // Generate JSON-LD schemas
  const articleSchema = generateArticleSchema({
    title: study.title,
    summary: `${study.clientName} - ${study.problem}`,
    publishedAt: study.publishedAt,
    slug: params.slug,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}` },
    { name: 'Case Studies', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/case-studies` },
    { name: study.title, url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/case-studies/${params.slug}` },
  ])

  // Find hero image
  const heroImage = images?.find((img: any) => img.is_hero)

  // Fetch embedding for related case studies
  let embedding: number[] | undefined
  try {
    const { data } = await supabase
      .from('case_studies_meta')
      .select('embedding')
      .eq('slug', params.slug)
      .single()

    const caseStudyMeta = data as { embedding?: number[] } | null
    if (caseStudyMeta?.embedding) {
      embedding = caseStudyMeta.embedding
    }
  } catch (error) {
    console.error('Error fetching case study embedding:', error)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <MultipleJsonLdScripts schemas={[articleSchema, breadcrumbSchema]} />
      <ContentNavigation backLink={{ href: '/case-studies', label: 'Back to Case Studies' }} />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-12">
          <div className="mb-4">
            <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-900 dark:bg-blue-900 dark:text-blue-100">
              {study.clientName}
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-5xl">
            {study.title}
          </h1>

          <time className="mt-4 block text-sm text-gray-500 dark:text-gray-400">
            {study.formattedDate}
          </time>
        </header>

        {/* Hero Image */}
        {heroImage && heroImage.images && (
          <div className="mb-12 overflow-hidden rounded-lg">
            <OptimizedImage
              src={heroImage.images.url}
              alt={heroImage.images.filename}
              width={800}
              height={400}
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
            />
          </div>
        )}

        {/* Problem & Results */}
        <div className="mb-12 grid gap-8 md:grid-cols-2">
          <div className="rounded-lg bg-red-50 p-6 dark:bg-red-950">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              The Challenge
            </h3>
            <p className="mt-3 text-red-800 dark:text-red-200">
              {study.problem}
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-6 dark:bg-green-950">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
              The Results
            </h3>
            <p className="mt-3 text-green-800 dark:text-green-200">
              {study.results}
            </p>
          </div>
        </div>

        {/* Tags */}
        {study.tags && study.tags.length > 0 && (
          <div className="mb-12 flex flex-wrap gap-2">
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

        {/* Content */}
        <article className="prose prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-h5:text-lg prose-h6:text-base dark:prose-headings:text-white dark:prose-invert max-w-none">
          <MDXRemote source={study.content} />
        </article>

        {/* Related Case Studies */}
        {embedding && (
          <RelatedCaseStudies
            currentSlug={params.slug}
            embedding={embedding}
            limit={3}
          />
        )}
      </div>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  )
}

