/**
 * Admin Milestones Management Page
 */

'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Milestone {
  id: string
  title: string
  description: string | null
  due_date: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  progress_percent: number
  client_id: string
  profiles: { display_name: string; company: string } | null
}

export default function AdminMilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
    progress_percent: 0,
  })

  useEffect(() => {
    fetchMilestones()
  }, [])

  const fetchMilestones = async () => {
    try {
      const response = await fetch('/api/admin/milestones')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/milestones/${editingId}` : '/api/admin/milestones'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          progress_percent: parseInt(formData.progress_percent.toString()),
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingId(null)
        setFormData({
          client_id: '',
          title: '',
          description: '',
          due_date: '',
          status: 'pending',
          progress_percent: 0,
        })
        fetchMilestones()
      }
    } catch (error) {
      console.error('Error saving milestone:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return

    try {
      const response = await fetch(`/api/admin/milestones/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchMilestones()
      }
    } catch (error) {
      console.error('Error deleting milestone:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />
      case 'in_progress':
        return <Clock size={16} className="text-blue-600" />
      case 'blocked':
        return <AlertCircle size={16} className="text-red-600" />
      default:
        return <AlertCircle size={16} className="text-gray-600" />
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Manage Milestones</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          New Milestone
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Milestone' : 'Create New Milestone'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Milestone title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client ID</Label>
                  <Input
                    id="client_id"
                    placeholder="Client ID"
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Milestone description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="progress_percent">Progress %</Label>
                  <Input
                    id="progress_percent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress_percent}
                    onChange={(e) => setFormData({ ...formData, progress_percent: parseInt(e.target.value) })}
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="default">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestones.map((milestone) => (
              <TableRow key={milestone.id}>
                <TableCell className="font-medium">{milestone.title}</TableCell>
                <TableCell>{milestone.profiles?.display_name || 'Unknown'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(milestone.status)}
                    <span className="capitalize">{milestone.status.replace('_', ' ')}</span>
                  </div>
                </TableCell>
                <TableCell>{milestone.progress_percent}%</TableCell>
                <TableCell>
                  {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit milestone"
                      onClick={() => {
                        setEditingId(milestone.id)
                        setFormData({
                          client_id: milestone.client_id,
                          title: milestone.title,
                          description: milestone.description || '',
                          due_date: milestone.due_date || '',
                          status: milestone.status,
                          progress_percent: milestone.progress_percent,
                        })
                        setShowForm(true)
                      }}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete milestone"
                      onClick={() => handleDelete(milestone.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

