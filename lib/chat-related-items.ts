/**
 * Chat Related Items Service
 * 
 * Detects and links related items (invoices, bookings, deliverables) mentioned in chat
 */

import { createServerSupabaseClient } from './supabase-server'

export interface RelatedItem {
  type: 'invoice' | 'booking' | 'deliverable'
  id: string
  title: string
  reference: string
}

/**
 * Detect related items mentioned in a chat message
 */
export async function detectRelatedItems(
  userId: string,
  messageContent: string
): Promise<RelatedItem[]> {
  const relatedItems: RelatedItem[] = []
  const supabase = createServerSupabaseClient()

  // Extract potential invoice references (invoice numbers, amounts, dates)
  const invoiceMatches = messageContent.match(/invoice\s*#?(\d+)|INV-(\d+)/gi)
  if (invoiceMatches) {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, number, amount, status')
      .eq('client_id', userId)
      .limit(5)

    if (invoices) {
      invoices.forEach((inv) => {
        if (messageContent.toLowerCase().includes(inv.number?.toLowerCase() || '')) {
          relatedItems.push({
            type: 'invoice',
            id: inv.id,
            title: `Invoice ${inv.number}`,
            reference: `$${(inv.amount / 100).toFixed(2)} - ${inv.status}`,
          })
        }
      })
    }
  }

  // Extract potential booking references (meeting, call, appointment, booking)
  const bookingKeywords = ['meeting', 'call', 'appointment', 'booking', 'scheduled']
  const hasBookingKeyword = bookingKeywords.some((kw) =>
    messageContent.toLowerCase().includes(kw)
  )

  if (hasBookingKeyword) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, title, starts_at, status')
      .eq('client_id', userId)
      .gte('starts_at', new Date().toISOString())
      .limit(3)

    if (bookings) {
      bookings.forEach((booking) => {
        relatedItems.push({
          type: 'booking',
          id: booking.id,
          title: booking.title,
          reference: new Date(booking.starts_at).toLocaleDateString(),
        })
      })
    }
  }

  // Extract potential deliverable references (file, deliverable, document, download)
  const deliverableKeywords = ['deliverable', 'file', 'document', 'download', 'attachment']
  const hasDeliverableKeyword = deliverableKeywords.some((kw) =>
    messageContent.toLowerCase().includes(kw)
  )

  if (hasDeliverableKeyword) {
    const { data: deliverables } = await supabase
      .from('deliverables')
      .select('id, title, delivered_at')
      .eq('client_id', userId)
      .limit(3)

    if (deliverables) {
      deliverables.forEach((deliv) => {
        relatedItems.push({
          type: 'deliverable',
          id: deliv.id,
          title: deliv.title,
          reference: new Date(deliv.delivered_at).toLocaleDateString(),
        })
      })
    }
  }

  return relatedItems
}

/**
 * Get related items for a specific chat message
 */
export async function getRelatedItemsForMessage(
  userId: string,
  messageId: string
): Promise<RelatedItem[]> {
  const supabase = createServerSupabaseClient()

  // Fetch the message content
  const { data: message } = await supabase
    .from('chat_messages')
    .select('content')
    .eq('id', messageId)
    .single()

  if (!message) {
    return []
  }

  return detectRelatedItems(userId, message.content)
}

