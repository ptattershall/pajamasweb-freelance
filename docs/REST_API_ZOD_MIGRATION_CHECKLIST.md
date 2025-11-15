# REST API + Zod Migration Checklist

**Purpose**: Step-by-step guide for migrating API routes from direct Supabase queries to type-safe query helpers.

## Pre-Migration Checklist

- [ ] Review `lib/query-helpers.ts` for available functions
- [ ] Check `lib/validation-schemas.ts` for available schemas
- [ ] Understand the Zod validation pattern
- [ ] Have test data ready for verification

## Migration Steps

### Step 1: Identify Query Pattern

**Old Pattern (Direct Supabase):**
```typescript
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('client_id', userId)
  .order('starts_at', { ascending: false })
```

**New Pattern (Query Helper):**
```typescript
import { getClientBookings } from '@/lib/query-helpers'
const bookings = await getClientBookings(userId)
```

### Step 2: Replace with Query Helper

1. Import the query helper function
2. Remove direct Supabase query
3. Call the helper function
4. Handle errors appropriately

### Step 3: Add Type Annotations

```typescript
import type { Booking } from '@/lib/validation-schemas'

export async function GET(request: NextRequest) {
  const bookings: Booking[] = await getClientBookings(userId)
  return NextResponse.json(bookings)
}
```

### Step 4: Test

- [ ] Test with valid data
- [ ] Test with invalid data
- [ ] Verify RLS policies work
- [ ] Check error handling
- [ ] Verify type safety

### Step 5: Deploy

- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Run tests
- [ ] Deploy to staging
- [ ] Verify in production

## Available Query Helpers

### Bookings
- `getBooking(id)` - Get single booking
- `getClientBookings(clientId)` - Get all client bookings
- `createBooking(input)` - Create new booking
- `updateBooking(id, input)` - Update booking

### Invoices
- `getInvoice(id)` - Get single invoice
- `getClientInvoices(clientId)` - Get all client invoices
- `createInvoice(input)` - Create new invoice
- `updateInvoice(id, input)` - Update invoice

### Contracts
- `getContract(id)` - Get single contract
- `getClientContracts(clientId)` - Get all client contracts
- `createContract(input)` - Create new contract
- `updateContract(id, input)` - Update contract

### Deliverables
- `getDeliverable(id)` - Get single deliverable
- `getClientDeliverables(clientId)` - Get all client deliverables
- `createDeliverable(input)` - Create new deliverable
- `updateDeliverable(id, input)` - Update deliverable

### Project Milestones
- `getProjectMilestone(id)` - Get single milestone
- `getClientProjectMilestones(clientId)` - Get all client milestones
- `createProjectMilestone(input)` - Create new milestone
- `updateProjectMilestone(id, input)` - Update milestone

### Milestone Updates
- `getMilestoneUpdate(id)` - Get single update
- `getMilestoneUpdates(milestoneId)` - Get all updates for milestone
- `createMilestoneUpdate(input)` - Create new update

## Error Handling

All query helpers throw errors on failure. Wrap in try-catch:

```typescript
try {
  const booking = await getBooking(id)
  return NextResponse.json(booking)
} catch (error) {
  console.error('Error fetching booking:', error)
  return NextResponse.json(
    { error: 'Failed to fetch booking' },
    { status: 500 }
  )
}
```

## Validation

All inputs are validated with Zod. Invalid data throws:

```typescript
try {
  await createBooking({ /* invalid data */ })
} catch (error) {
  // Zod validation error
  console.error(error.message)
}
```

## RLS Policy Verification

Query helpers respect RLS policies. To verify:

1. Test with different user IDs
2. Verify only authorized data is returned
3. Check Supabase logs for policy enforcement

## Performance Notes

- Query helpers use Supabase REST API (no connection pooling needed)
- Works on free tier
- Suitable for production use
- Consider caching for frequently accessed data

## Rollback Plan

If issues occur:
1. Revert to direct Supabase queries
2. Check error logs
3. Verify RLS policies
4. Try again with corrected data

