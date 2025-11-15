'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, AlertCircle, CheckCircle } from 'lucide-react'

export default function DeliverablesUploadPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    projectId: '',
    file: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, file })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (!formData.file || !formData.clientId || !formData.title) {
        setMessage({ type: 'error', text: 'Please fill in all required fields' })
        return
      }

      const form = new FormData()
      form.append('file', formData.file)
      form.append('clientId', formData.clientId)
      form.append('title', formData.title)
      form.append('description', formData.description)
      form.append('projectId', formData.projectId)

      const response = await fetch('/api/admin/deliverables/upload', {
        method: 'POST',
        body: form,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      setMessage({ type: 'success', text: 'Deliverable uploaded successfully!' })
      setFormData({ clientId: '', title: '', description: '', projectId: '', file: null })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Upload failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Upload Deliverable</h1>
        <p className="text-muted-foreground mt-2">Upload project deliverables for clients</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Deliverable</CardTitle>
          <CardDescription>Upload a file and assign it to a client</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID *</Label>
              <Input
                id="clientId"
                type="text"
                placeholder="Enter client UUID"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Website Design Files"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description of the deliverable"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                type="text"
                placeholder="Optional project UUID"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-input">File *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                  required
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <span className="text-sm font-medium">
                    {formData.file ? formData.file.name : 'Click to upload or drag and drop'}
                  </span>
                </label>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Uploading...' : 'Upload Deliverable'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

