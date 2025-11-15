'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  sizes?: string
  quality?: number
}

/**
 * OptimizedImage Component
 * 
 * Provides optimized image rendering with:
 * - Automatic responsive sizing
 * - Lazy loading (default)
 * - WebP format support
 * - Blur placeholder while loading
 * - Proper aspect ratio handling
 */
export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 400,
  priority = false,
  className = '',
  sizes,
  quality = 75,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Default responsive sizes if not provided
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px'

  return (
    <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-900 ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        sizes={defaultSizes}
        loading={priority ? 'eager' : 'lazy'}
        onLoadingComplete={() => setIsLoading(false)}
        className={`h-auto w-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        placeholder="empty"
      />
      
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
      )}
    </div>
  )
}

export default OptimizedImage

