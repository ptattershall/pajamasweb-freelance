# Phase 4: Client Portal Features - API Reference

**Status**: ✅ COMPLETE  
**Last Updated**: 2025-11-14  

## 📋 API Endpoints Overview

All endpoints require authentication via session cookie (`auth-token`).

### Invoice Endpoints

#### GET /api/portal/invoices
List all invoices for authenticated client with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status (all, open, paid, draft, overdue)

**Response:**
```json
[
  {
    "id": "uuid",
    "amount_cents": 50000,
    "currency": "USD",
    "status": "open",
    "due_date": "2025-12-14T00:00:00Z",
    "paid_at": null,
    "hosted_invoice_url": "https://invoice.stripe.com/...",
    "invoice_pdf": "https://pdf.stripe.com/...",
    "created_at": "2025-11-14T00:00:00Z"
  }
]
```

#### GET /api/portal/invoices/[id]
Get detailed invoice with payment history.

**Response:**
```json
{
  "id": "uuid",
  "amount_cents": 50000,
  "currency": "USD",
  "status": "open",
  "due_date": "2025-12-14T00:00:00Z",
  "paid_at": null,
  "hosted_invoice_url": "https://invoice.stripe.com/...",
  "invoice_pdf": "https://pdf.stripe.com/...",
  "created_at": "2025-11-14T00:00:00Z",
  "payment_history": [
    {
      "id": "ch_123",
      "amount": 50000,
      "currency": "USD",
      "status": "succeeded",
      "created": 1731552000,
      "receipt_url": "https://receipt.stripe.com/..."
    }
  ],
  "stripe_details": {
    "number": "INV-001",
    "customer_email": "client@example.com",
    "subtotal": 50000,
    "tax": 0,
    "total": 50000,
    "lines": [
      {
        "description": "Web Development Services",
        "amount": 50000,
        "quantity": 1
      }
    ]
  }
}
```

### Contract Endpoints

#### GET /api/portal/contracts
List all contracts for authenticated client.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Service Agreement",
    "file_url": "contracts/file.pdf",
    "file_type": "pdf",
    "file_size": 102400,
    "signed_at": "2025-11-01T00:00:00Z",
    "version": 1,
    "created_at": "2025-11-14T00:00:00Z"
  }
]
```

#### GET /api/portal/contracts/[id]/download
Generate signed URL for contract download.

**Response:**
```json
{
  "success": true,
  "signedUrl": "https://storage.supabase.co/...",
  "fileName": "Service Agreement",
  "fileType": "pdf",
  "fileSize": 102400,
  "signed": true
}
```

### Booking Endpoints

#### GET /api/portal/bookings
List bookings for authenticated client.

**Query Parameters:**
- `tab` (optional): Filter by tab (upcoming, past)

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Project Kickoff",
    "description": "Initial project meeting",
    "starts_at": "2025-12-01T10:00:00Z",
    "ends_at": "2025-12-01T11:00:00Z",
    "location": "Zoom",
    "meeting_link": "https://zoom.us/...",
    "status": "confirmed",
    "attendee_name": "John Doe",
    "attendee_email": "john@example.com",
    "created_at": "2025-11-14T00:00:00Z"
  }
]
```

#### GET /api/portal/bookings/[id]
Get booking details.

**Response:** Same as booking object above

#### GET /api/portal/bookings/[id]/ics
Download booking as ICS calendar file.

**Response:** ICS file (text/calendar)

#### POST /api/portal/bookings/[id]/cancel
Cancel a booking.

**Response:**
```json
{
  "success": true,
  "booking": { /* updated booking object */ }
}
```

### Deliverable Endpoints

#### GET /api/portal/deliverables
List all deliverables for authenticated client.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Website Design",
    "description": "Final website design files",
    "file_url": "deliverables/design.zip",
    "file_type": "zip",
    "file_size": 5242880,
    "delivered_at": "2025-11-14T00:00:00Z",
    "created_at": "2025-11-14T00:00:00Z"
  }
]
```

#### GET /api/portal/deliverables/[id]/download
Generate signed URL for deliverable download.

**Response:**
```json
{
  "success": true,
  "signedUrl": "https://storage.supabase.co/...",
  "fileName": "Website Design",
  "fileType": "zip",
  "fileSize": 5242880
}
```

### Dashboard Endpoint

#### GET /api/portal/dashboard
Get dashboard statistics.

**Response:**
```json
{
  "invoices_due": 2,
  "upcoming_meetings": 3,
  "pending_deliverables": 1,
  "active_milestones": 4
}
```

## 🔐 Security

- All endpoints require authentication
- Clients can only access their own data
- Signed URLs expire after 1 hour
- RLS policies enforce data isolation

## 📊 Status Codes

- `200` - Success
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

## 🧪 Testing

Use cURL to test endpoints:

```bash
# List invoices
curl -H "Cookie: auth-token=..." \
  https://yourapp.com/api/portal/invoices

# Get invoice detail
curl -H "Cookie: auth-token=..." \
  https://yourapp.com/api/portal/invoices/[id]

# Download contract
curl -H "Cookie: auth-token=..." \
  https://yourapp.com/api/portal/contracts/[id]/download

# List bookings
curl -H "Cookie: auth-token=..." \
  https://yourapp.com/api/portal/bookings

# Cancel booking
curl -X POST -H "Cookie: auth-token=..." \
  https://yourapp.com/api/portal/bookings/[id]/cancel

# List deliverables
curl -H "Cookie: auth-token=..." \
  https://yourapp.com/api/portal/deliverables

# Download deliverable
curl -H "Cookie: auth-token=..." \
  https://yourapp.com/api/portal/deliverables/[id]/download

# Get dashboard stats
curl -H "Cookie: auth-token=..." \
  https://yourapp.com/api/portal/dashboard
```

## 📝 Notes

- All timestamps are in ISO 8601 format
- All amounts are in currency minor units (cents)
- Signed URLs are valid for 1 hour
- File downloads use Supabase Storage signed URLs

