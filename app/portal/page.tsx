/**
 * Client Portal Dashboard
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Calendar, Package, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface DashboardStats {
  invoices_due: number
  upcoming_meetings: number
  pending_deliverables: number
  active_milestones: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/portal/dashboard')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to Your Portal</h1>
        <p className="text-muted-foreground">Manage your projects, invoices, and bookings in one place</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FileText size={24} />}
          label="Invoices Due"
          value={stats?.invoices_due ?? 0}
          href="/portal/invoices"
        />
        <StatCard
          icon={<Calendar size={24} />}
          label="Upcoming Meetings"
          value={stats?.upcoming_meetings ?? 0}
          href="/portal/bookings"
        />
        <StatCard
          icon={<Package size={24} />}
          label="Pending Deliverables"
          value={stats?.pending_deliverables ?? 0}
          href="/portal/deliverables"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Active Milestones"
          value={stats?.active_milestones ?? 0}
          href="/portal/milestones"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Invoice #001</p>
                <p className="text-sm text-muted-foreground">Due in 5 days</p>
              </div>
              <Badge variant="secondary">Pending</Badge>
            </div>
            <Link href="/portal/invoices">
              <Button variant="link" className="p-0 h-auto">
                View all invoices →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/portal/invoices">
              <Button variant="outline" className="w-full justify-start">
                View Invoices
              </Button>
            </Link>
            <Link href="/portal/bookings">
              <Button variant="outline" className="w-full justify-start">
                Schedule Meeting
              </Button>
            </Link>
            <Link href="/portal/deliverables">
              <Button variant="outline" className="w-full justify-start">
                Download Files
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Alert className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium">Need help?</p>
          <p className="text-sm">
            Check out our documentation or contact support for assistance.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: number
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">{label}</p>
              <p className="text-3xl font-bold mt-2">{value}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-primary">{icon}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

