import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAllBlogPosts, getAllCaseStudies } from '@/lib/content'
import { createServerSupabaseClient } from '@/lib/auth-service'

export default async function AdminDashboard() {
  const blogPosts = await getAllBlogPosts()
  const caseStudies = await getAllCaseStudies()

  // Get client statistics
  let totalClients = 0
  let activeClients = 0
  let pendingClients = 0

  try {
    const supabase = createServerSupabaseClient()

    // Get total clients
    const { count: total } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'CLIENT')

    totalClients = total || 0

    // Get active clients
    const { count: active } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'CLIENT')
      .not('invitation_accepted_at', 'is', null)

    activeClients = active || 0
    pendingClients = totalClients - activeClients
  } catch (error) {
    console.error('Error fetching client stats:', error)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to the Content Management System</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">All clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground mt-1">Accepted invitations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingClients}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting acceptance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{blogPosts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total published posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Management</CardTitle>
            <CardDescription>Manage client invitations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Link href="/admin/clients">
                <Button className="w-full" variant="outline">
                  View All Clients
                </Button>
              </Link>
              <Link href="/admin/clients/invite">
                <Button className="w-full" variant="outline">
                  Invite New Client
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Manage your content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Link href="/admin/images">
                <Button className="w-full" variant="outline">
                  Upload Hero Image
                </Button>
              </Link>
              <Link href="/admin/blog">
                <Button className="w-full" variant="outline">
                  Manage Blog Posts
                </Button>
              </Link>
              <Link href="/admin/case-studies">
                <Button className="w-full" variant="outline">
                  Manage Case Studies
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

