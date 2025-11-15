'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

interface SearchResult {
  blog: Array<{
    id: string
    slug: string
    title: string
    summary?: string
    published_at?: string
  }>
  caseStudies: Array<{
    id: string
    slug: string
    title: string
    client_name?: string
    published_at?: string
  }>
  total: number
}

export function SearchContent() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setResults({ blog: [], caseStudies: [], total: 0 })
    } finally {
      setLoading(false)
    }
  }, [query])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blog posts and case studies..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {searched && results && (
        <div>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Found {results.total} result{results.total !== 1 ? 's' : ''}
          </p>

          {results.blog.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">Blog Posts</h2>
              <div className="space-y-4">
                {results.blog.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="block rounded-lg border border-gray-200 p-4 hover:border-blue-500 dark:border-gray-800 dark:hover:border-blue-500"
                  >
                    <h3 className="font-semibold text-black dark:text-white">
                      {post.title}
                    </h3>
                    {post.summary && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {post.summary}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.caseStudies.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-bold">Case Studies</h2>
              <div className="space-y-4">
                {results.caseStudies.map((study) => (
                  <Link
                    key={study.id}
                    href={`/case-studies/${study.slug}`}
                    className="block rounded-lg border border-gray-200 p-4 hover:border-blue-500 dark:border-gray-800 dark:hover:border-blue-500"
                  >
                    <h3 className="font-semibold text-black dark:text-white">
                      {study.title}
                    </h3>
                    {study.client_name && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Client: {study.client_name}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.total === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-400">
              No results found for "{query}"
            </p>
          )}
        </div>
      )}
    </div>
  )
}

