'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { getCroppedImage, ASPECT_RATIOS, type AspectRatioKey } from '@/lib/image-utils'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface ImageCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  fileName: string
  onCropComplete: (croppedFile: File) => void
  onCancel: () => void
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  fileName,
  onCropComplete,
  onCancel,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioKey>('16:9')
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropChange = useCallback((location: Point) => {
    setCrop(location)
  }, [])

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom)
  }, [])

  const onRotationChange = useCallback((newRotation: number) => {
    setRotation(newRotation)
  }, [])

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleAspectChange = (value: AspectRatioKey) => {
    setAspectRatio(value)
    // Reset crop position when aspect ratio changes
    setCrop({ x: 0, y: 0 })
  }

  const handleResetRotation = () => {
    setRotation(0)
  }

  const handleCropConfirm = async () => {
    if (!croppedAreaPixels) return

    setIsProcessing(true)
    try {
      const croppedFile = await getCroppedImage(
        imageSrc,
        croppedAreaPixels,
        fileName,
        rotation
      )
      onCropComplete(croppedFile)
    } catch (error) {
      console.error('Crop failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    // Reset state when canceling
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setAspectRatio('16:9')
    setCroppedAreaPixels(null)
    onCancel()
  }

  // Get the actual aspect ratio value (0 means free-form)
  const aspectValue = ASPECT_RATIOS[aspectRatio]
  const cropperAspect = aspectValue === 0 ? undefined : aspectValue

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Adjust the crop area for your hero image. Use zoom and rotation controls for fine-tuning.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Aspect Ratio Selector */}
            <div className="flex items-center gap-2">
              <Label htmlFor="aspect" className="text-sm font-medium whitespace-nowrap">
                Aspect Ratio
              </Label>
              <Select value={aspectRatio} onValueChange={handleAspectChange}>
                <SelectTrigger className="w-28" id="aspect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ASPECT_RATIOS) as AspectRatioKey[]).map((ratio) => (
                    <SelectItem key={ratio} value={ratio}>
                      {ratio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zoom Control */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <ZoomOut className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Label htmlFor="zoom" className="sr-only">
                Zoom
              </Label>
              <Slider
                id="zoom"
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => onZoomChange(value[0])}
                className="flex-1"
                aria-label="Zoom level"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* Rotation Control */}
            <div className="flex items-center gap-2">
              <Label htmlFor="rotation" className="text-sm font-medium whitespace-nowrap">
                Rotation
              </Label>
              <Slider
                id="rotation"
                value={[rotation]}
                min={-180}
                max={180}
                step={1}
                onValueChange={(value) => onRotationChange(value[0])}
                className="w-24"
                aria-label="Rotation angle"
              />
              <span className="text-sm text-muted-foreground w-10 text-right">
                {rotation}°
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleResetRotation}
                className="h-8 w-8"
                aria-label="Reset rotation"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Crop Area */}
          <div className="relative flex-1 min-h-[300px] bg-muted rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={cropperAspect}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteCallback}
              onZoomChange={onZoomChange}
              onRotationChange={onRotationChange}
              showGrid={true}
              objectFit="contain"
            />
          </div>

          {/* Preview Info */}
          {croppedAreaPixels && (
            <p className="text-xs text-muted-foreground text-center">
              Output size: {Math.round(croppedAreaPixels.width)} × {Math.round(croppedAreaPixels.height)} pixels
            </p>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCropConfirm}
            disabled={!croppedAreaPixels || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
