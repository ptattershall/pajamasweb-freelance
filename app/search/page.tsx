import { SearchContent } from '@/components/SearchContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search | PJais.ai',
  description: 'Search our blog posts and case studies',
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-black dark:text-white sm:text-5xl">
          Search
        </h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
          Find blog posts and case studies
        </p>

        <SearchContent />
      </div>
    </div>
  )
}

