/**
 * Milestone Detail Page
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle, CheckCircle, Clock, Milestone } from 'lucide-react'
import Link from 'next/link'

interface MilestoneUpdate {
  id: string
  update_text: string
  created_at: string
}

interface MilestoneDetail {
  id: string
  title: string
  description: string | null
  due_date: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  progress_percent: number
  created_at: string
  updated_at: string
  updates: MilestoneUpdate[]
}

export default function MilestoneDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [milestone, setMilestone] = useState<MilestoneDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMilestone = async () => {
      try {
        const response = await fetch(`/api/portal/milestones/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch milestone')
        }
        const data = await response.json()
        setMilestone(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load milestone')
      } finally {
        setLoading(false)
      }
    }

    fetchMilestone()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={24} className="text-green-600" />
      case 'in_progress':
        return <Clock size={24} className="text-blue-600" />
      case 'blocked':
        return <AlertCircle size={24} className="text-red-600" />
      default:
        return <Milestone size={24} className="text-gray-600" />
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading milestone...</p>
      </div>
    )
  }

  if (error || !milestone) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Milestone not found'}</p>
        <Link href="/portal/milestones" className="text-blue-600 hover:underline">
          Back to Milestones
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link href="/portal/milestones" className="flex items-center gap-2 text-blue-600 hover:underline mb-6">
        <ArrowLeft size={20} />
        Back to Milestones
      </Link>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4 flex-1">
            {getStatusIcon(milestone.status)}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{milestone.title}</h1>
              {milestone.description && (
                <p className="text-gray-600 mt-2">{milestone.description}</p>
              )}
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(milestone.status)}`}>
            {milestone.status.replace('_', ' ').charAt(0).toUpperCase() + milestone.status.slice(1)}
          </span>
        </div>

        {/* Progress Section */}
        <div className="mb-8 pb-8 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Completion</span>
            <span className="text-sm font-medium text-gray-600">{milestone.progress_percent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${milestone.progress_percent}%` }}
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="mb-8 pb-8 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="text-gray-900 font-medium">
                {milestone.due_date ? formatDate(milestone.due_date) : 'No due date'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-gray-900 font-medium">{formatDate(milestone.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Updates Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Updates</h2>
          {milestone.updates.length === 0 ? (
            <p className="text-gray-500">No updates yet</p>
          ) : (
            <div className="space-y-4">
              {milestone.updates.map((update) => (
                <div key={update.id} className="bg-gray-50 rounded p-4">
                  <p className="text-sm text-gray-600 mb-2">{formatDate(update.created_at)}</p>
                  <p className="text-gray-900">{update.update_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

