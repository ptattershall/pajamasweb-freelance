/**
 * Admin Contact Message Detail / Triage API
 *
 * GET    /api/admin/contact-messages/[id]
 * PATCH  /api/admin/contact-messages/[id]   { status?, admin_notes? }
 * DELETE /api/admin/contact-messages/[id]
 */

import { NextRequest, NextResponse } from 'next/server'

import { requireOwner, createServerSupabaseClient } from '@/lib/auth-service'
import { updateContactMessageSchema } from '@/lib/validation-schemas'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const { id } = await params
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unhandled error in GET /api/admin/contact-messages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error
    const { user } = auth

    const { id } = await params

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const validation = updateContactMessageSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { status, admin_notes } = validation.data
    const updates: Record<string, unknown> = {}
    const now = new Date().toISOString()

    if (status !== undefined) {
      updates.status = status
      if (status === 'read') {
        updates.read_at = now
      }
      if (status === 'replied') {
        updates.replied_at = now
        updates.replied_by = user.id
      }
    }

    if (admin_notes !== undefined) {
      updates.admin_notes = admin_notes
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('contact_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      console.error('Error updating contact message:', error)
      return NextResponse.json(
        { error: 'Failed to update message' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unhandled error in PATCH /api/admin/contact-messages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireOwner(request)
    if (!auth.ok) return auth.error

    const { id } = await params
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting contact message:', error)
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unhandled error in DELETE /api/admin/contact-messages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
