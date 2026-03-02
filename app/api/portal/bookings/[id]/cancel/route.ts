import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getProfileForRequest } from '@/lib/auth-service'

/**
 * Cancel a booking. CLIENT: own booking; SALES/DEV: assigned booking; OWNER: any.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, profile, error: authError } = await getProfileForRequest(request)

    if (authError || !user || !profile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    let query = supabase.from('bookings').select('*').eq('id', id)
    if (profile.role === 'CLIENT') {
      query = query.eq('client_id', user.id)
    } else if (profile.role === 'SALES' || profile.role === 'DEV') {
      query = query.eq('assigned_user_id', user.id)
    }
    const { data: booking, error: fetchError } = await query.single()

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      )
    }

    // Check if booking is in the past
    if (new Date(booking.starts_at) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot cancel past bookings' },
        { status: 400 }
      )
    }

    // Update booking status to cancelled
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error cancelling booking:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      )
    }

    // Log to booking history
    await supabase.from('booking_history').insert({
      booking_id: booking.id,
      action: 'cancelled',
      old_data: booking,
      new_data: updatedBooking,
    })

    // TODO: Optionally cancel the booking in Cal.com via API
    // This would require the Cal.com API key and booking external_id
    // const calcomResponse = await fetch(`https://api.cal.com/v1/bookings/${booking.external_id}/cancel`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.CALCOM_API_KEY}`,
    //   },
    // })

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    })
  } catch (error) {
    console.error('Error in cancel booking route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

