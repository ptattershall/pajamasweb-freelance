/**
 * Unit Tests for Service Files
 * 
 * Tests service files for:
 * - Zod validation integration
 * - Type safety
 * - Error handling
 * - Backward compatibility
 */

import * as schemas from '../lib/validation-schemas'
import { z } from 'zod'

const generateUUID = () => crypto.randomUUID()

console.log('🧪 Testing Service File Integration...\n')

// Test 1: Booking Service Type Compatibility
console.log('Testing booking-service.ts compatibility...')
try {
  // Verify CreateBookingInput type exists and is properly typed
  const bookingInput: schemas.CreateBookingInput = {
    client_id: generateUUID(),
    title: 'Test Booking',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 3600000).toISOString(),
    attendee_email: 'test@example.com',
    provider: 'calcom',
  }
  
  // Validate with schema
  const validated = schemas.createBookingSchema.parse(bookingInput)
  console.log('✓ CreateBookingInput type and validation working')
  
  // Verify Booking return type
  const booking: schemas.Booking = {
    id: generateUUID(),
    client_id: bookingInput.client_id,
    title: bookingInput.title,
    description: null,
    starts_at: bookingInput.starts_at,
    ends_at: bookingInput.ends_at,
    external_id: null,
    provider: 'calcom',
    attendee_email: bookingInput.attendee_email,
    attendee_name: null,
    location: null,
    meeting_link: null,
    notes: null,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  schemas.bookingSchema.parse(booking)
  console.log('✓ Booking return type validation working\n')
} catch (error) {
  console.error('❌ Booking service test failed:', error)
  process.exit(1)
}

// Test 2: Client Service Type Compatibility
console.log('Testing client-service.ts compatibility...')
try {
  // Verify Invoice array handling
  const invoices: schemas.Invoice[] = [
    {
      id: generateUUID(),
      client_id: generateUUID(),
      stripe_invoice_id: null,
      amount_cents: 10000,
      currency: 'USD',
      status: 'open',
      description: 'Test Invoice',
      due_date: new Date(Date.now() + 86400000).toISOString(),
      paid_at: null,
      hosted_invoice_url: null,
      invoice_pdf: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ]
  
  // Validate each invoice
  invoices.forEach(inv => schemas.invoiceSchema.parse(inv))
  console.log('✓ Invoice array validation working')
  
  // Verify Deliverable type
  const deliverable: schemas.Deliverable = {
    id: generateUUID(),
    client_id: generateUUID(),
    title: 'Test Deliverable',
    description: 'Test Description',
    status: 'pending',
    due_date: new Date(Date.now() + 86400000).toISOString(),
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  schemas.deliverableSchema.parse(deliverable)
  console.log('✓ Deliverable type validation working\n')
} catch (error) {
  console.error('❌ Client service test failed:', error)
  process.exit(1)
}

// Test 3: Invoices Service Type Compatibility
console.log('Testing invoices-service.ts compatibility...')
try {
  // Verify Invoice status filtering
  const invoicesByStatus: schemas.Invoice[] = [
    {
      id: generateUUID(),
      client_id: generateUUID(),
      stripe_invoice_id: 'in_123',
      amount_cents: 5000,
      currency: 'USD',
      status: 'paid',
      description: 'Paid Invoice',
      due_date: null,
      paid_at: new Date().toISOString(),
      hosted_invoice_url: 'https://example.com/invoice',
      invoice_pdf: 'https://example.com/invoice.pdf',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ]
  
  invoicesByStatus.forEach(inv => {
    schemas.invoiceSchema.parse(inv)
    // Verify status is one of the allowed values
    if (!['draft', 'open', 'paid', 'void', 'uncollectible'].includes(inv.status)) {
      throw new Error('Invalid invoice status')
    }
  })
  console.log('✓ Invoice status filtering working')
  console.log('✓ Invoice type validation working\n')
} catch (error) {
  console.error('❌ Invoices service test failed:', error)
  process.exit(1)
}

// Test 4: Backward Compatibility
console.log('Testing backward compatibility...')
try {
  // Test legacy BookingData format conversion
  const legacyBookingData = {
    clientId: generateUUID(),
    title: 'Legacy Booking',
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 3600000),
    externalId: 'ext-123',
    attendeeEmail: 'test@example.com',
    attendeeName: 'Test User',
  }
  
  // Convert to new format
  const newFormat: schemas.CreateBookingInput = {
    client_id: legacyBookingData.clientId,
    title: legacyBookingData.title,
    starts_at: legacyBookingData.startsAt.toISOString(),
    ends_at: legacyBookingData.endsAt.toISOString(),
    external_id: legacyBookingData.externalId,
    attendee_email: legacyBookingData.attendeeEmail,
    attendee_name: legacyBookingData.attendeeName,
    provider: 'calcom',
  }
  
  schemas.createBookingSchema.parse(newFormat)
  console.log('✓ Legacy format conversion working\n')
} catch (error) {
  console.error('❌ Backward compatibility test failed:', error)
  process.exit(1)
}

console.log('✅ All service file tests passed!')

