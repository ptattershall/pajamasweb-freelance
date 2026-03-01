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
 * Payment confirmation email data
 */
export interface PaymentEmailData {
  paymentIntentId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  serviceName?: string;
  description?: string;
  createdAt: Date;
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(payment: PaymentEmailData) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'payments@yourdomain.com',
      to: payment.customerEmail,
      subject: `Payment Confirmation - ${formatCurrencyForEmail(payment.amount, payment.currency)}`,
      html: generatePaymentConfirmationHtml(payment),
      tags: [
        { name: 'category', value: 'payment_confirmation' },
        { name: 'payment_intent_id', value: payment.paymentIntentId }
      ]
    });

    if (result.error) {
      throw new Error(`Failed to send payment confirmation email: ${result.error.message}`);
    }

    console.log(`Payment confirmation email sent to ${payment.customerEmail}`, result.data);
    return result.data;
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
}

/**
 * Send payment failed notification email
 */
export async function sendPaymentFailedNotification(payment: PaymentEmailData, errorMessage?: string) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'payments@yourdomain.com',
      to: payment.customerEmail,
      subject: 'Payment Failed - Action Required',
      html: generatePaymentFailedHtml(payment, errorMessage),
      tags: [
        { name: 'category', value: 'payment_failed' },
        { name: 'payment_intent_id', value: payment.paymentIntentId }
      ]
    });

    if (result.error) {
      throw new Error(`Failed to send payment failed email: ${result.error.message}`);
    }

    console.log(`Payment failed email sent to ${payment.customerEmail}`, result.data);
    return result.data;
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    throw error;
  }
}

/**
 * Format currency for email display
 */
function formatCurrencyForEmail(cents: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

/**
 * Generate payment confirmation email HTML
 */
function generatePaymentConfirmationHtml(payment: PaymentEmailData): string {
  const formattedAmount = formatCurrencyForEmail(payment.amount, payment.currency);
  const formattedDate = payment.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <div style="background: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px;">✓</span>
        </div>
        <h1 style="color: white; margin: 0; font-size: 28px;">Payment Successful!</h1>
      </div>

      <div style="background: #f9f9f9; padding: 40px 20px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi ${payment.customerName || 'there'},</p>

        <p style="font-size: 16px; margin-bottom: 30px;">
          Thank you for your payment! We've successfully processed your transaction.
        </p>

        <div style="background: white; border-radius: 8px; padding: 24px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 16px; font-size: 16px; color: #374151;">Payment Details</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Amount</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: bold; font-size: 18px; color: #111827;">${formattedAmount}</td>
            </tr>
            ${payment.serviceName ? `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Service</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; color: #111827;">${payment.serviceName}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Date</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; color: #111827;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #6b7280;">Reference</td>
              <td style="padding: 12px 0; text-align: right; font-family: monospace; font-size: 12px; color: #6b7280;">${payment.paymentIntentId}</td>
            </tr>
          </table>
        </div>

        ${payment.description ? `
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 30px;">
          <strong>Description:</strong> ${payment.description}
        </p>
        ` : ''}

        <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
          If you have any questions about this payment, please don't hesitate to reach out to us.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_URL || 'https://yourdomain.com'}/services" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">
            View Services
          </a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
        <p>This is an automated receipt for your payment.</p>
        <p style="margin-top: 8px;">© ${new Date().getFullYear()} PajamasWeb. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Generate payment failed email HTML
 */
function generatePaymentFailedHtml(payment: PaymentEmailData, errorMessage?: string): string {
  const formattedAmount = formatCurrencyForEmail(payment.amount, payment.currency);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <div style="background: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px;">✕</span>
        </div>
        <h1 style="color: white; margin: 0; font-size: 28px;">Payment Failed</h1>
      </div>

      <div style="background: #f9f9f9; padding: 40px 20px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi ${payment.customerName || 'there'},</p>

        <p style="font-size: 16px; margin-bottom: 30px;">
          Unfortunately, we were unable to process your payment of <strong>${formattedAmount}</strong>${payment.serviceName ? ` for ${payment.serviceName}` : ''}.
        </p>

        ${errorMessage ? `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 30px;">
          <p style="margin: 0; color: #991b1b; font-size: 14px;">
            <strong>Reason:</strong> ${errorMessage}
          </p>
        </div>
        ` : ''}

        <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
          Please try again with a different payment method, or contact your bank if the issue persists.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_URL || 'https://yourdomain.com'}/services" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">
            Try Again
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
          Need help? <a href="mailto:support@pajamasweb.com" style="color: #3b82f6;">Contact Support</a>
        </p>
      </div>

      <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
        <p>© ${new Date().getFullYear()} PajamasWeb. All rights reserved.</p>
      </div>
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

/**
 * Invoice email data (for sending new invoice or payment reminder)
 */
export interface InvoiceEmailData {
  customerEmail: string;
  customerName?: string;
  amountCents: number;
  currency: string;
  description?: string;
  dueDate?: Date;
  hostedInvoiceUrl: string;
  invoicePdf?: string;
}

/**
 * Send invoice email with link to pay
 */
export async function sendInvoiceEmail(data: InvoiceEmailData) {
  try {
    const formattedAmount = formatCurrencyForEmail(data.amountCents, data.currency);
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'invoices@yourdomain.com',
      to: data.customerEmail,
      subject: `Invoice from PajamasWeb – ${formattedAmount}`,
      html: generateInvoiceEmailHtml(data),
      tags: [
        { name: 'category', value: 'invoice_sent' },
      ]
    });

    if (result.error) {
      throw new Error(`Failed to send invoice email: ${result.error.message}`);
    }

    console.log(`Invoice email sent to ${data.customerEmail}`, result.data);
    return result.data;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
}

/**
 * Send payment reminder for an open/overdue invoice
 */
export async function sendInvoicePaymentReminder(data: InvoiceEmailData & { isOverdue?: boolean }) {
  try {
    const formattedAmount = formatCurrencyForEmail(data.amountCents, data.currency);
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'invoices@yourdomain.com',
      to: data.customerEmail,
      subject: data.isOverdue
        ? `Reminder: Overdue invoice – ${formattedAmount}`
        : `Reminder: Invoice due – ${formattedAmount}`,
      html: generateInvoiceReminderHtml(data),
      tags: [
        { name: 'category', value: 'invoice_reminder' },
      ]
    });

    if (result.error) {
      throw new Error(`Failed to send invoice reminder: ${result.error.message}`);
    }

    console.log(`Invoice reminder sent to ${data.customerEmail}`, result.data);
    return result.data;
  } catch (error) {
    console.error('Error sending invoice reminder:', error);
    throw error;
  }
}

function generateInvoiceEmailHtml(data: InvoiceEmailData): string {
  const formattedAmount = formatCurrencyForEmail(data.amountCents, data.currency);
  const dueStr = data.dueDate
    ? data.dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'See invoice';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Invoice</h1>
      </div>

      <div style="background: #f9f9f9; padding: 40px 20px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.customerName || 'there'},</p>

        <p style="font-size: 16px; margin-bottom: 20px;">
          You have a new invoice for <strong>${formattedAmount}</strong>${data.description ? ` – ${data.description}` : ''}.
        </p>

        <p style="font-size: 14px; color: #666; margin-bottom: 24px;">
          Due date: ${dueStr}
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.hostedInvoiceUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            View &amp; Pay Invoice
          </a>
        </div>

        ${data.invoicePdf ? `
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          <a href="${data.invoicePdf}" style="color: #3b82f6;">Download PDF</a>
        </p>
        ` : ''}

        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          If you have any questions, please reply to this email.
        </p>
      </div>

      <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
        <p>© ${new Date().getFullYear()} PajamasWeb. All rights reserved.</p>
      </div>
    </div>
  `;
}

function generateInvoiceReminderHtml(data: InvoiceEmailData & { isOverdue?: boolean }): string {
  const formattedAmount = formatCurrencyForEmail(data.amountCents, data.currency);
  const dueStr = data.dueDate
    ? data.dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'See invoice';
  const message = data.isOverdue
    ? `This invoice was due on ${dueStr} and is now overdue.`
    : `This is a friendly reminder that your invoice for ${formattedAmount} is due on ${dueStr}.`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${data.isOverdue ? 'Overdue Invoice Reminder' : 'Invoice Reminder'}</h1>
      </div>

      <div style="background: #f9f9f9; padding: 40px 20px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.customerName || 'there'},</p>

        <p style="font-size: 16px; margin-bottom: 20px;">${message}</p>

        <p style="font-size: 16px; margin-bottom: 24px;">
          Amount: <strong>${formattedAmount}</strong>${data.description ? ` – ${data.description}` : ''}
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.hostedInvoiceUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            Pay Invoice
          </a>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          If you've already paid, please disregard this reminder.
        </p>
      </div>

      <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
        <p>© ${new Date().getFullYear()} PajamasWeb. All rights reserved.</p>
      </div>
    </div>
  `;
}

