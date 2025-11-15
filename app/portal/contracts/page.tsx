/**
 * Client Portal Contracts Page
 */

'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, Eye, CheckCircle } from 'lucide-react'
import { FilePreviewModal } from '@/components/file-preview-modal'

interface Contract {
  id: string
  title: string
  file_url: string
  file_type: string
  file_size: number
  signed_at: string | null
  version: number
  created_at: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
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
    const fetchContracts = async () => {
      try {
        const response = await fetch('/api/portal/contracts')
        if (response.ok) {
          const data = await response.json()
          setContracts(data)
        }
      } catch (error) {
        console.error('Error fetching contracts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
  }, [])

  const handleDownload = async (contractId: string, fileName: string) => {
    setDownloadingId(contractId)
    try {
      const response = await fetch(`/api/portal/contracts/${contractId}/download`)
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
      console.error('Error downloading contract:', error)
    } finally {
      setDownloadingId(null)
    }
  }

  const handlePreview = async (contract: Contract) => {
    try {
      const response = await fetch(`/api/portal/contracts/${contract.id}/download`)
      if (response.ok) {
        const { signedUrl } = await response.json()
        setPreviewData({
          url: signedUrl,
          fileName: contract.title,
          fileType: contract.file_type,
          id: contract.id,
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
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Contracts</h1>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading contracts...</div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>No contracts yet</p>
          </div>
        ) : (
          contracts.map((contract) => (
            <div key={contract.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                    {contract.signed_at && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-xs font-medium text-green-700">Signed</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                    <span>v{contract.version}</span>
                    <span>{contract.file_type}</span>
                    <span>{formatFileSize(contract.file_size)}</span>
                    <span>Created: {formatDate(contract.created_at)}</span>
                    {contract.signed_at && (
                      <span>Signed: {formatDate(contract.signed_at)}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    title="Preview"
                    onClick={() => handlePreview(contract)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye size={18} className="text-gray-600" />
                  </button>
                  <button
                    type="button"
                    title="Download"
                    onClick={() => handleDownload(contract.id, contract.title)}
                    disabled={downloadingId === contract.id}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Download size={18} className="text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
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

