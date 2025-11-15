'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'

interface ContentNavigationProps {
  backLink?: {
    href: string
    label: string
  }
}

export function ContentNavigation({ backLink }: ContentNavigationProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-black/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/PajamasWebCloud.png"
            alt="PajamasWeb Logo"
            width={40}
            height={40}
            className="dark:hidden"
          />
          <Image
            src="/PajamasWebCloudPurple.png"
            alt="PajamasWeb Logo"
            width={40}
            height={40}
            className="hidden dark:block"
          />
          <span className="text-xl font-bold text-black dark:text-white">PajamasWeb</span>
        </Link>

        <div className="flex gap-8 items-center">
          <Link
            href="/blog"
            className="text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
          >
            Blog
          </Link>
          <Link
            href="/case-studies"
            className="text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
          >
            Case Studies
          </Link>
          <Link
            href="/portal/signin"
            className="text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Back Link */}
      {backLink && (
        <div className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-6 py-3 sm:px-8">
            <Link
              href={backLink.href}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ChevronLeft size={16} />
              {backLink.label}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

