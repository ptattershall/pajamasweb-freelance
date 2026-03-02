/**
 * Admin Rotation Assign API
 * POST: assign a client to the next member in rotation (SALES or DEV).
 * Body: { clientId, roleType: 'SALES' | 'DEV' }
 * Only OWNER. Use this when a new lead is created and should be auto-assigned.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOwner } from '@/lib/auth-service'
import { assignClientToSales, assignClientToDev } from '@/lib/rotation-service'

const assignBodySchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  roleType: z.enum(['SALES', 'DEV']),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const body = await request.json()
    const validation = assignBodySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { clientId, roleType } = validation.data
    const result =
      roleType === 'SALES'
        ? await assignClientToSales(clientId)
        : await assignClientToDev(clientId)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      assignment: result.assignment,
    })
  } catch (error) {
    console.error('Admin rotation assign error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign' },
      { status: 500 }
    )
  }
}
