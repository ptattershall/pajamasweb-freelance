/**
 * Image Utilities for Cropping
 *
 * Provides canvas-based image cropping functionality for the Admin CMS.
 * Uses react-easy-crop's croppedAreaPixels output format.
 */

/**
 * Area type from react-easy-crop
 */
export interface Area {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Preset aspect ratios for hero images
 */
export const ASPECT_RATIOS = {
  '16:9': 16 / 9, // Widescreen (recommended for blog)
  '4:3': 4 / 3, // Standard
  '1:1': 1, // Square
  '3:2': 3 / 2, // Photography
  Free: 0, // No constraint (use 0 to indicate free-form)
} as const

export type AspectRatioKey = keyof typeof ASPECT_RATIOS

/**
 * Creates an image element from a source URL
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

/**
 * Crops an image using HTML Canvas API
 *
 * @param imageSrc - The source image URL or data URL
 * @param pixelCrop - The crop area in pixels from react-easy-crop
 * @param fileName - Original file name for output
 * @param rotation - Rotation angle in degrees (default: 0)
 * @returns Promise<File> - The cropped image as a File object
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  fileName: string,
  rotation: number = 0
): Promise<File> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  // Set canvas dimensions for rotation
  canvas.width = safeArea
  canvas.height = safeArea

  // Translate and rotate around center
  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)

  // Draw the rotated image
  ctx.drawImage(image, safeArea / 2 - image.width / 2, safeArea / 2 - image.height / 2)

  // Extract the cropped portion
  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  // Set canvas to final crop size
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Paste the cropped image
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
  )

  // Convert to blob and return as File
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty - failed to create blob'))
          return
        }

        // Preserve original file extension or default to jpeg
        const extension = fileName.split('.').pop()?.toLowerCase()
        const mimeType =
          extension === 'png'
            ? 'image/png'
            : extension === 'webp'
              ? 'image/webp'
              : 'image/jpeg'

        const file = new File([blob], fileName, { type: mimeType })
        resolve(file)
      },
      'image/jpeg',
      0.92 // Quality for JPEG compression
    )
  })
}

/**
 * Simplified crop function without rotation support
 * Useful for basic cropping scenarios
 */
export async function cropImageSimple(
  imageSrc: string,
  pixelCrop: Area,
  fileName: string
): Promise<File> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Set canvas dimensions to crop size
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Draw the cropped portion directly
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // Convert to blob and return as File
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty - failed to create blob'))
          return
        }

        const file = new File([blob], fileName, { type: 'image/jpeg' })
        resolve(file)
      },
      'image/jpeg',
      0.92
    )
  })
}

/**
 * Gets the display name for an aspect ratio
 */
export function getAspectRatioDisplayName(key: AspectRatioKey): string {
  return key
}

/**
 * Calculates initial zoom to fit image in container
 */
export function calculateInitialZoom(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number
): number {
  const widthRatio = containerWidth / imageWidth
  const heightRatio = containerHeight / imageHeight
  return Math.min(widthRatio, heightRatio, 1)
}
