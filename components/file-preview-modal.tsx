'use client'

import { useState, useEffect } from 'react'
import { X, Download, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  fileName: string
  fileType: string
  onDownload?: () => void
}

export function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileType,
  onDownload,
}: FilePreviewModalProps) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setError(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const isPDF = fileType === 'application/pdf'
  const isImage = fileType.startsWith('image/')
  const isText = fileType.startsWith('text/')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold truncate">{fileName}</h2>
          <div className="flex items-center gap-2">
            {onDownload && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDownload}
                title="Download"
              >
                <Download size={20} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title="Close"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {error ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-4">
                <AlertCircle size={48} className="mx-auto text-red-500" />
                <p className="text-red-600">{error}</p>
                <p className="text-sm text-gray-500">
                  This file type cannot be previewed. Please download to view.
                </p>
              </div>
            </div>
          ) : isPDF ? (
            <iframe
              src={`${fileUrl}#toolbar=0`}
              className="w-full h-full border-0"
              title="PDF Preview"
              onError={() => setError('Failed to load PDF preview')}
            />
          ) : isImage ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
                onError={() => setError('Failed to load image')}
              />
            </div>
          ) : isText ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title="Text Preview"
              onError={() => setError('Failed to load text preview')}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-4">
                <AlertCircle size={48} className="mx-auto text-gray-400" />
                <p className="text-gray-600">
                  Preview not available for this file type ({fileType})
                </p>
                <p className="text-sm text-gray-500">
                  Please download the file to view it.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

