/**
 * Project Overview API Route
 */

import { getAuthenticatedUser, createServerSupabaseClient } from '@/lib/auth-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Fetch all project data
    const [milestonesRes, deliverableRes, contractsRes] = await Promise.all([
      supabase
        .from('project_milestones')
        .select('*')
        .eq('client_id', user.id)
        .order('due_date', { ascending: true, nullsFirst: false }),
      supabase
        .from('deliverables')
        .select('*')
        .eq('client_id', user.id)
        .order('delivered_at', { ascending: false }),
      supabase
        .from('contracts')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    // Calculate statistics
    const milestones = milestonesRes.data || []
    const deliverables = deliverableRes.data || []
    const contracts = contractsRes.data || []

    const stats = {
      total_milestones: milestones.length,
      completed_milestones: milestones.filter((m) => m.status === 'completed').length,
      in_progress_milestones: milestones.filter((m) => m.status === 'in_progress').length,
      blocked_milestones: milestones.filter((m) => m.status === 'blocked').length,
      total_deliverables: deliverables.length,
      total_contracts: contracts.length,
      signed_contracts: contracts.filter((c) => c.signed_at).length,
      average_progress: milestones.length > 0 
        ? Math.round(milestones.reduce((sum, m) => sum + m.progress_percent, 0) / milestones.length)
        : 0,
    }

    return NextResponse.json({
      stats,
      milestones,
      deliverables,
      contracts,
    })
  } catch (error) {
    console.error('Error fetching project overview:', error)
    return NextResponse.json({ error: 'Failed to fetch project overview' }, { status: 500 })
  }
}

