import crypto from 'crypto';

/**
 * Verify Cal.com webhook signature using HMAC SHA-256
 * @param payload - Raw request body as string
 * @param signature - Signature from x-cal-signature header
 * @returns true if signature is valid
 */
export function verifyCalcomWebhook(payload: string, signature: string): boolean {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  
  if (!secret) {
    console.error('CALCOM_WEBHOOK_SECRET not configured');
    return false;
  }

  try {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}

/**
 * Parse Cal.com webhook payload
 */
export interface CalcomWebhookPayload {
  triggerEvent: 'BOOKING_CREATED' | 'BOOKING_RESCHEDULED' | 'BOOKING_CANCELLED';
  createdAt: string;
  payload: {
    uid: string;
    eventTitle: string;
    eventDescription?: string;
    startTime: string;
    endTime: string;
    attendees: Array<{
      email: string;
      name?: string;
    }>;
    organizer?: {
      email: string;
      name?: string;
    };
    metadata?: Record<string, any>;
  };
}

/**
 * Validate and parse Cal.com webhook payload
 */
export function parseCalcomPayload(data: unknown): CalcomWebhookPayload | null {
  try {
    const payload = data as CalcomWebhookPayload;
    
    if (!payload.triggerEvent || !payload.payload) {
      console.error('Invalid Cal.com payload structure');
      return null;
    }

    if (!['BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED'].includes(payload.triggerEvent)) {
      console.error('Unknown trigger event:', payload.triggerEvent);
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error parsing Cal.com payload:', error);
    return null;
  }
}

/**
 * Extract booking details from Cal.com payload
 */
export function extractBookingDetails(payload: CalcomWebhookPayload) {
  const { payload: data } = payload;
  const attendee = data.attendees?.[0];

  return {
    externalId: data.uid,
    title: data.eventTitle,
    description: data.eventDescription,
    startsAt: new Date(data.startTime),
    endsAt: new Date(data.endTime),
    attendeeEmail: attendee?.email || '',
    attendeeName: attendee?.name,
    organizerEmail: data.organizer?.email,
    organizerName: data.organizer?.name,
    metadata: data.metadata
  };
}

