# REST API + Zod Implementation Guide

## Overview

This guide explains how to use Supabase REST API with Zod validation for type-safe database queries on the free tier.

## Why This Approach?

✅ **No connection issues** - REST API works on free tier  
✅ **Type-safe** - Zod validates all data  
✅ **RLS policies enforced** - Security maintained  
✅ **Zero cost** - Free tier compatible  
✅ **Production-ready** - Same pattern used in production  

## Architecture

```
┌─────────────────────────────────────────┐
│   React Component / API Route           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Zod Schema (Input Validation)         │
│   - Validates user input                │
│   - Type inference                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Service Layer (lib/*)                 │
│   - Supabase REST API calls             │
│   - Business logic                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Zod Schema (Output Validation)        │
│   - Validates database response         │
│   - Type inference                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Supabase PostgreSQL                   │
│   - RLS policies enforced               │
│   - Data persisted                      │
└─────────────────────────────────────────┘
```

## Key Files

- `lib/validation-schemas.ts` - All Zod schemas
- `lib/supabase.ts` - Supabase client setup
- `lib/*-service.ts` - Service layer with REST API calls
- `app/api/*` - API routes with validation

## Implementation Steps

### Step 1: Define Zod Schemas
Create schemas for each table with input/output variants

### Step 2: Create Query Helpers
Build reusable functions for common queries

### Step 3: Update Services
Integrate Zod validation into existing services

### Step 4: Use in Components
Call services from components with full type safety

## Example Pattern

```typescript
// 1. Define schema
const BookingSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  title: z.string(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  status: z.enum(['confirmed', 'cancelled', 'rescheduled']),
});

// 2. Create service function
async function getBooking(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();
  
  return BookingSchema.parse(data);
}

// 3. Use in component
const booking = await getBooking(bookingId);
// booking is fully typed!
```

## Next Steps

1. Review `docs/ZOD_SCHEMAS_COMPLETE.md` for all schemas
2. Check `docs/QUERY_HELPERS_GUIDE.md` for helper functions
3. See `docs/SERVICE_INTEGRATION_GUIDE.md` for service updates
4. Run tests to verify everything works

## Benefits

✅ Type-safe queries  
✅ Runtime validation  
✅ Better error messages  
✅ IDE autocomplete  
✅ Production-ready  
✅ No infrastructure changes  

