/**
 * Project Overview Page
 */

'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Clock, AlertCircle, FileText, Package } from 'lucide-react'
import Link from 'next/link'

interface ProjectOverview {
  stats: {
    total_milestones: number
    completed_milestones: number
    in_progress_milestones: number
    blocked_milestones: number
    total_deliverables: number
    total_contracts: number
    signed_contracts: number
    average_progress: number
  }
  milestones: any[]
  deliverables: any[]
  contracts: any[]
}

export default function ProjectsPage() {
  const [overview, setOverview] = useState<ProjectOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch('/api/portal/projects/overview')
        if (response.ok) {
          const data = await response.json()
          setOverview(data)
        }
      } catch (error) {
        console.error('Error fetching project overview:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading project overview...</div>
  }

  if (!overview) {
    return <div className="text-center py-12">Failed to load project overview</div>
  }

  const { stats, milestones, deliverables, contracts } = overview

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Project Overview</h1>

      {/* Statistics Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Milestones</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_milestones}</p>
            </div>
            <Clock size={32} className="text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed_milestones}</p>
            </div>
            <CheckCircle size={32} className="text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{stats.in_progress_milestones}</p>
            </div>
            <Clock size={32} className="text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Blocked</p>
              <p className="text-3xl font-bold text-red-600">{stats.blocked_milestones}</p>
            </div>
            <AlertCircle size={32} className="text-red-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Average Progress */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Average Completion</span>
          <span className="text-sm font-medium text-gray-600">{stats.average_progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all"
            style={{ width: `${stats.average_progress}%` }}
          />
        </div>
      </div>

      {/* Deliverables & Contracts */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={24} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Deliverables</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-4">{stats.total_deliverables}</p>
          <Link href="/portal/deliverables" className="text-blue-600 hover:underline">
            View all deliverables →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={24} className="text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Contracts</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{stats.signed_contracts}/{stats.total_contracts}</p>
          <p className="text-sm text-gray-600 mb-4">Signed</p>
          <Link href="/portal/contracts" className="text-blue-600 hover:underline">
            View all contracts →
          </Link>
        </div>
      </div>

      {/* Recent Milestones */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Milestones</h2>
        {milestones.length === 0 ? (
          <p className="text-gray-500">No milestones yet</p>
        ) : (
          <div className="space-y-3">
            {milestones.slice(0, 5).map((milestone) => (
              <Link key={milestone.id} href={`/portal/milestones/${milestone.id}`}>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">{milestone.title}</p>
                    <p className="text-sm text-gray-600">{milestone.progress_percent}% complete</p>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{milestone.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

