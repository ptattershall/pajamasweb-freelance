'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import type { Service } from '@/lib/supabase'

interface ServiceFilterGridProps {
  services: Service[]
}

type TierFilter = 'all' | 'starter' | 'pro' | 'enterprise'

const tierLabels: Record<TierFilter, string> = {
  all: 'All Tiers',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

const tierBadgeColors: Record<string, string> = {
  starter: 'bg-green-100 text-green-700',
  pro: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
}

export function ServiceFilterGrid({ services }: ServiceFilterGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')

  const filteredServices = useMemo(() => {
    let result = services

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        (service) =>
          service.title.toLowerCase().includes(query) ||
          service.summary?.toLowerCase().includes(query)
      )
    }

    if (tierFilter !== 'all') {
      result = result.filter((service) => service.tier === tierFilter)
    }

    return result
  }, [services, searchQuery, tierFilter])

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setTierFilter('all')
  }

  const hasActiveFilters = searchQuery.trim() !== '' || tierFilter !== 'all'

  return (
    <div>
      {/* Filter Controls */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 sm:w-64"
              aria-label="Search services"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tier Filter */}
          <Select
            value={tierFilter}
            onValueChange={(value: TierFilter) => setTierFilter(value)}
          >
            <SelectTrigger
              className="w-full sm:w-40"
              aria-label="Filter by tier"
            >
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="min-h-[44px] px-2 py-2 text-sm text-slate-600 underline hover:text-slate-900"
            aria-label="Clear all filters"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results Count */}
      {hasActiveFilters && (
        <p className="mb-6 text-sm text-slate-600">
          Showing {filteredServices.length} of {services.length} service
          {services.length !== 1 ? 's' : ''}
          {searchQuery && (
            <span>
              {' '}
              matching &quot;<span className="font-medium">{searchQuery}</span>&quot;
            </span>
          )}
          {tierFilter !== 'all' && (
            <span>
              {' '}
              in <span className="font-medium">{tierLabels[tierFilter]}</span>{' '}
              tier
            </span>
          )}
        </p>
      )}

      {/* Services Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <Link
            key={service.id}
            href={`/services/${service.slug}`}
            className="group rounded-lg border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-slate-300 hover:shadow-lg"
          >
            <div className="mb-4">
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                  tierBadgeColors[service.tier || 'pro'] ||
                  'bg-blue-100 text-blue-700'
                }`}
              >
                {service.tier
                  ? service.tier.charAt(0).toUpperCase() + service.tier.slice(1)
                  : 'Standard'}
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

            <p className="mb-6 text-slate-600">{service.summary}</p>

            <div className="inline-flex min-h-[44px] items-center rounded bg-blue-600 px-4 py-2 font-semibold text-white transition-colors group-hover:bg-blue-700">
              View Details →
            </div>
          </Link>
        ))}
      </div>

      {/* No Results State */}
      {filteredServices.length === 0 && services.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <p className="mb-2 text-slate-600">
            No services found matching your criteria.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="min-h-[44px] py-2 text-blue-600 underline hover:text-blue-700"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Empty State */}
      {services.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-slate-600">No services available at this time.</p>
        </div>
      )}
    </div>
  )
}
