import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-foreground">Admin CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Content Management</p>
        </div>

        <nav className="space-y-2 px-4">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start">
              Dashboard
            </Button>
          </Link>

          {/* Client Portal Section */}
          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-muted-foreground px-2 uppercase">Client Portal</p>
          </div>
          <Link href="/admin/clients">
            <Button variant="ghost" className="w-full justify-start">
              Clients
            </Button>
          </Link>

          {/* Content Management Section */}
          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-muted-foreground px-2 uppercase">Content</p>
          </div>
          <Link href="/admin/images">
            <Button variant="ghost" className="w-full justify-start">
              Image Management
            </Button>
          </Link>
          <Link href="/admin/blog">
            <Button variant="ghost" className="w-full justify-start">
              Blog Posts
            </Button>
          </Link>
          <Link href="/admin/case-studies">
            <Button variant="ghost" className="w-full justify-start">
              Case Studies
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Site
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

