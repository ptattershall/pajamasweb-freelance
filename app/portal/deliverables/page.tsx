/**
 * Client Portal Deliverables Page
 */

'use client'

import { useEffect, useState } from 'react'
import { Package, Download, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FilePreviewModal } from '@/components/file-preview-modal'

interface Deliverable {
  id: string
  title: string
  description: string | null
  file_url: string
  file_type: string
  file_size: number
  delivered_at: string
}

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<{
    url: string
    fileName: string
    fileType: string
    id: string
  } | null>(null)

  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        const response = await fetch('/api/portal/deliverables')
        if (response.ok) {
          const data = await response.json()
          setDeliverables(data)
        }
      } catch (error) {
        console.error('Error fetching deliverables:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeliverables()
  }, [])

  const handleDownload = async (deliverableId: string, fileName: string) => {
    setDownloadingId(deliverableId)
    try {
      const response = await fetch(`/api/portal/deliverables/${deliverableId}/download`)
      if (response.ok) {
        const { signedUrl } = await response.json()
        // Create a temporary link and trigger download
        const link = document.createElement('a')
        link.href = signedUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error downloading deliverable:', error)
    } finally {
      setDownloadingId(null)
    }
  }

  const handlePreview = async (deliverable: Deliverable) => {
    try {
      const response = await fetch(`/api/portal/deliverables/${deliverable.id}/download`)
      if (response.ok) {
        const { signedUrl } = await response.json()
        setPreviewData({
          url: signedUrl,
          fileName: deliverable.title,
          fileType: deliverable.file_type,
          id: deliverable.id,
        })
        setPreviewOpen(true)
      }
    } catch (error) {
      console.error('Error preparing preview:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Deliverables</h1>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading deliverables...</div>
        ) : deliverables.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No deliverables yet</p>
          </div>
        ) : (
          deliverables.map((deliverable) => (
            <Card key={deliverable.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{deliverable.title}</h3>
                    {deliverable.description && (
                      <p className="text-muted-foreground text-sm mt-1">{deliverable.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                      <Badge variant="secondary">{deliverable.file_type}</Badge>
                      <span>{formatFileSize(deliverable.file_size)}</span>
                      <span>Delivered: {formatDate(deliverable.delivered_at)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Preview"
                      onClick={() => handlePreview(deliverable)}
                    >
                      <Eye size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Download"
                      onClick={() => handleDownload(deliverable.id, deliverable.title)}
                      disabled={downloadingId === deliverable.id}
                    >
                      <Download size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {previewData && (
        <FilePreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          fileUrl={previewData.url}
          fileName={previewData.fileName}
          fileType={previewData.fileType}
          onDownload={() => {
            if (previewData) {
              handleDownload(previewData.id, previewData.fileName)
            }
          }}
        />
      )}
    </div>
  )
}

