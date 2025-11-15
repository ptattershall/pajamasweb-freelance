/**
 * Client Portal Milestones Page
 */

'use client'

import { useEffect, useState } from 'react'
import { Milestone, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Milestone {
  id: string
  title: string
  description: string | null
  due_date: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  progress_percent: number
}

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await fetch('/api/portal/milestones')
        if (response.ok) {
          const data = await response.json()
          setMilestones(data)
        }
      } catch (error) {
        console.error('Error fetching milestones:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMilestones()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-600" />
      case 'in_progress':
        return <Clock size={20} className="text-blue-600" />
      case 'blocked':
        return <AlertCircle size={20} className="text-red-600" />
      default:
        return <Milestone size={20} className="text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'blocked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Project Milestones</h1>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading milestones...</div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Milestone size={48} className="mx-auto mb-4 opacity-50" />
            <p>No milestones yet</p>
          </div>
        ) : (
          milestones.map((milestone) => (
            <Link key={milestone.id} href={`/portal/milestones/${milestone.id}`}>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(milestone.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                      {milestone.description && (
                        <p className="text-gray-600 text-sm mt-1">{milestone.description}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                    {milestone.status.replace('_', ' ').charAt(0).toUpperCase() + milestone.status.slice(1)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-gray-600">{milestone.progress_percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${milestone.progress_percent}%` }}
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div className="text-sm text-gray-600">
                  Due: {formatDate(milestone.due_date)}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

