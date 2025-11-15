# Query Patterns Reference Guide

**Purpose**: Side-by-side comparison of old and new query patterns.

## Pattern 1: Fetch Single Record

### ❌ Old Pattern (Direct Supabase)
```typescript
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('id', bookingId)
  .single()

if (error) throw error
return data
```

### ✅ New Pattern (Query Helper + Zod)
```typescript
import { getBooking } from '@/lib/query-helpers'
import type { Booking } from '@/lib/validation-schemas'

const booking: Booking = await getBooking(bookingId)
return booking
```

**Benefits:**
- Type-safe return value
- Automatic Zod validation
- Cleaner error handling
- No manual parsing needed

---

## Pattern 2: Fetch Multiple Records

### ❌ Old Pattern
```typescript
const { data, error } = await supabase
  .from('invoices')
  .select('*')
  .eq('client_id', clientId)
  .order('created_at', { ascending: false })

if (error) throw error
return data
```

### ✅ New Pattern
```typescript
import { getClientInvoices } from '@/lib/query-helpers'
import type { Invoice } from '@/lib/validation-schemas'

const invoices: Invoice[] = await getClientInvoices(clientId)
return invoices
```

**Benefits:**
- Array type safety
- Automatic validation of each item
- Consistent ordering
- Cleaner code

---

## Pattern 3: Create Record

### ❌ Old Pattern
```typescript
const { data, error } = await supabase
  .from('bookings')
  .insert([{
    client_id: clientId,
    title: title,
    starts_at: startsAt,
    ends_at: endsAt,
    external_id: externalId,
    attendee_email: attendeeEmail,
  }])
  .select()
  .single()

if (error) throw error
return data
```

### ✅ New Pattern
```typescript
import { createBooking } from '@/lib/query-helpers'
import type { CreateBookingInput } from '@/lib/validation-schemas'

const input: CreateBookingInput = {
  client_id: clientId,
  title: title,
  starts_at: startsAt,
  ends_at: endsAt,
  external_id: externalId,
  attendee_email: attendeeEmail,
}

const booking = await createBooking(input)
return booking
```

**Benefits:**
- Input validation before insert
- Type-safe input object
- Automatic output validation
- Better error messages

---

## Pattern 4: Update Record

### ❌ Old Pattern
```typescript
const { data, error } = await supabase
  .from('invoices')
  .update({ status: 'paid', updated_at: new Date() })
  .eq('id', invoiceId)
  .select()
  .single()

if (error) throw error
return data
```

### ✅ New Pattern
```typescript
import { updateInvoice } from '@/lib/query-helpers'
import type { UpdateInvoiceInput } from '@/lib/validation-schemas'

const input: UpdateInvoiceInput = {
  status: 'paid',
  updated_at: new Date(),
}

const invoice = await updateInvoice(invoiceId, input)
return invoice
```

**Benefits:**
- Input validation
- Type-safe updates
- Automatic output validation
- Prevents invalid state changes

---

## Pattern 5: Conditional Query

### ❌ Old Pattern
```typescript
let query = supabase
  .from('bookings')
  .select('*')
  .eq('client_id', clientId)
  .eq('status', 'confirmed')

if (tab === 'upcoming') {
  query = query.gte('starts_at', now)
} else {
  query = query.lt('starts_at', now)
}

const { data, error } = await query.order('starts_at', { ascending: true })
```

### ✅ New Pattern
```typescript
import { getClientBookings } from '@/lib/query-helpers'

const bookings = await getClientBookings(clientId)

// Filter in application layer
const filtered = tab === 'upcoming'
  ? bookings.filter(b => new Date(b.starts_at) > now)
  : bookings.filter(b => new Date(b.starts_at) <= now)
```

**Benefits:**
- Simpler query logic
- Type-safe filtering
- Easier to test
- Better separation of concerns

---

## Pattern 6: Error Handling

### ❌ Old Pattern
```typescript
try {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error:', error.message)
    throw error
  }
  return data
} catch (err) {
  console.error('Unexpected error:', err)
  throw err
}
```

### ✅ New Pattern
```typescript
try {
  const booking = await getBooking(id)
  return booking
} catch (error) {
  console.error('Error fetching booking:', error)
  throw error
}
```

**Benefits:**
- Cleaner error handling
- Automatic validation errors
- Better error messages
- Less boilerplate

---

## Migration Priority

1. **High Priority** - API routes with direct queries
2. **Medium Priority** - Service files (mostly done)
3. **Low Priority** - Utility functions (can stay as-is)

## Key Differences

| Aspect | Old | New |
|--------|-----|-----|
| Type Safety | Manual | Automatic |
| Validation | Optional | Required |
| Error Handling | Verbose | Clean |
| Code Length | Longer | Shorter |
| Maintainability | Harder | Easier |
| Testing | Harder | Easier |

## When to Use Each Pattern

**Use Query Helpers When:**
- Fetching data for API responses
- Creating/updating records
- Need type safety
- Want automatic validation

**Use Direct Supabase When:**
- Complex queries not covered by helpers
- Need raw SQL
- Temporary debugging
- One-off operations

## Questions?

See:
- `lib/query-helpers.ts` - Implementation
- `lib/validation-schemas.ts` - Schemas
- `docs/ZOD_USAGE_EXAMPLES.md` - Examples

