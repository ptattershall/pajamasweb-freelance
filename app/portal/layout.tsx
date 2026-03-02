/**
 * Client Portal Layout
 *
 * Main layout for the authenticated client portal with navigation sidebar
 */

'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Home, FileText, Calendar, Package, Milestone, MessageSquare, User, BarChart3, CreditCard, Repeat, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

interface PortalLayoutProps {
  children: ReactNode
}

type PortalRole = 'OWNER' | 'CLIENT' | 'SALES' | 'DEV'

export default function PortalLayout({ children }: PortalLayoutProps) {
  const router = useRouter()
  const [role, setRole] = useState<PortalRole | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/portal/profile')
        if (res.ok) {
          const data = await res.json()
          setRole(data?.role ?? null)
        }
      } catch {
        // ignore
      }
    }
    fetchProfile()
  }, [])

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/auth/signin')
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-card border-r border-border shadow-sm">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">Client Dashboard</p>
          </div>
          <ThemeToggle />
        </div>

        <nav className="mt-8 px-4 space-y-2">
          <NavLink href="/portal" icon={<Home size={20} />} label="Dashboard" />
          {(role === 'SALES' || role === 'DEV') && (
            <NavLink href="/portal/assigned-clients" icon={<Users size={20} />} label="Assigned Clients" />
          )}
          <NavLink href="/portal/projects" icon={<Milestone size={20} />} label="Projects" />
          <NavLink href="/portal/invoices" icon={<FileText size={20} />} label="Invoices" />
          <NavLink href="/portal/payments" icon={<CreditCard size={20} />} label="Payments" />
          <NavLink href="/portal/subscriptions" icon={<Repeat size={20} />} label="Subscriptions" />
          <NavLink href="/portal/bookings" icon={<Calendar size={20} />} label={role === 'SALES' || role === 'DEV' ? 'My Bookings' : 'Bookings'} />
          <NavLink href="/portal/deliverables" icon={<Package size={20} />} label="Deliverables" />
          <NavLink href="/portal/contracts" icon={<FileText size={20} />} label="Contracts" />
          <NavLink href="/portal/milestones" icon={<Milestone size={20} />} label="Milestones" />
          <NavLink href="/portal/chat-history" icon={<MessageSquare size={20} />} label="Chat History" />
          <NavLink href="/portal/chat-analytics" icon={<BarChart3 size={20} />} label="Chat Analytics" />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          <NavLink href="/portal/profile" icon={<User size={20} />} label="Profile" />
          <Button
            variant="ghost"
            className="w-full mt-2 justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link href={href}>
      <Button variant="ghost" className="w-full justify-start">
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  )
}

