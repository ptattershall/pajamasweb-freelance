#!/usr/bin/env node

/**
 * Test Cal.com webhook locally
 * Usage: node scripts/test-webhook.js
 */

const crypto = require('crypto');

// Get secret from environment
const secret = process.env.CALCOM_WEBHOOK_SECRET;

if (!secret) {
  console.error('❌ CALCOM_WEBHOOK_SECRET not set in environment');
  process.exit(1);
}

console.log('🧪 Testing Cal.com Webhook\n');
console.log(`✓ Secret loaded: ${secret.substring(0, 10)}...`);

// Create a test payload
const testPayload = {
  triggerEvent: 'BOOKING_CREATED',
  createdAt: new Date().toISOString(),
  payload: {
    uid: 'test-booking-123',
    eventTitle: 'Test Meeting',
    eventDescription: 'This is a test booking',
    startTime: new Date(Date.now() + 3600000).toISOString(),
    endTime: new Date(Date.now() + 5400000).toISOString(),
    attendees: [
      {
        email: 'test@example.com',
        name: 'Test User'
      }
    ],
    organizer: {
      email: 'organizer@example.com',
      name: 'Test Organizer'
    }
  }
};

const payloadString = JSON.stringify(testPayload);

// Generate signature
const signature = crypto
  .createHmac('sha256', secret)
  .update(payloadString)
  .digest('hex');

console.log('\n📦 Test Payload:');
console.log(JSON.stringify(testPayload, null, 2));

console.log('\n🔐 Generated Signature:');
console.log(signature);

// Test the webhook
console.log('\n🚀 Sending test webhook to http://localhost:3000/api/webhooks/calcom\n');

fetch('http://localhost:3000/api/webhooks/calcom', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-cal-signature': signature
  },
  body: payloadString
})
  .then(res => {
    console.log(`✓ Response Status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log('✓ Response Body:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ Webhook test PASSED!');
      console.log('The webhook handler is working correctly.');
    } else {
      console.log('\n⚠️  Webhook returned error:', data.error);
    }
  })
  .catch(error => {
    console.error('❌ Webhook test FAILED!');
    console.error('Error:', error.message);
    console.error('\nMake sure:');
    console.error('1. Dev server is running (npm run dev)');
    console.error('2. CALCOM_WEBHOOK_SECRET is set in .env.local');
    console.error('3. Database migration has been run');
    process.exit(1);
  });

