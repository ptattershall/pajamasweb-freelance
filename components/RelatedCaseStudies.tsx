'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface RelatedCaseStudiesProps {
  currentSlug: string
  embedding?: number[]
  limit?: number
}

interface RelatedCaseStudy {
  id: string
  slug: string
  title: string
  client_name: string
  problem: string
  similarity: number
}

export function RelatedCaseStudies({
  currentSlug,
  embedding,
  limit = 3,
}: RelatedCaseStudiesProps) {
  const [relatedStudies, setRelatedStudies] = useState<RelatedCaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!embedding) {
      setLoading(false)
      return
    }

    async function fetchRelatedStudies() {
      try {
        const response = await fetch('/api/related-case-studies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embedding,
            currentSlug,
            limit,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch related case studies')
        }

        const data = await response.json()
        setRelatedStudies(data.studies || [])
      } catch (err) {
        console.error('Error fetching related case studies:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedStudies()
  }, [embedding, currentSlug, limit])

  if (loading) {
    return (
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Related Case Studies</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || relatedStudies.length === 0) {
    return null
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Related Case Studies</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedStudies.map((study) => (
          <Link
            key={study.slug}
            href={`/case-studies/${study.slug}`}
            className="group block p-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all"
          >
            <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors mb-2">
              {study.title}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              <span className="font-medium">Client:</span> {study.client_name}
            </p>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {study.problem}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {Math.round(study.similarity * 100)}% match
              </span>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

