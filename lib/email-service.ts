import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface BookingEmailData {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  attendeeEmail: string;
  attendeeName?: string;
  organizerName?: string;
  description?: string;
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(booking: BookingEmailData) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'bookings@yourdomain.com',
      to: booking.attendeeEmail,
      subject: `Booking Confirmed: ${booking.title}`,
      html: generateConfirmationHtml(booking),
      tags: [
        { name: 'category', value: 'booking_confirmation' },
        { name: 'booking_id', value: booking.id }
      ]
    });

    if (result.error) {
      throw new Error(`Failed to send confirmation email: ${result.error.message}`);
    }

    console.log(`Confirmation email sent to ${booking.attendeeEmail}`, result.data);
    return result.data;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}

/**
 * Send booking reminder email (24 hours before)
 */
export async function sendBookingReminder24h(booking: BookingEmailData) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'bookings@yourdomain.com',
      to: booking.attendeeEmail,
      subject: `Reminder: ${booking.title} tomorrow at ${formatTime(booking.startsAt)}`,
      html: generateReminderHtml(booking, '24h'),
      tags: [
        { name: 'category', value: 'booking_reminder_24h' },
        { name: 'booking_id', value: booking.id }
      ]
    });

    if (result.error) {
      throw new Error(`Failed to send reminder email: ${result.error.message}`);
    }

    console.log(`24h reminder email sent to ${booking.attendeeEmail}`);
    return result.data;
  } catch (error) {
    console.error('Error sending 24h reminder email:', error);
    throw error;
  }
}

/**
 * Send booking reminder email (1 hour before)
 */
export async function sendBookingReminder1h(booking: BookingEmailData) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'bookings@yourdomain.com',
      to: booking.attendeeEmail,
      subject: `Reminder: ${booking.title} in 1 hour`,
      html: generateReminderHtml(booking, '1h'),
      tags: [
        { name: 'category', value: 'booking_reminder_1h' },
        { name: 'booking_id', value: booking.id }
      ]
    });

    if (result.error) {
      throw new Error(`Failed to send reminder email: ${result.error.message}`);
    }

    console.log(`1h reminder email sent to ${booking.attendeeEmail}`);
    return result.data;
  } catch (error) {
    console.error('Error sending 1h reminder email:', error);
    throw error;
  }
}

/**
 * Send booking cancellation email
 */
export async function sendBookingCancellation(booking: BookingEmailData) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'bookings@yourdomain.com',
      to: booking.attendeeEmail,
      subject: `Booking Cancelled: ${booking.title}`,
      html: generateCancellationHtml(booking),
      tags: [
        { name: 'category', value: 'booking_cancellation' },
        { name: 'booking_id', value: booking.id }
      ]
    });

    if (result.error) {
      throw new Error(`Failed to send cancellation email: ${result.error.message}`);
    }

    console.log(`Cancellation email sent to ${booking.attendeeEmail}`);
    return result.data;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    throw error;
  }
}

// Helper functions for HTML generation
function formatTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function generateConfirmationHtml(booking: BookingEmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Booking Confirmed!</h2>
      <p>Hi ${booking.attendeeName || 'there'},</p>
      <p>Your booking has been confirmed.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>${booking.title}</strong></p>
        <p>📅 ${formatTime(booking.startsAt)}</p>
        <p>⏱️ Duration: ${Math.round((booking.endsAt.getTime() - booking.startsAt.getTime()) / 60000)} minutes</p>
        ${booking.description ? `<p>${booking.description}</p>` : ''}
      </div>
      <p>Looking forward to speaking with you!</p>
    </div>
  `;
}

function generateReminderHtml(booking: BookingEmailData, timeframe: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Upcoming Booking Reminder</h2>
      <p>Hi ${booking.attendeeName || 'there'},</p>
      <p>This is a reminder about your upcoming booking ${timeframe === '24h' ? 'tomorrow' : 'in 1 hour'}.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>${booking.title}</strong></p>
        <p>📅 ${formatTime(booking.startsAt)}</p>
      </div>
      <p>See you soon!</p>
    </div>
  `;
}

function generateCancellationHtml(booking: BookingEmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Booking Cancelled</h2>
      <p>Hi ${booking.attendeeName || 'there'},</p>
      <p>Your booking has been cancelled.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>${booking.title}</strong></p>
        <p>📅 ${formatTime(booking.startsAt)}</p>
      </div>
      <p>If you'd like to reschedule, please book another time.</p>
    </div>
  `;
}

/**
 * Send client invitation email
 */
export async function sendInvitationEmail(
  clientEmail: string,
  invitationUrl: string,
  adminName: string
) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: clientEmail,
      subject: 'You\'ve been invited to the Client Portal',
      html: generateInvitationHtml(invitationUrl, adminName),
      tags: [
        { name: 'category', value: 'client_invitation' },
      ]
    });

    if (result.error) {
      throw new Error(`Failed to send invitation email: ${result.error.message}`);
    }

    console.log(`Invitation email sent to ${clientEmail}`, result.data);
    return result.data;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
}

/**
 * Generate invitation email HTML
 */
function generateInvitationHtml(invitationUrl: string, adminName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Your Client Portal</h1>
      </div>

      <div style="background: #f9f9f9; padding: 40px 20px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>

        <p style="font-size: 16px; margin-bottom: 20px;">
          ${adminName} has invited you to join the Client Portal. Here you can:
        </p>

        <ul style="font-size: 16px; margin-bottom: 30px; padding-left: 20px;">
          <li>View and pay your invoices</li>
          <li>Access your contracts and deliverables</li>
          <li>See your upcoming appointments</li>
          <li>Track project milestones</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            Accept Invitation
          </a>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 30px; margin-bottom: 10px;">
          Or copy and paste this link in your browser:
        </p>
        <p style="font-size: 12px; color: #999; word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px;">
          ${invitationUrl}
        </p>

        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          This invitation link will expire in 7 days.
        </p>

        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          If you have any questions, please reach out to ${adminName}.
        </p>
      </div>

      <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
        <p>© ${new Date().getFullYear()} PajamasWeb. All rights reserved.</p>
      </div>
    </div>
  `;
}

