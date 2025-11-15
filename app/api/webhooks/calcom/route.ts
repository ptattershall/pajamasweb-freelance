import { NextRequest, NextResponse } from 'next/server';
import { verifyCalcomWebhook, parseCalcomPayload, extractBookingDetails } from '@/lib/webhook-utils';
import {
  createBooking,
  updateBooking,
  cancelBooking,
  getBookingByExternalId
} from '@/lib/booking-service';
import {
  sendBookingConfirmation,
  sendBookingCancellation
} from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-cal-signature');

    // Verify webhook signature
    if (!signature || !verifyCalcomWebhook(rawBody, signature)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload = JSON.parse(rawBody);
    const calcomPayload = parseCalcomPayload(payload);

    if (!calcomPayload) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Extract booking details
    const bookingDetails = extractBookingDetails(calcomPayload);

    // Get user ID from metadata or use a default
    // In production, you'd want to map Cal.com user to your app user
    const userId = payload.payload?.metadata?.userId || 'system';

    switch (calcomPayload.triggerEvent) {
      case 'BOOKING_CREATED': {
        // Check if booking already exists
        const existing = await getBookingByExternalId(bookingDetails.externalId);
        if (existing) {
          console.log('Booking already exists:', bookingDetails.externalId);
          return NextResponse.json({ success: true });
        }

        // Create booking
        const booking = await createBooking({
          clientId: userId,
          title: bookingDetails.title,
          description: bookingDetails.description,
          startsAt: bookingDetails.startsAt,
          endsAt: bookingDetails.endsAt,
          externalId: bookingDetails.externalId,
          attendeeEmail: bookingDetails.attendeeEmail,
          attendeeName: bookingDetails.attendeeName,
          status: 'confirmed'
        });

        // Send confirmation email
        try {
          await sendBookingConfirmation({
            id: booking.id,
            title: booking.title,
            startsAt: new Date(booking.starts_at),
            endsAt: new Date(booking.ends_at),
            attendeeEmail: booking.attendee_email,
            attendeeName: booking.attendee_name || undefined,
            organizerName: bookingDetails.organizerName,
            description: booking.description || undefined
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }

        console.log('Booking created:', booking.id);
        return NextResponse.json({ success: true, bookingId: booking.id });
      }

      case 'BOOKING_RESCHEDULED': {
        // Update booking
        const updated = await updateBooking(
          bookingDetails.externalId,
          {
            title: bookingDetails.title,
            startsAt: bookingDetails.startsAt,
            endsAt: bookingDetails.endsAt
          }
        );

        console.log('Booking rescheduled:', updated.id);
        return NextResponse.json({ success: true, bookingId: updated.id });
      }

      case 'BOOKING_CANCELLED': {
        // Cancel booking
        const cancelled = await cancelBooking(bookingDetails.externalId);

        // Send cancellation email
        try {
          await sendBookingCancellation({
            id: cancelled.id,
            title: cancelled.title,
            startsAt: new Date(cancelled.starts_at),
            endsAt: new Date(cancelled.ends_at),
            attendeeEmail: cancelled.attendee_email,
            attendeeName: cancelled.attendee_name || undefined,
            description: cancelled.description || undefined
          });
        } catch (emailError) {
          console.error('Failed to send cancellation email:', emailError);
        }

        console.log('Booking cancelled:', cancelled.id);
        return NextResponse.json({ success: true, bookingId: cancelled.id });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

