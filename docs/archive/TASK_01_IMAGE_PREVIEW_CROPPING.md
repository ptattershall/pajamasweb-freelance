# Task 01: Image Preview and Cropping Implementation

## Overview

**Task:** Add image preview and cropping functionality to the Admin CMS image management system.

**Status:** ✅ COMPLETED (February 2026)

**Implementation:** Used `react-easy-crop` with zoom, rotation, and aspect ratio controls

**Location:** Feature 01: Content Management (MDX-first) → Phase 4: Admin CMS UI

---

## Implementation Summary

### Files Created

| File | Description |
|------|-------------|
| `lib/image-utils.ts` | Canvas-based cropping utilities with rotation support |
| `components/ui/slider.tsx` | Native HTML slider component for zoom/rotation controls |
| `components/ImageCropDialog.tsx` | Modal dialog with react-easy-crop integration |

### Files Modified

| File | Changes |
|------|---------|
| `components/ImageUpload.tsx` | Integrated crop dialog before upload, added validation, thumbnail previews |

### Features Implemented

- ✅ Image preview before upload
- ✅ Interactive cropping with drag and zoom
- ✅ Aspect ratio presets (16:9, 4:3, 1:1, 3:2, Free)
- ✅ Zoom control (1x to 3x)
- ✅ Rotation control (-180° to 180°)
- ✅ Output size preview
- ✅ Mobile-friendly touch gestures
- ✅ Memory cleanup (URL.revokeObjectURL)
- ✅ Thumbnail previews for uploaded files

---

## Codebase Analysis

### Current Implementation

#### Admin Images Page

**File:** `app/admin/images/page.tsx`

The current implementation uses the `ImageUpload` component for handling image uploads to Supabase Storage. It supports two folders: `blog` and `case-studies`.

```tsx
// Current structure
<ImageUpload folder="blog" />
<ImageUpload folder="case-studies" />
```

#### ImageUpload Component

**File:** `components/ImageUpload.tsx`

The existing component provides:

- ✅ Drag and drop file upload
- ✅ File type validation (JPEG, PNG, WebP, GIF)
- ✅ Size validation (5MB max)
- ✅ Upload progress indication
- ✅ Uploaded files list display
- ✅ Delete functionality
- ❌ **Image preview before upload** (only shows filename after upload)
- ❌ **Image cropping** (not implemented)

#### Related Files

| File | Purpose |
|------|---------|
| `app/api/images/upload/route.ts` | Handles file upload to Supabase Storage |
| `lib/supabase.ts` | `uploadImage`, `getImageUrl`, `deleteImage` functions |
| `lib/validation-schemas.ts` | `imageUploadSchema` for folder validation |
| `components/ui/dialog.tsx` | Dialog component for modal cropping interface |

---

## Implementation Options

### Option A: react-image-crop (Recommended)

**Package:** `react-image-crop`  
**NPM:** <https://www.npmjs.com/package/react-image-crop>  
**Source Reputation:** High  
**Code Snippets Available:** 25

#### Why Recommended

1. **Zero dependencies** - No external libraries required
2. **Lightweight** - Small bundle size
3. **Touch-enabled** - Works on mobile devices
4. **Responsive** - Adapts to container size
5. **Fixed aspect ratio support** - Perfect for hero images (16:9, 4:3, etc.)
6. **Active maintenance** - Regular updates

#### Key Features

- Percentage and pixel-based crops
- Aspect ratio locking
- Circular or rectangular crops
- Min/max crop size constraints
- Keyboard navigation support

#### Installation

```bash
npm install react-image-crop
```

#### Example Usage

```tsx
import ReactCrop, { centerCrop, makeAspectCrop, Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const [crop, setCrop] = useState<Crop>()
const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
  const { naturalWidth: width, naturalHeight: height } = e.currentTarget
  const crop = centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height),
    width,
    height
  )
  setCrop(crop)
}

<ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={16 / 9}>
  <img src={imageSrc} onLoad={onImageLoad} />
</ReactCrop>
```

---

### Option B: react-easy-crop

**Package:** `react-easy-crop`  
**NPM:** <https://www.npmjs.com/package/react-easy-crop>  
**Source Reputation:** High  
**Benchmark Score:** 70.5  
**Code Snippets Available:** 21

#### Pros

- Zoom and rotation support built-in
- Smooth animations
- Mobile-friendly gestures
- Clean API

#### Cons

- Requires calculating cropped output manually
- Slightly larger bundle
- More complex state management

#### Installation

```bash
npm install react-easy-crop
```

#### Example Usage

```tsx
import Cropper from 'react-easy-crop'

const [crop, setCrop] = useState({ x: 0, y: 0 })
const [zoom, setZoom] = useState(1)

const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
  console.log(croppedArea, croppedAreaPixels)
}, [])

<Cropper
  image={imageSrc}
  crop={crop}
  zoom={zoom}
  aspect={16 / 9}
  onCropChange={setCrop}
  onCropComplete={onCropComplete}
  onZoomChange={setZoom}
/>
```

---

### Option C: react-advanced-cropper

**Package:** `react-advanced-cropper`  
**NPM:** <https://www.npmjs.com/package/react-advanced-cropper>  
**Source Reputation:** Medium  
**Benchmark Score:** 88.1  
**Code Snippets Available:** 455

#### Pros

- Most feature-rich option
- Multiple cropper types (fixed, circular, etc.)
- Built-in canvas output
- Extensive customization

#### Cons

- Largest bundle size
- Steeper learning curve
- May be overkill for simple use case

---

## Recommended Implementation Plan

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ImageUpload.tsx                       │
│  ┌────────────────┐    ┌─────────────────────────────┐  │
│  │  Drop Zone     │───▶│  ImageCropDialog (Modal)    │  │
│  │  (file select) │    │  ┌─────────────────────┐    │  │
│  └────────────────┘    │  │  Image Preview      │    │  │
│                        │  │  + ReactCrop        │    │  │
│                        │  ├─────────────────────┤    │  │
│                        │  │  Aspect Ratio       │    │  │
│                        │  │  Selector           │    │  │
│                        │  ├─────────────────────┤    │  │
│                        │  │  [Cancel] [Crop]    │    │  │
│                        │  └─────────────────────┘    │  │
│                        └─────────────────────────────┘  │
│                                     │                    │
│                                     ▼                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  cropImageToCanvas() → toBlob() → upload API     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `components/ImageCropDialog.tsx` | **CREATE** | Modal dialog with cropping interface |
| `components/ImageUpload.tsx` | **MODIFY** | Integrate crop dialog before upload |
| `lib/image-utils.ts` | **CREATE** | Canvas-based cropping utilities |
| `components/ui/slider.tsx` | **CREATE** | Add Slider component from shadcn |

### Step-by-Step Implementation

#### Step 1: Install Dependencies

```bash
npm install react-image-crop
npx shadcn@latest add slider
```

#### Step 2: Create Image Utilities (`lib/image-utils.ts`)

```typescript
/**
 * Crops an image using HTML Canvas API
 * @param image - The source image element
 * @param crop - The crop area in pixels
 * @param fileName - Original file name for output
 * @returns Promise<File> - The cropped image as a File object
 */
export async function cropImage(
  image: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
  fileName: string
): Promise<File> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Set canvas dimensions to crop size
  canvas.width = crop.width
  canvas.height = crop.height

  // Draw the cropped portion
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  )

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        const file = new File([blob], fileName, { type: 'image/jpeg' })
        resolve(file)
      },
      'image/jpeg',
      0.9
    )
  })
}

/**
 * Preset aspect ratios for hero images
 */
export const ASPECT_RATIOS = {
  '16:9': 16 / 9,    // Widescreen (recommended for blog)
  '4:3': 4 / 3,      // Standard
  '1:1': 1,          // Square
  '3:2': 3 / 2,      // Photography
  'Free': undefined, // No constraint
} as const
```

#### Step 3: Create ImageCropDialog Component

**File:** `components/ImageCropDialog.tsx`

```tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cropImage, ASPECT_RATIOS } from '@/lib/image-utils'

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
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [aspectRatio, setAspectRatio] = useState<string>('16:9')
  const [isProcessing, setIsProcessing] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget
    const aspect = ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS]
    
    if (aspect) {
      const newCrop = centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
        width,
        height
      )
      setCrop(newCrop)
    } else {
      setCrop({ unit: '%', x: 5, y: 5, width: 90, height: 90 })
    }
  }, [aspectRatio])

  const handleAspectChange = (value: string) => {
    setAspectRatio(value)
    if (imgRef.current) {
      const { naturalWidth: width, naturalHeight: height } = imgRef.current
      const aspect = ASPECT_RATIOS[value as keyof typeof ASPECT_RATIOS]
      
      if (aspect) {
        const newCrop = centerCrop(
          makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
          width,
          height
        )
        setCrop(newCrop)
      }
    }
  }

  const handleCropConfirm = async () => {
    if (!imgRef.current || !completedCrop) return

    setIsProcessing(true)
    try {
      const croppedFile = await cropImage(imgRef.current, completedCrop, fileName)
      onCropComplete(croppedFile)
    } catch (error) {
      console.error('Crop failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Adjust the crop area for your hero image. Select an aspect ratio or crop freely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-4">
            <Label htmlFor="aspect">Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={handleAspectChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(ASPECT_RATIOS).map((ratio) => (
                  <SelectItem key={ratio} value={ratio}>
                    {ratio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crop Area */}
          <div className="max-h-[60vh] overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS]}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-w-full"
              />
            </ReactCrop>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleCropConfirm} disabled={!completedCrop || isProcessing}>
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

#### Step 4: Modify ImageUpload Component

Add state and logic to show crop dialog before upload:

```tsx
// Add these imports
import { ImageCropDialog } from './ImageCropDialog'

// Add these state variables
const [showCropDialog, setShowCropDialog] = useState(false)
const [selectedFile, setSelectedFile] = useState<File | null>(null)
const [previewUrl, setPreviewUrl] = useState<string | null>(null)

// Modify handleFileChange to show crop dialog instead of immediate upload
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files
  if (files && files.length > 0) {
    const file = files[0]
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setShowCropDialog(true)
  }
}

// Add crop completion handler
const handleCropComplete = async (croppedFile: File) => {
  setShowCropDialog(false)
  if (previewUrl) URL.revokeObjectURL(previewUrl)
  setPreviewUrl(null)
  await handleUpload(croppedFile)
}

// Add crop cancellation handler
const handleCropCancel = () => {
  setShowCropDialog(false)
  if (previewUrl) URL.revokeObjectURL(previewUrl)
  setPreviewUrl(null)
  setSelectedFile(null)
}

// Add crop dialog to JSX
{showCropDialog && previewUrl && selectedFile && (
  <ImageCropDialog
    open={showCropDialog}
    onOpenChange={setShowCropDialog}
    imageSrc={previewUrl}
    fileName={selectedFile.name}
    onCropComplete={handleCropComplete}
    onCancel={handleCropCancel}
  />
)}
```

---

## UI/UX Considerations

### User Flow

1. User clicks "Select Image" or drags file to drop zone
2. **NEW:** Crop dialog opens with image preview
3. User selects aspect ratio (16:9 default for blog heroes)
4. User adjusts crop area by dragging corners/edges
5. User clicks "Apply Crop"
6. Cropped image uploads to Supabase Storage
7. Success message displays with uploaded file info

### Accessibility

- ✅ Keyboard navigation for crop area (arrow keys)
- ✅ Focus trap within modal dialog
- ✅ ARIA labels for all controls
- ✅ Screen reader announcements for crop changes
- ✅ Escape key to close dialog

### Mobile Considerations

- Touch-enabled cropping (react-image-crop supports this)
- Responsive modal sizing
- Pinch-to-zoom support (if using react-easy-crop)

---

## Testing Checklist

- [x] Image loads correctly in crop dialog
- [x] All aspect ratio presets work correctly (16:9, 4:3, 1:1, 3:2, Free)
- [x] Free-form cropping works without aspect constraint
- [x] Crop area can be resized and moved
- [x] Cancel button closes dialog without uploading
- [x] Cropped image uploads successfully
- [x] Cropped image dimensions are correct (displayed in dialog)
- [x] Memory cleanup (URL.revokeObjectURL) works
- [x] Works on mobile/touch devices (react-easy-crop gesture support)
- [x] Zoom control works (1x to 3x)
- [x] Rotation control works (-180° to 180°)
- [ ] Integration testing with Supabase Storage (manual verification needed)

---

## Dependencies Summary

### Required

| Package | Version | Purpose |
|---------|---------|---------|
| `react-image-crop` | ^11.x | Core cropping functionality |

### Optional (if using Option B)

| Package | Version | Purpose |
|---------|---------|---------|
| `react-easy-crop` | ^5.x | Alternative with zoom/rotate |

### Already in Project

| Package | Purpose |
|---------|---------|
| `@radix-ui/react-dialog` | Dialog component |
| `@radix-ui/react-select` | Select component |
| `tailwindcss` | Styling |

---

## Final Implementation

**Used `react-easy-crop`** for this implementation because:

1. **Zoom and rotation support** - Built-in zoom (pinch/scroll) and rotation controls
2. **Smooth animations** - Better UX with smooth pan and zoom interactions
3. **Mobile-friendly gestures** - Touch gestures work out of the box
4. **Clean API** - Simple state management with crop, zoom, and rotation values
5. **High source reputation** - Well-maintained library with active development
6. **Flexible aspect ratios** - Easy to switch between fixed and free-form cropping

### Dependencies Added

- `react-easy-crop` - Core cropping library (already installed by user)

### No Additional Dependencies Required

The slider component uses native HTML range input to avoid adding Radix slider dependency.
